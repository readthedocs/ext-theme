import jquery from "jquery";

import { LightDOMElement } from "../application/elements";

/**
 * Filter form for list views
 *
 * Wraps the form from ``includes/filters/form.html``. Each filter field is a
 * FUI dropdown, and picking a value submits the form.
 */
export class FilterFormElement extends LightDOMElement {
  connectedCallback() {
    super.connectedCallback();
    jquery(this.querySelectorAll(".ui.filter.dropdown")).dropdown({
      action: "activate",
      onChange: () => {
        this.querySelector("form").submit();
      },
    });
  }
}

customElements.define("readthedocs-filter-form", FilterFormElement);
