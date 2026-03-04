import { RedGin, watch, getset, on, html } from "redgin";
import { Store } from "./store";

// Initialize with Persistence and Debugging enabled
const store = new Store({
  products: [
    { id: 1, name: 'RedGin Pro', price: 125 },
    { id: 2, name: 'Surgical Watcher', price: 85 }
  ]
}, { storageKey: 'market_store', debug: true });


class ProductManager extends RedGin {
  global = getset(store.state);
  private _unsub?: () => void;

  onInit() {
    this._unsub = store.subscribe(newState => this.global = newState);
  }

  disconnectedCallback() {
    if (this._unsub) this._unsub();
    super.disconnectedCallback();
  }

  addProduct() {
    const newId = Date.now();
    const newItem = { id: newId, name: `Product ${newId.toString().slice(-4)}`, price: 99 };
    // Immutability: Creates a new array reference to trigger update
    store.set('products', [...this.global.products, newItem], "ProductManagerAdd");
  }

  removeProduct(id: number) {
    store.set('products', this.global.products.filter((p: any) => p.id !== id), "ProductManagerRemove");
  }

  render() {
    return html`
      <div class="p-4 shadow-sm border rounded">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>Product Inventory</h3>
          <button class="btn btn-outline-danger btn-sm" ${on('click', () => store.clear())}>
            🗑️ Clear Storage
          </button>
        </div>

        <button class="btn btn-primary w-100 mb-4" ${on('click', () => this.addProduct())}>
          + Add Random Product
        </button>

        <ul class="list-group">
          ${watch(['global'], () => this.global.products.map((p: any) => html`
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>${p.name}</strong> 
                <span class="text-muted ms-2">$${p.price}</span>
              </div>
              <button class="btn btn-sm btn-link text-danger" ${on('click', () => this.removeProduct(p.id))}>
                Remove
              </button>
            </li>
          `))}
        </ul>
      </div>
    `;
  }
}

customElements.define('product-manager', ProductManager);
