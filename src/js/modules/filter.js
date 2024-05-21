import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

/**
 * Base view for configuring a view filter.
 *
 * Filters fields are all individually configured with the ``filter_config``
 * property as the configuration for the FUI dropdown element. This
 * configuration converts an ``onchange`` event into a form submission
 * automatically.
 *
 * This configuration is used directly in the ``includes/filter/form.html``
 * include, once per filter field.
 *
 * @class
 * @constructor
 * @public
 */
export class FilterView {
  static view_name = "FilterView";

  constructor() {
    this.filter_config = {
      action: "activate",
      onChange: (value, label, $elem) => {
        // Note: limit use of jQuery selector aid. It's confusing to mix Django
        // templates, knockout, and random jQuery selections in the page. Most
        // of the time, you should be able to use a knockout binding, but this
        // was rather trivial and resulted in no additional observables on the
        // view.
        const form = $elem.closest("form");
        form.submit();
      },
    };
  }
}
Registry.add_view(FilterView);
