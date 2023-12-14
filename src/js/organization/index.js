import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

/**
 * Organization list view
 */
export class OrganizationListView {
  static view_name = "OrganizationListView";

  constructor() {
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Search configuration */
    this.config = ko.observable();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Filter configuration */
    this.filter_organization_config = ko.observable();

    // Wait for :func:`config` to change before we init search
    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      const url = config.api_url + "?slug={query}";
      const errors = config.errors || {};
      this.filter_organization_config({
        apiSettings: {
          url: url,
          cache: false,
        },
        throttle: 500,
        fields: {
          name: "name",
          value: "slug",
        },
        saveRemoteData: false,
        filterRemoteData: false,
        sortSelect: true,
        onChange: (value, label, $elem) => {
          window.location.href = "?organization=" + value;
        },
      });
    });

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
Registry.add_view(OrganizationListView);
