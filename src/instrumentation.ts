/**
 * Next.js instrumentation hook – runs once when the server starts,
 * before any page or API route is evaluated.
 *
 * Node.js >=22 ships with a built-in `globalThis.localStorage` backed by
 * `--localstorage-file`. When the path is missing or invalid the getter
 * returns an object whose prototype has no Storage methods (`getItem`,
 * `setItem`, …), which crashes any code that calls them on the server.
 *
 * We detect this broken state and replace the property with a simple
 * in-memory shim so SSR never throws.
 */
export function register() {
  if (typeof window !== 'undefined') {
    return;
  }

  const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  if (!desc) {
    return;
  }

  let current: unknown;
  try {
    current = (globalThis as Record<string, unknown>).localStorage;
  } catch {
    current = undefined;
  }

  const isUsable =
    current != null &&
    typeof (current as Storage).getItem === 'function' &&
    typeof (current as Storage).setItem === 'function' &&
    typeof (current as Storage).removeItem === 'function';

  if (isUsable) {
    return;
  }

  const store = new Map<string, string>();

  const shim: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
  };

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      get: () => shim,
      configurable: true,
    });
  } catch {
    // Property may be non-configurable in some runtimes.
  }
}
