import { LitElement } from "lit";

/**
 * LightDOMElement
 *
 * This is a helper class for using a light DOM with LitElement
 * instead of a shadow DOM. Light DOM is what allows FUI styles
 * to be used inside the element.
 *
 * Also adds some debugger helpers.
 **/
export class LightDOMElement extends LitElement {
  // Use light DOM with inherited styles instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  // And some debugging calls
  connectedCallback() {
    super.connectedCallback();

    console.debug("Setting up web component instance:", this.constructor.name);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    console.debug(
      "Disconnecting web component instance:",
      this.constructor.name,
    );
  }
}
