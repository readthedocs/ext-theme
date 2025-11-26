import ko from "knockout";
// Note: if debugging is needed, you can try this import instead.
//import ko from "knockout/build/output/knockout-latest.debug.js";
import jquery from "jquery";

/**
 * ``ApplicationView`` is the top-level view that is bound to ``<body>``, and is
 * what surfaces all registered view to templates. Registered views will be
 * available as attributes on this instance, and can be referenced directly, or
 * if the context is already in one of the views, can be referenced using
 * ``$root``:
 *
 * .. code:: html
 *
 *    <body>
 *      <!-- The context is bound to ApplicationView() -->
 *      <div data-bind="using: ProjectCreateView()">
 *       <!-- The context is now bound to ProjectCreateView() -->
 *       <div data-bind="using $root.DocEmbedView()">
 *         <!-- The context is bound to DocEmbedView() -->
 *       </div>
 *      </div>
 *    </body>
 *
 * This view also has a few utility methods that templates use directly. This is
 * for a few quirks where Knockout or HTML required for SemanticUI need some
 * additional code.
 */
export class ApplicationView {
  /**
   * Attach application main view
   *
   * @param {string} selector - Selector string to use for view attachment
   */
  attach(selector = "body") {
    console.debug("Attaching application to selector:", selector);
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

  /**
   * Submit a child form, useful for triggering a form POST with a link
   *
   * This could be used like:
   *
   * .. code:: html
   *
   *     <button data-bind="click: $root.post_child_form">
   *       Log out
   *       <form method="post" action="...">
   *         ...
   *       </form>
   *     </button>
   *
   * @param {Object} data - Context data
   * @param {Event} event - Click event
   * @returns {knockout_click}
   */
  post_child_form(data, event) {
    const elem = event.currentTarget;
    const form = elem.querySelector(":scope > form");
    if (form) {
      form.submit();
    }
    return false;
  }
}
