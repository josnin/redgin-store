# RedGin Store
A Lightweight, Reactive, and Persistent State Management for Web Components.
RedGin Store is a surgically optimized Pub/Sub state manager designed to complement the [RedGin Library](https://www.npmjs.com/package/redgin). It provides global reactivity with zero Virtual DOM overhead, built-in LocalStorage persistence, and automatic batching.


# The Pain Points
Building complex Web Components usually leads to three major headaches:
Prop Drilling: Passing data through five layers of nested components just to update a header.
Zombie Listeners (Memory Leaks): Global event listeners that stay in RAM after a component is destroyed, leading to "ghost" updates and performance degradation.
State Loss on Refresh: Disappearing shopping carts or user sessions because the state only lives in volatile memory.
Redundant Re-renders: Most stores trigger a full UI update on every change. If you update the user, you shouldn't re-render the productList.


# Purpose & Features
RedGin Store was built to provide Single Source of Truth that is:
* 🚀 Surgically Reactive: Leverages queueMicrotask to batch multiple updates into a single tick.
* 💾 Persistent by Design: Optional LocalStorage integration—hydrate your state automatically on page load.
* 🛡️ Memory Safe: Implements the Auto-Unsubscribe Pattern to ensure components are garbage-collected when removed from the DOM.
* ⚛️ Immutable & Type-Safe: Uses reference-based dirty checking to ensure high-performance updates.
* 📦 Zero Dependencies: Extremely small footprint (~1kb).

# Quick Start
1. Define your Store
Create a singleton instance. Pass a storageKey as the second argument to enable persistence.

```ts
// store.ts
import { Store } from './redgin-store';

const initialState = { 
  cart: [], 
  user: 'Guest',
  theme: 'light' 
};

// 'market_storage' is the key used in LocalStorage
export const store = new Store(initialState, 'market_storage');

```


2. Connect to a RedGin Component
Use onInit to subscribe and disconnectedCallback to clean up.

```ts
import { RedGin, watch, getset, html } from "redgin";
import { store } from "./store";

class ShoppingCart extends RedGin {
  global = getset(store.state);
  private _unsub?: () => void;

  onInit() {
    // Subscribe and store the cleanup function
    this._unsub = store.subscribe(newState => this.global = newState);
  }

  disconnectedCallback() {
    // CRITICAL: Unplug from store to prevent memory leaks
    if (this._unsub) this._unsub();
    super.disconnectedCallback();
  }

  addItem() {
    const newItem = { id: Date.now(), name: 'New Item' };
    // Update global state
    store.set('cart', [...this.global.cart, newItem]);
  }

  render() {
    return html`
      <div>
        <h3>Items: ${watch(['global'], () => this.global.cart.length)}</h3>
        <button onclick="${() => this.addItem()}">Add Item</button>
      </div>
    `;
  }
}

```

### API Reference
`new Store(initialState, storageKey?)`

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `initialState` | Object | The starting data for your store. |
| `storageKey` | string | (Optional) The key name for LocalStorage persistence |

`store.set(key, value)`

Updates a specific top-level key in the state. Triggers a batched notification to all subscribers.
* Note: Use immutable patterns (spread operator) for arrays and objects to ensure reactivity.

`store.subscribe(callback)`

Registers a listener. Returns an unsubscribe function

```js
const unsub = store.subscribe(state => console.log(state));
unsub(); // Stop listening
```

# Performance Tip: Batching
RedGin Store uses Microtask Batching. If you execute:

```js
store.set('user', 'Admin');
store.set('theme', 'dark');
store.set('cart', []);
```

The UI will only re-render once at the end of the execution block, preventing expensive layout thrashing.

## Help

Need help? Open an issue in: [ISSUES](https://github.com/josnin/redgin-store/issues)


## Contributing
Want to improve and add feature? Fork the repo, add your changes and send a pull request.



