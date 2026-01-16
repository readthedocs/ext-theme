import jquery from "jquery";

window.emitLitDebugLogEvents = true;
window.addEventListener("lit-debug", (event) => {
  console.debug("Lit event:", event.detail);
});

import { html } from "lit";
import { when } from "lit/directives/when.js";
import { ref, createRef } from "lit/directives/ref.js";

import { LightDOMElement } from "../application/elements";

/**
 * Field element web component base class
 *
 * This element wraps fields from Crispy/Django. These elements follow a progressive enhancement, rely on direct DOM manipulation instead of
 * rendering the full element from a Lit template. This helps keeps parent web components purely rendered.
 *
 * These elements will be most helpful used from parent web components:
 *
 * .. code:: javascript
 *
 *     render() {
 *       return html`
 *         <readthedocs-input-field
 *             .value="${this.value}"
 *             .disabled="${this.disabled}"
 *             @change="${this.handler}">
 *           <input type="text" name="foo" />
 *         </readthedocs-input-field>
 *       `;
 *
 * @property {String} value - Input field value for the form
 * @property {Boolean} disabled - Is the field in a disabled state? Controls tab index
 * @property {String} selector - CSS selector used to find the input in the light DOM
 * @property {Boolean} hasError - Are there errors in the field
 * @fires change - Event fired on attribute and error state changes
 */
export class FieldElement extends LightDOMElement {
  static properties = {
    value: { type: String },
    disabled: { type: Boolean },
    selector: { type: String },
    hasError: { type: Boolean },
  };

  /** @attr {Ref} refInput - Reference to the input element */
  refInput = createRef();
  /** @attr {Ref} refErrors - Reference to the errors list element */
  refErrors = createRef();

  constructor() {
    super();
    this.selector = "input[name]";
    this.hasError = false;
  }

  /**
   * Manually configure element references, we can't use a render template to
   * establish element references via ``ref()``.
   */
  connectedCallback() {
    super.connectedCallback();
    this.refInput.value = this.querySelector(this.selector);
    this.refErrors.value = this.querySelector(".ui.negative.label");
    this.hasError = Boolean(this.refErrors.value);
  }

  /**
   * Set tab index on field to protect disabled fields from keyboard focus.
   *
   * Field types have differing elements that will need to alter tab index, so
   * this can be overridden for any inherited classes.
   */
  set tabIndex(tabIndex) {
    const elemInput = this.refInput.value;
    elemInput.setAttribute("tabIndex", tabIndex);
  }

  /**
   * Setter for input field value, this can vary by subclass.
   */
  set inputValue(value) {
    const elemInput = this.refInput.value;
    elemInput.value = this.value;
  }

  /**
   * Lit updated properties from Lit property lifecycle.
   *
   * This is finally called for any properties , reflect these in the already
   * rendered child elements.
   *
   * @param {Map} changed - properties that have changed on first update
   */
  updated(changed) {
    if (changed.has("value")) {
      this.inputValue = this.value;
    }
    if (changed.has("disabled")) {
      this.tabIndex = this.disabled ? -1 : 0;
    }
    if (changed.has("hasError") && this.hasError) {
      this.dispatchChangeEvent();
    }
  }

  /**
   * Emit change event from this event
   *
   * In a Lit template, subscribe to this event in a render template with:
   * ``<readthedocs-field @change="${this.someEventHandler}">``.
   *
   * @fires change - Change event fired on property changes and error state
   */
  dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: false,
        composed: true,
      }),
    );
  }

  /**
   * Clear error state and Crispy error elements
   */
  clearErrors() {
    if (this.hasError) {
      const elemErrors = this.refErrors.value;
      elemErrors.remove();
      this.hasError = false;
    }
  }
}

/**
 * Field element for InputElement driven form fields
 *
 * Update events on the input element trigger changes here and emit events for
 * changes in the parent element.
 */
class InputFieldElement extends FieldElement {
  connectedCallback() {
    super.connectedCallback();
    const elemInput = this.refInput.value;
    if (elemInput) {
      this.value = elemInput.value;
      elemInput.addEventListener("change", (event) => {
        this.dispatchChangeEvent();
        event.stopPropagation();
      });
    }
  }
}
customElements.define("readthedocs-input-field", InputFieldElement);

/**
 * Field element for SUI dropdown driven form fields
 *
 * This relies on the SUI dropdown module and module behaviors to drive all of
 * the element properties and dropdown UI manipulation.
 *
 * @property {String} description - Rich select field choice description data
 * @fires change - On dropdown select and initial element set up, fires event
 */
export class RichSelectFieldElement extends FieldElement {
  static get properties() {
    const properties = FieldElement.properties;
    properties.description = { type: String };
    return properties;
  }

  constructor() {
    super();
    this.selector = ".ui.dropdown";
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.refInput.value) {
      this.dropdown({
        fireOnInit: true,
        onChange: (value, text, $selected) => {
          // $selected is a jQuery element
          const selected = $selected[0];
          this.value = selected.dataset.value;
          this.description = selected.dataset.description;
          this.dispatchChangeEvent();
        },
      });
    }
  }

  /**
   * Call SUI dropdown module
   *
   * This calls into the SUI jQuery ``dropdown`` module and can be used for
   * both configuring the module or calling any of the behaviors the module
   * provides (see https://fomantic-ui.com/modules/dropdown.html#behavior)
   *
   * @param {...*} args - All arguments to this functionm pass through
   */
  dropdown(...args) {
    return jquery(this.refInput.value).dropdown(...args);
  }

  set inputValue(value) {
    // Call ``set selected`` behavior with ``value`` and ``preventChangeTrigger=true``
    // to avoid retriggering the ``onChange`` callback.
    this.dropdown("set selected", value, true);
  }

  set tabIndex(tabIndex) {
    // The module behavior ``set tabbable`` does not seem to work like we want,
    // don't use it here and instead alter the input manually.
    this.refInput.value
      .querySelector("input.search")
      .setAttribute("tabIndex", tabIndex);
  }
}
customElements.define("readthedocs-richselect-field", RichSelectFieldElement);
