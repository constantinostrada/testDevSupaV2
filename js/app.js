/**
 * UI sobre la capa de storage: alta, correccion y baja de gastos, lista de lo
 * cargado, totales de hoy y del mes, y la vista Resumen del mes en curso.
 *
 * Los totales, el resumen y la lista se derivan de listExpenses() en cada
 * render. No hay totales guardados aparte: corregir o borrar un gasto no puede
 * dejar el resumen desfasado, porque el resumen no es un estado, es una cuenta.
 */

import {
  addExpense,
  deleteExpense,
  formatAmount,
  getCategories,
  getCategory,
  isStorageAvailable,
  listExpenses,
  restoreExpense,
  todayISO,
  updateExpense,
} from './storage.js';

const el = {
  storageNote: document.getElementById('storage-note'),
  notice: document.getElementById('notice'),
  emptyState: document.getElementById('empty-state'),
  list: document.getElementById('expense-list'),
  summaryTotals: document.querySelector('.summary__totals'),
  summaryToday: document.getElementById('summary-today'),
  summaryTotal: document.getElementById('summary-total'),
  tabs: document.querySelectorAll('.tab'),
  views: {
    gastos: document.getElementById('view-gastos'),
    resumen: document.getElementById('view-resumen'),
  },
  reportMonth: document.getElementById('report-month'),
  reportHero: document.getElementById('report-hero'),
  reportTotal: document.getElementById('report-total'),
  reportEmpty: document.getElementById('report-empty'),
  reportAddBtn: document.getElementById('report-add-btn'),
  reportBreakdown: document.getElementById('report-breakdown'),
  reportBar: document.getElementById('report-bar'),
  reportRows: document.getElementById('report-rows'),
  composer: document.getElementById('composer'),
  form: document.getElementById('expense-form'),
  formTitle: document.getElementById('form-title'),
  openBtn: document.getElementById('open-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  submitBtn: document.getElementById('submit-btn'),
  amount: document.getElementById('amount'),
  date: document.getElementById('date'),
  dateField: document.getElementById('date-field'),
  chips: document.getElementById('category-chips'),
  error: document.getElementById('form-error'),
  toast: document.getElementById('undo-toast'),
  undoBtn: document.getElementById('undo-btn'),
};

/** Segundos que el gasto borrado sigue siendo recuperable. */
const UNDO_MS = 5000;

let selectedCategoryId = getCategories()[0].id;
/** id del gasto que se esta corrigiendo, o null si el form es de alta. */
let editingId = null;

/* ---------- Render ---------- */

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric',
});

const percentFormatter = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(iso) {
  // Partir el ISO a mano: new Date('2026-08-31') se parsea como UTC y en
  // husos al oeste de Greenwich muestra el dia anterior.
  const [y, m, d] = iso.split('-').map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
}

/** Prefijo YYYY-MM del mes en curso, en horario local igual que todayISO(). */
function currentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

/** Nombre del mes de un prefijo YYYY-MM, p.ej. "2026-09" -> "Septiembre de 2026". */
function formatMonth(prefix) {
  const [y, m] = prefix.split('-').map(Number);
  const text = monthFormatter.format(new Date(y, m - 1, 1));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Centavos a lo que se tipea en el campo Monto, p.ej. 123456 -> "1234,56". */
function amountToInput(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function renderCategories() {
  el.chips.replaceChildren(
    ...getCategories().map((cat) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.role = 'radio';
      chip.dataset.categoryId = cat.id;
      chip.textContent = `${cat.emoji} ${cat.label}`;
      chip.setAttribute('aria-checked', String(cat.id === selectedCategoryId));
      chip.addEventListener('click', () => selectCategory(cat.id));
      return chip;
    })
  );
}

function selectCategory(id) {
  selectedCategoryId = id;
  for (const chip of el.chips.children) {
    chip.setAttribute('aria-checked', String(chip.dataset.categoryId === id));
  }
}

/**
 * Deja visible el chip elegido dentro del carrusel de categorias.
 *
 * Al corregir un gasto de una categoria de las ultimas, el chip marcado queda
 * fuera de la parte visible y parece que no hubiera ninguna elegida. Se mueve
 * scrollLeft a mano en vez de scrollIntoView() para no arrastrar tambien la
 * pagina entera.
 */
function revealSelectedChip() {
  const chip = el.chips.querySelector('[aria-checked="true"]');
  if (!chip) return;
  // Por rects y no por offsetLeft: el offsetParent de los chips es .composer
  // (position: fixed), asi que offsetLeft no mide contra el carrusel.
  const chipBox = chip.getBoundingClientRect();
  const listBox = el.chips.getBoundingClientRect();
  const delta = chipBox.left - listBox.left - (listBox.width - chipBox.width) / 2;
  el.chips.scrollLeft = Math.max(0, el.chips.scrollLeft + delta);
}

function sumCents(expenses) {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0);
}

