export class Store {
  private _state: any;
  private _listeners = new Set<(state: any) => void>();
  private _pending = false;
  private _storageKey: string | null;

  /**
   * @param initialState Initial data if nothing is found in storage
   * @param storageKey Optional key to enable LocalStorage persistence
   */
  constructor(initialState: any = {}, storageKey: string | null = null) { 
    this._storageKey = storageKey;
    
    // 1. HYDRATION: Load from LocalStorage if key is provided
    if (this._storageKey) {
      const saved = localStorage.getItem(this._storageKey);
      this._state = saved ? JSON.parse(saved) : initialState;
    } else {
      this._state = initialState;
    }
  }

  get state() { return this._state; }

  set(key: string, value: any) {
    if (this._state[key] === value) return; // Basic dirty check
    this._state = { ...this._state, [key]: value };

    // 2. PERSISTENCE: Save to LocalStorage immediately
    if (this._storageKey) {
      localStorage.setItem(this._storageKey, JSON.stringify(this._state));
    }

    this._notify();
  }

  private _notify() {
    if (this._pending) return;
    this._pending = true;
    queueMicrotask(() => {
      this._pending = false;
      this._listeners.forEach(fn => fn(this._state));
    });
  }

  /**
   * Returns an unsubscribe function to prevent memory leaks
   */
  subscribe(fn: (state: any) => void) {
    this._listeners.add(fn);
    return () => this.unsubscribe(fn); // 3. AUTO-UNSUBSCRIBE PATTERN
  }

  unsubscribe(fn: (state: any) => void) {
    this._listeners.delete(fn);
  }
}

// Usage: Persistence is enabled by passing a key as the second argument
//export const store = new Store({ cartCount1: 0, user: 'Guest' }, 'my_app_store');


