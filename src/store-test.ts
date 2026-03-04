
import { RedGin, getset, html, watch, on } from 'redgin';
import { Store } from './store';
// Usage: Persistence is enabled by passing a key as the second argument
const store = new Store(
  { cartCount1: 0, user: 'Guest' }, 
  { storageKey: 'my_app_store', debug: true }
);


class StoreTest extends RedGin {
  // 1. Link local reactive state to global store
  global = getset(store.state);

  onInit() {
    // 2. Subscribe to global changes
    store.subscribe((newState: any) => {
      this.global = newState; // Triggers RedGin's surgical requestUpdate()
    });
  }

  render() {
    return html`
      <div class="p-4 border rounded shadow-sm">
        <h4>Global Store Test</h4>
        <p>Current User: <strong>${watch(['global'], () => this.global.user)}</strong></p>
        <p>Cart Items: <span class="badge bg-primary">${watch(['global'], () => this.global.cartCount1)}</span></p>
        
        <div class="mt-3">
          <button class="btn btn-sm btn-success" 
            ${on('click', () => store.set('cartCount1', this.global.cartCount1 + 1))}>
            + Add to Cart (Global)
          </button>
          <button class="btn btn-sm btn-outline-secondary" 
            ${on('click', () => store.set('user', 'Admin User'))}>
            Login as Admin
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('store-test', StoreTest);


class StoreTest2 extends RedGin {
  // 1. Link local reactive state to global store
  global = getset(store.state);

  onInit() {
    // 2. Subscribe to global changes
    store.subscribe((newState: any) => {
      this.global = newState; // Triggers RedGin's surgical requestUpdate()
    });
  }

  render() {
    return html`
      <div class="p-4 border rounded shadow-sm">
        <h4>Global Store Test2</h4>
        <p>Current User: <strong>${watch(['global'], () => this.global.user)}</strong></p>
        <p>Cart Items: <span class="badge bg-primary">${watch(['global'], () => this.global.cartCount1)}</span></p>
        
        <div class="mt-3">
          <button class="btn btn-sm btn-success" 
            ${on('click', () => store.set('cartCount1', this.global.cartCount1 + 1))}>
            + Add to Cart (Global)
          </button>
          <button class="btn btn-sm btn-outline-secondary" 
            ${on('click', () => store.set('user', 'Admin User'))}>
            Login as Admin
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('store-test2', StoreTest2);