function renderSummary(expenses) {
  const prefix = currentMonthPrefix();
  const ofMonth = expenses.filter((e) => e.date.startsWith(prefix));

  // "Hoy" es la fecha local del dispositivo, el mismo criterio con el que se
  // guarda expense.date. Sin gastos el total queda en cero, no se oculta.
  const today = todayISO();
  const todayText = formatAmount(sumCents(expenses.filter((e) => e.date === today)));
  const monthText = formatAmount(sumCents(ofMonth));
  el.summaryToday.textContent = todayText;
  el.summaryTotal.textContent = monthText;

  // El CSS ajusta el cuerpo de los dos totales al largo del mas largo, para que
  // un monto de millones entre en la columna sin partirse ni desbordar.
  el.summaryTotals.style.setProperty(
    '--total-chars',
    String(Math.max(todayText.length, monthText.length))
  );
}

/* ---------- Resumen del mes ---------- */

/**
 * Reparte 100 puntos entre montos enteros por mayor resto: los porcentajes
 * enteros suman exactamente 100. Redondear cada uno por separado deja sumas de
 * 99 o 101 que el usuario lee como un error de cuentas.
 */
function percentages(values) {
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total === 0) return values.map(() => 0);
  const exact = values.map((v) => (v * 100) / total);
  const floors = exact.map(Math.floor);
  let remaining = 100 - floors.reduce((sum, v) => sum + v, 0);
  const order = exact
    .map((v, i) => ({ i, rest: v - floors[i] }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i);
  for (const { i } of order) {
    if (remaining <= 0) break;
    floors[i] += 1;
    remaining -= 1;
  }
  return floors;
}

/**
 * Agrupa por categoria, de mayor a menor. Los gastos sin categoria valida caen
 * en el bucket UNCATEGORIZED via getCategory(): siguen sumando al total y se
 * ven como grupo propio, no se pierden ni se mezclan con "Otros".
 */
function groupByCategory(expenses) {
  const byCategory = new Map();
  for (const e of expenses) {
    const id = getCategory(e.categoryId).id;
    byCategory.set(id, (byCategory.get(id) || 0) + e.amountCents);
  }
  return [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, cents]) => ({ category: getCategory(id), cents }));
}

function renderReport(expenses) {
  const prefix = currentMonthPrefix();
  const ofMonth = expenses.filter((e) => e.date.startsWith(prefix));
  const totalCents = sumCents(ofMonth);

  // El periodo se nombra siempre, con o sin gastos: es lo que le dice al usuario
  // de que esta mirando el total.
  el.reportMonth.textContent = formatMonth(prefix);

  const isEmpty = ofMonth.length === 0;
  el.reportEmpty.hidden = !isEmpty;
  el.reportHero.hidden = isEmpty;
  el.reportBreakdown.hidden = isEmpty;
  if (isEmpty) {
    el.reportBar.replaceChildren();
    el.reportRows.replaceChildren();
    return;
  }

  const totalText = formatAmount(totalCents);
  el.reportTotal.textContent = totalText;
  el.reportHero.style.setProperty('--total-chars', String(totalText.length));

  const groups = groupByCategory(ofMonth);
  const pcts = percentages(groups.map((g) => g.cents));
  const maxCents = groups[0].cents;

  // El color va con la categoria, no con el puesto: la misma categoria tiene el
  // mismo color aunque cambie de lugar en el ranking de un mes a otro.
  const colorOf = (cat) => `var(--cat-${cat.id}, var(--cat-fallback))`;

  el.reportBar.replaceChildren(
    ...groups.map((g) => {
      const seg = document.createElement('span');
      seg.className = 'report__segment';
      seg.style.flexGrow = String(g.cents);
      seg.style.background = colorOf(g.category);
      return seg;
    })
  );

  el.reportRows.replaceChildren(
    ...groups.map((g, i) => {
      const cat = g.category;
      const li = document.createElement('li');
      li.className = 'report__row';
      li.dataset.categoryId = cat.id;
      li.style.setProperty('--c', colorOf(cat));

      const name = document.createElement('span');
      name.className = 'report__name';
      name.textContent = `${cat.emoji} ${cat.label}`;

      const pct = document.createElement('span');
      pct.className = 'report__pct';
      pct.textContent = percentFormatter.format(pcts[i] / 100);

      const amount = document.createElement('span');
      amount.className = 'report__amount';
      amount.textContent = formatAmount(g.cents);

      // Largo relativo a la categoria mayor: el ranking se lee de un vistazo.
      // La parte sobre el total ya la dicen el porcentaje y la barra apilada.
      const track = document.createElement('span');
      track.className = 'report__track';
      track.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.className = 'report__fill';
      fill.style.width = `${(g.cents * 100) / maxCents}%`;
      track.append(fill);

      li.append(name, pct, amount, track);
      return li;
    })
  );
}

