# RedGin Store

**A Lightweight, Reactive, and Persistent State Management for Web Components.**

RedGin Store is a surgically optimized Pub/Sub state manager designed specifically for the [RedGin Library](https://www.npmjs.com). It provides global reactivity with **zero Virtual DOM overhead**, built-in **LocalStorage persistence**, and **automatic microtask batching**.

---

## The Pain Points
Building complex Web Components usually leads to several major headaches:
*   **Prop Drilling:** Passing data through five layers of nested components just to update a single value.
*   **Zombie Listeners (Memory Leaks):** Global store listeners that stay in RAM after a component is destroyed, leading to "ghost" updates and performance degradation.
*   **State Loss on Refresh:** Disappearing shopping carts or user sessions because the state only lives in volatile memory.
*   **Redundant Re-renders:** Most stores trigger a full UI update on every change. If you update the `user`, you shouldn't re-render the `productList`.

---

## Purpose & Features
RedGin Store provides a **Single Source of Truth** that is:
*   🚀 **Surgically Reactive:** Leverages `queueMicrotask` to batch multiple updates into a single tick.
*   💾 **Persistent by Design:** Optional LocalStorage integration—hydrate your state automatically on page load.
*   🛡️ **Memory Safe:** Returns an **Unsubscribe function** to ensure components are garbage-collected when removed from the DOM.
*   🔍 **Built-in Debugger:** Concise console logging that **auto-detects** which component triggered the update.
*   📦 **Zero Dependencies:** Extremely small footprint (~1kb).

---

## Installation

### Via npm
```bash
npm i redgin-store
```

## Via CDN

```js
<script type="module" src="https://cdn.jsdelivr.net/npm/redgin-store@latest/dist/redgin-store.min.js"></script>
```


# Quick Start
1. Define your Store
Create a singleton instance. Pass a storageKey as the second argument to enable persistence.

```ts
// store.ts
// store.ts
import { Store } from 'redgin-store';

const initialState = { 
  cart: [], 
  user: 'Guest' 
};

// Second argument is the Options Object
export const store = new Store(initialState, {
  storageKey: 'my_market_app', // Syncs state to LocalStorage
  debug: true                  // Enables component-trace logging
});

```


2. Connect to a RedGin Component
Use onInit to subscribe and disconnectedCallback to clean up.

```ts
import { RedGin, watch, getset, html, on } from "redgin";
import { store } from "./store";

class ShoppingCart extends RedGin {
  global = getset(store.state);
  private _unsub?: () => void;

  onInit() {
    // Subscribe and save the cleanup function
    this._unsub = store.subscribe(newState => this.global = newState);
  }

  disconnectedCallback() {
    // CRITICAL: Unplug from store to prevent memory leaks
    if (this._unsub) this._unsub();
    super.disconnectedCallback();
  }

  render() {
    return html`
      <div>
        <h3>Items: ${watch(['global'], () => this.global.cart.length)}</h3>
        <button ${on('click', () => store.set('cart', [...this.global.cart, { id: Date.now() }]))}>
          Add Item
        </button>
      </div>
    `;
  }
}

customElements.define('shopping-cart', ShoppingCart);

```

# Surgical Logging
When debug: true is enabled, RedGin Store auto-detects the component instance using the RedGin Context Bridge. Your console will show exactly who triggered the change in a concise, one-line format:

`🔴 RedGin Store: cart by <shopping-cart> updated to: [{id: 12345}]`

For async actions or external scripts where context might be lost, you can provide a manual label:

```ts
store.set('user', 'Admin', 'Auth_Service');
// Console: 🔴 RedGin Store: user by Auth_Service updated to: Admin
```



### API Reference
`new Store(initialState, storageKey?)`

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `initialState` | Object | The starting data for your store. |
| `storageKey` | string | (Optional) The key name for LocalStorage persistence |
| `debug` | boolen | (Optional) Enables styled console logs with source tracking |

`store.set(key, value, label?)`

Updates a specific top-level key in the state. Triggers a batched notification to all subscribers.

* key: The property name in your state.
* value: The new value (must use immutable patterns like [...arr] for reactivity).
* label: (Optional) A string to identify the source in logs

`store.subscribe(callback)`

Registers a listener. Returns an unsubscribe function

```js
const unsub = store.subscribe(state => console.log(state));
unsub(); // Stop listening
```

`store.clear()`
Wipes the LocalStorage data and reloads the page to reset the application state.


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



