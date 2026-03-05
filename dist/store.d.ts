export interface StoreOptions {
    storageKey?: string | null;
    debug?: boolean;
}
export declare class Store {
    private _state;
    private _listeners;
    private _pending;
    private _storageKey;
    private _debug;
    /**
     * @param initialState Initial data if nothing is found in storage
     * @param options Configuration for persistence and debugging
     */
    constructor(initialState?: any, options?: StoreOptions);
    /**
     * Returns the current state (Read-only recommended)
     */
    get state(): any;
    /**
     * Updates a specific key in the state.
     * @param key The state property to update
     * @param value The new value
     * @param label Optional manual source label (e.g., 'AsyncAction')
     */
    set(key: string, value: any, label?: string): void;
    /**
     * Internal notify: Batches multiple updates into one microtask
     */
    private _notify;
    /**
     * Registers a listener. Returns an unsubscribe function.
     */
    subscribe(fn: (state: any) => void): () => void;
    /**
     * Removes a listener to prevent memory leaks
     */
    unsubscribe(fn: (state: any) => void): void;
    /**
     * Wipes the persistence layer and reloads the app
     */
    clear(): void;
}
/**
 * USAGE EXAMPLE:
 * export const store = new Store(
 *   { cartCount1: 0, user: 'Guest' },
 *   { storageKey: 'my_app_store', debug: true }
 * );
 */