function renderList(expenses) {
  el.emptyState.hidden = expenses.length > 0;

  el.list.replaceChildren(
    ...expenses.map((expense) => {
      const cat = getCategory(expense.categoryId);
      const amountText = formatAmount(expense.amountCents);

      const item = document.createElement('li');
      item.className = 'expense';
      item.dataset.id = expense.id;

      // La fila entera es el boton de editar; borrar es un boton aparte, para
      // que un toque no pueda confundir una cosa con la otra.
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'expense__open';
      open.setAttribute('aria-label', `Editar gasto de ${amountText} en ${cat.label}`);

      const emoji = document.createElement('span');
      emoji.className = 'expense__emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = cat.emoji;

      const body = document.createElement('div');
      body.className = 'expense__body';
      const name = document.createElement('span');
      name.className = 'expense__category';
      name.textContent = cat.label;
      const when = document.createElement('span');
      when.className = 'expense__date';
      when.textContent = formatDate(expense.date);
      body.append(name, when);

      const amount = document.createElement('span');
      amount.className = 'expense__amount';
      amount.textContent = amountText;

      open.append(emoji, body, amount);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'expense__delete';
      del.textContent = '✕';
      del.setAttribute('aria-label', `Borrar gasto de ${amountText} en ${cat.label}`);

      item.append(open, del);
      return item;
    })
  );
}

/* ---------- Cambio de dia ---------- */

/**
 * Dia local que refleja lo pintado. Con la app abierta cruzando la medianoche,
 * el total de "Hoy" pasaria a ser el de ayer si nadie vuelve a renderizar.
 */
let renderedDay = null;
let dayTimer = null;

/** Re-render al primer segundo del dia siguiente, para que se ajuste solo. */
function scheduleDayRollover() {
  clearTimeout(dayTimer);
  const now = new Date();
  // Por componentes locales y no sumando 24h: asi cae bien tambien en los dias
  // de cambio de horario, que no tienen 24 horas exactas.
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  dayTimer = setTimeout(render, nextDay - now);
}

/**
 * Red de contencion del timer: en segundo plano el navegador lo throttlea o lo
 * suspende, asi que al volver a la app se vuelve a chequear el dia a mano.
 */
function renderIfDayChanged() {
  if (renderedDay !== null && renderedDay !== todayISO()) render();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderIfDayChanged();
});
window.addEventListener('focus', renderIfDayChanged);

/* ---------- Navegacion ---------- */

/** Vista que pide la URL. Cualquier hash que no sea #resumen es la lista. */
function currentView() {
  return location.hash === '#resumen' ? 'resumen' : 'gastos';
}

/**
 * Muestra la vista del hash y marca su pestaña. Las dos vistas se pintan
 * siempre en render(); aca solo se decide cual se ve, asi cambiar de pestaña
 * no recalcula nada y el resumen ya esta al dia cuando aparece.
 */
function renderNav() {
  const view = currentView();
  for (const [name, section] of Object.entries(el.views)) {
    section.hidden = name !== view;
  }
  for (const tab of el.tabs) {
    if (tab.getAttribute('href') === `#${view}`) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
}

window.addEventListener('hashchange', () => {
  renderNav();
  window.scrollTo(0, 0);
});

/* ---------- Render ---------- */

/** Unico punto de re-pintado: lista, totales y resumen salen del mismo dato. */
function render() {
  const expenses = listExpenses();
  renderedDay = todayISO();
  scheduleDayRollover();
  renderSummary(expenses);
  renderReport(expenses);
  renderList(expenses);
}

/* ---------- Avisos ---------- */

function showNotice(message) {
  el.notice.textContent = message;
  el.notice.hidden = !message;
}

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = !message;
}

/* ---------- Tap vs. scroll ---------- */

/**
 * Un toque cuenta como toque solo si el dedo casi no se movio. Sin esto, un
 * scroll de la lista que arranca sobre una fila puede terminar abriendo la
 * edicion o borrando el gasto.
 */
const TAP_SLOP_PX = 10;
let tap = null;

el.list.addEventListener(
  'pointerdown',
  (event) => {
    tap = { x: event.clientX, y: event.clientY, moved: false };
  },
  { passive: true }
);

