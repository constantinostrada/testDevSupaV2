/**
 * Capa de persistencia local de gastos.
 *
 * Todo vive en localStorage del navegador del dispositivo: no hay backend,
 * ni cuentas, ni sincronizacion. Borrar los datos del navegador o cambiar de
 * navegador implica perder el historial.
 *
 * Los montos se guardan como enteros en centavos para que sumarlos no arrastre
 * error de punto flotante. La UI nunca deberia manipular centavos a mano:
 * usar parseAmount() al entrar y formatAmount() al salir.
 */

const STORAGE_KEY = 'gastos.v1';
const SCHEMA_VERSION = 1;

/**
 * Categorias disponibles desde el primer arranque. Viven en codigo, no en
 * storage: asi un dispositivo nuevo ya las tiene sin que el usuario cree nada,
 * y agregar una en el futuro no exige migrar los datos guardados.
 */
export const DEFAULT_CATEGORIES = [
  { id: 'comida', label: 'Comida', emoji: '🍽️' },
  { id: 'transporte', label: 'Transporte', emoji: '🚌' },
  { id: 'super', label: 'Súper', emoji: '🛒' },
  { id: 'salidas', label: 'Salidas', emoji: '🍻' },
  { id: 'servicios', label: 'Servicios', emoji: '💡' },
  { id: 'otros', label: 'Otros', emoji: '📦' },
];

const CATEGORIES_BY_ID = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

/** Categoria mostrada cuando un gasto guardado apunta a un id desconocido. */
const UNKNOWN_CATEGORY = { id: 'otros', label: 'Otros', emoji: '📦' };

export function getCategories() {
  return DEFAULT_CATEGORIES.slice();
}

export function getCategory(id) {
  return CATEGORIES_BY_ID.get(id) || UNKNOWN_CATEGORY;
}

/** true si localStorage esta disponible y se puede escribir en el. */
export function isStorageAvailable() {
  try {
    const probe = '__gastos_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    // Safari en navegacion privada, storage lleno, o cookies bloqueadas.
    return false;
  }
}

function emptyStore() {
  return { schemaVersion: SCHEMA_VERSION, expenses: [] };
}

/**
 * Lee el store completo. Nunca lanza: ante datos corruptos o storage
 * inaccesible devuelve un store vacio, para que la app abra igual.
 */
function readStore() {
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyStore();
  }
  if (!raw) return emptyStore();

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.expenses)) return emptyStore();
    return {
      schemaVersion: Number(parsed.schemaVersion) || SCHEMA_VERSION,
      expenses: parsed.expenses.filter(isValidExpense),
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, expenses: store.expenses })
  );
}

function isValidExpense(e) {
  return (
    e &&
    typeof e.id === 'string' &&
    Number.isInteger(e.amountCents) &&
    e.amountCents > 0 &&
    typeof e.categoryId === 'string' &&
    isISODate(e.date)
  );
}

export function isISODate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Fecha de hoy en horario local (no UTC) como YYYY-MM-DD. */
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Convierte lo tipeado por el usuario a centavos enteros.
 *
 * Acepta punto o coma como separador decimal. Si hay coma, los puntos se leen
 * como separador de miles (formato es-AR: "12.400,50"); si no hay coma, el
 * punto es el decimal ("12.40"), que es lo que produce el teclado numerico.
 * Devuelve null si no es un monto positivo valido.
 */
export function parseAmount(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? Math.round(input * 100) : null;
  }
  if (typeof input !== 'string') return null;

  let normalized = input.trim().replace(/\s/g, '');
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  }
  if (!/^\d*\.?\d*$/.test(normalized) || normalized === '' || normalized === '.') {
    return null;
  }
  const cents = Math.round(Number(normalized) * 100);
  return Number.isFinite(cents) && cents > 0 ? cents : null;
}

/** Formatea centavos para mostrar, p.ej. 123456 -> "$ 1.234,56". */
export function formatAmount(cents) {
  const value = (Number(cents) || 0) / 100;
  return `$ ${value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function newId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Gastos ordenados del mas reciente al mas viejo. */
export function listExpenses() {
  return readStore().expenses.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

/**
 * Guarda un gasto. Lanza Error con mensaje legible si los datos no sirven o
 * si el navegador rechaza la escritura (cuota llena, modo privado).
 */
export function addExpense({ amount, categoryId, date }) {
  const amountCents = parseAmount(amount);
  if (amountCents === null) throw new Error('Ingresá un monto mayor a cero.');
  if (!CATEGORIES_BY_ID.has(categoryId)) throw new Error('Elegí una categoría.');
  if (!isISODate(date)) throw new Error('Elegí una fecha válida.');

  const expense = {
    id: newId(),
    amountCents,
    categoryId,
    date,
    createdAt: new Date().toISOString(),
  };

  const store = readStore();
  store.expenses.push(expense);
  try {
    writeStore(store);
  } catch {
    throw new Error('No se pudo guardar en este navegador.');
  }
  return expense;
}

export function removeExpense(id) {
  const store = readStore();
  const remaining = store.expenses.filter((e) => e.id !== id);
  if (remaining.length === store.expenses.length) return false;
  store.expenses = remaining;
  try {
    writeStore(store);
  } catch {
    throw new Error('No se pudo guardar en este navegador.');
  }
  return true;
}
