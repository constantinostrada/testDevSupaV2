/**
 * UI sobre la capa de storage: alta, correccion y baja de gastos, lista de lo
 * cargado y resumen del mes en curso.
 *
 * El resumen y la lista se derivan de listExpenses() en cada render. No hay
 * totales guardados aparte: corregir o borrar un gasto no puede dejar el
 * resumen desfasado, porque el resumen no es un estado, es una cuenta.
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
  summaryTotal: document.getElementById('summary-total'),
  summaryCategories: document.getElementById('summary-categories'),
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

function renderSummary(expenses) {
  const prefix = currentMonthPrefix();
  const ofMonth = expenses.filter((e) => e.date.startsWith(prefix));

  const total = ofMonth.reduce((sum, e) => sum + e.amountCents, 0);
  el.summaryTotal.textContent = formatAmount(total);

  // Solo las categorias con gasto: una lista de ceros no le dice nada a nadie.
  const byCategory = new Map();
  for (const e of ofMonth) {
    const id = getCategory(e.categoryId).id;
    byCategory.set(id, (byCategory.get(id) || 0) + e.amountCents);
  }

  const rows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  el.summaryCategories.replaceChildren(
    ...rows.map(([id, cents]) => {
      const cat = getCategory(id);
      const li = document.createElement('li');
      li.className = 'summary__category';
      li.dataset.categoryId = id;

      const name = document.createElement('span');
      name.textContent = `${cat.emoji} ${cat.label}`;
      const value = document.createElement('span');
      value.className = 'summary__category-amount';
      value.textContent = formatAmount(cents);

      li.append(name, value);
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

/** Unico punto de re-pintado: lista y resumen salen siempre del mismo dato. */
function render() {
  const expenses = listExpenses();
  renderSummary(expenses);
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
render();

// El service worker es solo la capa de cache que hace que la app abra sin
// conexion. Falla en silencio: la app funciona igual sin el.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
