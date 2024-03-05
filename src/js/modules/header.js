import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

/**
 * Collapsing header view, for project and organization detail pages
 *
 * @class
 * @constructor
 * @public
 */
export class CollapsingHeaderView {
  static view_name = "CollapsingHeaderView";

  constructor(collapsed = true) {
    /** @observable {Object} Whether the header view is collapsed by default */
    this.is_collapsed = ko.observable(collapsed);

    /** Computed observable for the dropdown link class, so it swaps
     *
     * @computed {Object} CSS class for dropdown link
     */
    this.dropdown_class = ko.computed(() => {
      return this.is_collapsed() ? "fa-caret-down" : "fa-caret-up";
    });
  }

  toggle_collapsed() {
    const value = this.is_collapsed();
    this.is_collapsed(!value);
  }
}
Registry.add_view(CollapsingHeaderView);
