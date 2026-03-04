// src/store.ts

export interface StoreOptions {
  storageKey?: string | null;
  debug?: boolean;
}

export class Store {
  private _state: any;
  private _listeners = new Set<(state: any) => void>();
  private _pending = false;
  private _storageKey: string | null;
  private _debug: boolean;

  /**
   * @param initialState Initial data if nothing is found in storage
   * @param options Configuration for persistence and debugging
   */
  constructor(initialState: any = {}, options: StoreOptions = {}) {
    this._storageKey = options.storageKey || null;
    this._debug = options.debug || false;

    // 1. HYDRATION: Load from LocalStorage if key is provided
    if (this._storageKey) {
      const saved = localStorage.getItem(this._storageKey);
      this._state = saved ? JSON.parse(saved) : initialState;
    } else {
      this._state = initialState;
    }
  }

  /**
   * Returns the current state (Read-only recommended)
   */
  get state() {
    return this._state;
  }

  /**
   * Updates a specific key in the state.
   * @param key The state property to update
   * @param value The new value
   * @param label Optional manual source label (e.g., 'AsyncAction')
   */
  set(key: string, value: any, label?: string) {
    // Dirty check: Skip if value hasn't changed (prevents redundant renders)
    if (this._state[key] === value) return;

    // 2. SURGICAL LOGGING: Auto-detects the RedGin component source
    if (this._debug) {
      const instance = (window as any).__redgin_current_instance;
      const source = label || (instance ? `<${instance.localName}>` : 'External/Async');

      console.log(
        `%c 🔴 RedGin Store: %c${key} %cby %c${source} %cupdated to:`,
        'color: #ff4757; font-weight: bold;', 
        'color: #2ed573; font-weight: bold; text-decoration: underline;', 
        'color: #7f8c8d;',
        'color: #3498db; font-weight: bold;', // Component/Label in Blue
        'color: #7f8c8d;',
        value
      );
    }

    // Update state immutably at the top level
    this._state = { ...this._state, [key]: value };

    // 3. PERSISTENCE: Save to LocalStorage
    if (this._storageKey) {
      localStorage.setItem(this._storageKey, JSON.stringify(this._state));
    }

    this._notify();
  }

  /**
   * Internal notify: Batches multiple updates into one microtask
   */
  private _notify() {
    if (this._pending) return;
    this._pending = true;
    queueMicrotask(() => {
      this._pending = false;
      this._listeners.forEach((fn) => fn(this._state));
    });
  }

  /**
   * Registers a listener. Returns an unsubscribe function.
   */
  subscribe(fn: (state: any) => void) {
    this._listeners.add(fn);
    return () => this.unsubscribe(fn);
  }

  /**
   * Removes a listener to prevent memory leaks
   */
  unsubscribe(fn: (state: any) => void) {
    this._listeners.delete(fn);
  }

  /**
   * Wipes the persistence layer and reloads the app
   */
  clear() {
    if (this._storageKey) {
      localStorage.removeItem(this._storageKey);
    }
    location.reload();
  }
}


/** 
 * USAGE EXAMPLE:
 * export const store = new Store(
 *   { cartCount1: 0, user: 'Guest' }, 
 *   { storageKey: 'my_app_store', debug: true } 
 * );
 */
