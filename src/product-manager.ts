import { RedGin, watch, getset, on, html } from "redgin";
import { Store } from "./store";

// src/store.ts
const initialState = {
  products: [
    { id: 1, name: 'RedGin Pro', price: 125 },
    { id: 2, name: 'Surgical Watcher', price: 85 }
  ]
};

// Second argument enables LocalStorage saving
const store = new Store(initialState, 'market_store');


class ProductManager extends RedGin {
  // Sync component state with global store
  global = getset(store.state);
  private _unsub?: () => void;

  onInit() {
    // 1. Subscribe & hold the unsubscribe function
    this._unsub = store.subscribe(newState => this.global = newState);
  }

  disconnectedCallback() {
    // 2. Cleanup to prevent memory leaks
    if (this._unsub) this._unsub();
    super.disconnectedCallback();
  }

  addProduct() {
    const newId = Date.now();
    const newItem = { id: newId, name: `Product ${newId.toString().slice(-4)}`, price: 99 };
    
    // IMMUTABILITY: Use spread operator so RedGin detects the change
    store.set('products', [...this.global.products, newItem]);
  }

  removeProduct(id: number) {
    // Filter out the item to create a new array reference
    const updatedList = this.global.products.filter((p: any) => p.id !== id);
    store.set('products', updatedList);
  }

  render() {
    return html`
      <div class="p-4">
        <h3>Product Inventory</h3>
        <button class="btn btn-primary mb-3" ${on('click', () => this.addProduct())}>
          + Add Random Product
        </button>

        <ul class="list-group">
          ${watch(['global'], () => this.global.products.map((p: any) => html`
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${p.name} - $${p.price}
              <button class="btn btn-sm btn-danger" ${on('click', () => this.removeProduct(p.id))}>
                Remove
              </button>
            </li>
          `).join(''))}
        </ul>
      </div>
    `;
  }
}

customElements.define('product-manager', ProductManager);

