import ko from "knockout";
// Note: if debugging is needed, you can try this import instead.
//import ko from "knockout/build/output/knockout-latest.debug.js";
import jquery from "jquery";

/**
 * This is the top-level view that is added to ``<body>``, and is what surfaces
 * all of the child view names to the templates. For instance, in the project
 * creation template, we would use the :class:`ProjectCreateView` with:
 *
 * .. code:: html
 *
 *     <div data-bind="using: ProjectCreateView()">
 *       ...
 *     </div>
 *
 * This resets the bound view in Knockout for the element, and rebinds and
 * resets the context, so that :class:`ApplicationView` is not the primary view
 * anymore.
 */
export class ApplicationView {
  /**
   * Attach application main view
   *
   * @param {string} selector - Selector string to use for view attachment
   */
  attach(selector = "body") {
    console.debug("Attaching application to selector:", selector);
    this.registry.attach(this);
    ko.applyBindings(this, jquery(selector)[0]);
  }

  /**
   * Show a modal using an event callback. This is set up on
   * :class:`ApplicationView` so that this method is available as
   * ``$root.show_modal(123);``. This is required because the modal plugin ends
   * up altering ``<body>``, and this causes some havoc on the already attached
   * view on ``<body>``.
   *
   * This should be used from an element data-bind, such as:
   *
   * .. code:: html
   *
   *     <button data-bind="click: $root.show_modal('delete')"></button>
   *     <div class="ui modal" data-modal-id="delete"></div>
   *
   * This method is executed when the view is attached and returns a callback.
   * The callback is finally executed from the ``click`` binding.
   *
   * @param {string} modal_id - Modal id, references `data-modal-id` attribute
   * @returns {knockout_click}
   */
  show_modal(modal_id) {
    return (data, event) => {
      const selector = "[data-modal-id=" + modal_id + "]";
      console.debug("Showing modal:", selector);
      const found_modal = jquery(selector).modal("show");
      if (found_modal.length === 0) {
        console.debug("Modal not found:", selector);
      }
    };
  }
}