el.list.addEventListener(
  'pointermove',
  (event) => {
    if (!tap) return;
    if (
      Math.abs(event.clientX - tap.x) > TAP_SLOP_PX ||
      Math.abs(event.clientY - tap.y) > TAP_SLOP_PX
    ) {
      tap.moved = true;
    }
  },
  { passive: true }
);

el.list.addEventListener('pointercancel', () => {
  if (tap) tap.moved = true;
});

window.addEventListener(
  'scroll',
  () => {
    if (tap) tap.moved = true;
  },
  { passive: true }
);

/** true si el gesto en curso fue un toque limpio. Lo consume: vale una vez. */
function consumeTap() {
  const clean = !tap || !tap.moved;
  tap = null;
  return clean;
}

/* ---------- Lista: editar y borrar ---------- */

el.list.addEventListener('click', (event) => {
  const open = event.target.closest('.expense__open');
  const del = event.target.closest('.expense__delete');
  if (!open && !del) return;

  // El teclado dispara click sin pointerdown previo: ahi tap es null y pasa.
  if (!consumeTap()) return;

  const id = (open || del).closest('.expense').dataset.id;
  if (open) startEdit(id);
  else removeWithUndo(id);
});

function startEdit(id) {
  const expense = listExpenses().find((e) => e.id === id);
  if (!expense) {
    render();
    return;
  }
  openForm(expense);
}

/* ---------- Borrado con deshacer ---------- */

let undoTimer = null;
let undoId = null;

function hideUndo() {
  clearTimeout(undoTimer);
  undoTimer = null;
  undoId = null;
  el.toast.hidden = true;
}

function removeWithUndo(id) {
  // Una sola ventana viva a la vez: el borrado anterior queda firme.
  hideUndo();
  showNotice('');

  if (editingId === id) closeForm();

  try {
    if (!deleteExpense(id)) {
      render();
      return;
    }
  } catch (err) {
    showNotice(err.message);
    render();
    return;
  }

  render();

  undoId = id;
  el.toast.hidden = false;
  // Pasada la ventana el toast se va y la baja queda definitiva. Ya estaba
  // persistida desde el primer momento, asi que cerrar la app no la revierte.
  undoTimer = setTimeout(hideUndo, UNDO_MS);
}

el.undoBtn.addEventListener('click', () => {
  const id = undoId;
  hideUndo();
  if (!id) return;
  try {
    restoreExpense(id);
  } catch (err) {
    showNotice(err.message);
  }
  render();
});

/* ---------- Formulario ---------- */

function openForm(expense = null) {
  editingId = expense ? expense.id : null;

  el.form.hidden = false;
  el.openBtn.hidden = true;
  showError('');

  if (expense) {
    el.formTitle.textContent = 'Editar gasto';
    el.submitBtn.textContent = 'Guardar cambios';
    el.amount.value = amountToInput(expense.amountCents);
    selectCategory(getCategory(expense.categoryId).id);
    revealSelectedChip();
  } else {
    el.formTitle.textContent = 'Nuevo gasto';
    el.submitBtn.textContent = 'Guardar';
    el.amount.value = '';
    el.date.value = todayISO();
    selectCategory(getCategories()[0].id);
    el.chips.scrollLeft = 0;
  }

  // En esta entrega la fecha no se corrige. Se le saca el required junto con
  // ocultarlo: un input required invisible bloquea el submit del formulario.
  el.dateField.hidden = Boolean(expense);
  el.date.required = !expense;

  el.amount.focus();
  el.amount.select();
}

function closeForm() {
  editingId = null;
  el.form.hidden = true;
  el.openBtn.hidden = false;
  showError('');
}

el.openBtn.addEventListener('click', () => openForm());
el.reportAddBtn.addEventListener('click', () => openForm());
el.cancelBtn.addEventListener('click', closeForm);

el.form.addEventListener('submit', (event) => {
  event.preventDefault();
  showNotice('');

  try {
    if (editingId) {
      // Si el gasto ya no esta (borrado en otra pestaña), no se inventa uno.
      if (!updateExpense(editingId, {
        amount: el.amount.value,
        categoryId: selectedCategoryId,
      })) {
        showError('Ese gasto ya no existe.');
        return;
      }
    } else {
      addExpense({
        amount: el.amount.value,
        categoryId: selectedCategoryId,
        date: el.date.value,
      });
    }
  } catch (err) {
    // Validacion o escritura rechazada: el gasto queda como estaba.
    showError(err.message);
    return;
  }

  const wasEditing = Boolean(editingId);
  closeForm();
  render();
  if (!wasEditing) window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Arranque ---------- */

if (!isStorageAvailable()) {
  el.storageNote.hidden = false;
}

renderCategories();
renderNav();
render();

// El service worker es solo la capa de cache que hace que la app abra sin
// conexion. Falla en silencio: la app funciona igual sin el.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
