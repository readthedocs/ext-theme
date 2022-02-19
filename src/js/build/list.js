// Build - list view

import jquery from "jquery";
import ko from "knockout";

import { PopupView, APIListItemView } from "../core/views";
import { Registry } from "../application/registry";

/** Build listing view for project builds.
 *
 * @extends {PopupView}
 */
export class BuildListView extends PopupView {
  static view_name = "BuildListView";

  constructor() {
    super();

    /** This is loaded using :func:`application.plugins.jsonInit()`
     * @observable {Object} JSON script for configuring search */
    this.config = ko.observable();
    /** This is loaded using :func:`application.plugins.jsonInit()`
     * @observable {Object} JSON script for configuring filtering */
    this.filter_version_config = ko.observable();

    // Subscribe to changes of :func:`config`
    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      const url = config.api_url + "?verbose_name={query}&active=True";
      const errors = config.errors || {};
      this.filter_version_config({
        apiSettings: {
          url: url,
        },
        fields: {
          name: "verbose_name",
          value: "slug",
        },
        saveRemoteData: true,
        filterRemoteData: true,
        sortSelect: true,
        onChange: (value, label, $elem) => {
          $elem.closest("form").submit();
          //window.location.href = "?version=" + value;
        },
      });
    });

    this.filter_config = {
      action: "select",
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
Registry.add_view(BuildListView);
