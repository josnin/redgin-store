import { RedGin, getset, html, watch, attr, on, emit, safe, css } from 'redgin';

class GlobalPortal extends RedGin {
  state = getset<Record<string, any>>({});
  
  set(key: string, value: any) {
    this.state = { ...this.state, [key]: value };
  }
}

if (!customElements.get('redgin-portal')) {
  customElements.define('redgin-portal', GlobalPortal);
}

export const portal = new GlobalPortal();

/**
 * THE HYDRATOR
 */
export function hydrate(container: HTMLElement, template: string) {
  // 1. HANDSHAKE
  (window as any).__redgin_current_instance = portal;

  // 2. INJECT HTML
  container.innerHTML = template;

  /**
   * 3. THE READ-ONLY BYPASS
   * We redefine the 'shadowRoot' property on this SPECIFIC instance.
   * This trick makes portal.shadowRoot return our plain <div>.
   */
  Object.defineProperty(portal, 'shadowRoot', {
    get: () => container,
    configurable: true // Allows us to change it back if needed
  });

  /**
   * 4. TRIGGER INTERNAL ENGINE
   * Now RedGin's internal this.shadowRoot.querySelectorAll(...) 
   * will work on your container!
   */
  // @ts-ignore
  portal._collectElements(); 

  /**
   * 5. MANUAL EVENT BINDING
   * We use the portal's internal maps populated by _collectElements
   */
  // @ts-ignore
  const eventElements = portal._eventElements as Map<string, HTMLElement>;

  // Initial Sync: Run all watches/attrs once
  // @ts-ignore
  portal._update('state'); 

  // @ts-ignore
  const eventRegistry = portal._eventRegistry as Map<string, [string, any]>;

  if (eventElements && eventRegistry) {
    for (const [uniq, el] of eventElements) {
      const handler = eventRegistry.get(uniq);
      if (handler) {
        const [type, fn] = handler;
        // Bind to portal so 'this' works in the template
        el.addEventListener(type, fn.bind(portal));
      }
    }
  }

  (window as any).__redgin_current_instance = null;
  
  return portal;
}

export { html, watch, attr, on, emit, safe, css };
