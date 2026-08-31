/**
 * UI minima sobre la capa de storage: alta de un gasto y lista de lo guardado.
 * Existe para que la base sea verificable de punta a punta; las tareas que
 * siguen (alta en dos toques, lista por mes, resumen) la reemplazan.
 */

import {
  addExpense,
  formatAmount,
  getCategories,
  getCategory,
  isStorageAvailable,
  listExpenses,
  removeExpense,
  todayISO,
} from './storage.js';

const el = {
  storageNote: document.getElementById('storage-note'),
  emptyState: document.getElementById('empty-state'),
  list: document.getElementById('expense-list'),
  composer: document.getElementById('composer'),
  form: document.getElementById('expense-form'),
  openBtn: document.getElementById('open-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  amount: document.getElementById('amount'),
  date: document.getElementById('date'),
  chips: document.getElementById('category-chips'),
  error: document.getElementById('form-error'),
};

let selectedCategoryId = getCategories()[0].id;

/* ---------- Render ---------- */

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

function formatDate(iso) {
  // Partir el ISO a mano: new Date('2026-08-31') se parsea como UTC y en
  // husos al oeste de Greenwich muestra el dia anterior.
  const [y, m, d] = iso.split('-').map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
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

function renderList() {
  const expenses = listExpenses();
  el.emptyState.hidden = expenses.length > 0;

  el.list.replaceChildren(
    ...expenses.map((expense) => {
      const cat = getCategory(expense.categoryId);

      const item = document.createElement('li');
      item.className = 'expense';

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
      amount.textContent = formatAmount(expense.amountCents);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'expense__delete';
      del.textContent = '✕';
      del.setAttribute(
        'aria-label',
        `Borrar gasto de ${formatAmount(expense.amountCents)} en ${cat.label}`
      );
      // Sin confirm(): un dialogo modal del navegador rompe el flujo en mobile.
      del.addEventListener('click', () => {
        removeExpense(expense.id);
        renderList();
      });

      item.append(emoji, body, amount, del);
      return item;
    })
  );
}

/* ---------- Formulario ---------- */

function showError(message) {
  el.error.textContent = message;
  el.error.hidden = !message;
}

function openForm() {
  el.form.hidden = false;
  el.openBtn.hidden = true;
  el.amount.value = '';
  el.date.value = todayISO();
  selectCategory(getCategories()[0].id);
  showError('');
  el.amount.focus();
}

function closeForm() {
  el.form.hidden = true;
  el.openBtn.hidden = false;
  showError('');
}

el.openBtn.addEventListener('click', openForm);
el.cancelBtn.addEventListener('click', closeForm);

el.form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    addExpense({
      amount: el.amount.value,
      categoryId: selectedCategoryId,
      date: el.date.value,
    });
  } catch (err) {
    showError(err.message);
    return;
  }
  closeForm();
  renderList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Arranque ---------- */

if (!isStorageAvailable()) {
  el.storageNote.hidden = false;
}

renderCategories();
renderList();

// El service worker es solo la capa de cache que hace que la app abra sin
// conexion. Falla en silencio: la app funciona igual sin el.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
