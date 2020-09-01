import jquery from "jquery";
import ko from "knockout";

import { ChartView, KnockoutView } from "../core/views";

/* Project automation rule form view
 *
 * @param {Object} automation_rule - Initial instance data, optional
 */
export class ProjectAutomationRuleView extends KnockoutView {
  constructor(automation_rule) {
    super();
    this.predefined_match_arg = ko.observable();
    this.is_match_arg_visible = ko.computed(() => {
      let predefined_match_arg = this.predefined_match_arg();
      return predefined_match_arg === "";
    });
    this.is_all_versions = ko.computed(() => {
      return this.predefined_match_arg() === "all-versions";
    });
    this.is_semver_versions = ko.computed(() => {
      return this.predefined_match_arg() === "semver-versions";
    });
    this.is_custom = ko.computed(() => {
      return this.predefined_match_arg() === "";
    });
  }
}

/* Project redirect rule form view
 *
 * @param {Object} redirect - Initial instance data, optional
 */
export class ProjectRedirectView extends KnockoutView {
  constructor(redirect) {
    super();
    this.redirect_type = ko.observable();
    this.from_url = ko.observable("");
    this.to_url = ko.observable("");

    this.is_example_disabled = ko.observable(false);
    this.is_from_url_visible = ko.observable();
    this.is_to_url_visible = ko.observable();

    this.redirect_from = ko.computed(() => {
      var from_url = this.from_url();
      var redirect_type = this.redirect_type();
      if (redirect_type === "prefix") {
        return from_url + "faq.html";
      } else if (redirect_type === "page") {
        return "/$lang/$version/" + from_url.replace(/^\/+/, "");
      } else if (redirect_type === "exact") {
        return from_url;
      }
      return "";
    });
    this.redirect_to = ko.computed(() => {
      const to_url = this.to_url();
      const redirect_type = this.redirect_type();
      if (redirect_type === "prefix") {
        return "/$lang/$version/faq.html";
      } else if (redirect_type === "page") {
        return "/$lang/$version/" + to_url.replace(/^\/+/, "");
      } else if (redirect_type === "exact") {
        return to_url;
      }
      return "";
    });

    this.redirect_type.subscribe((redirect_type) => {
      if (["prefix", "page", "exact"].includes(redirect_type)) {
        this.is_example_disabled(false);
        let is_to_url_visible = true;

        // Update visibility
        if (redirect_type == "prefix") {
          is_to_url_visible = false;
        }
        this.is_from_url_visible(true);
        this.is_to_url_visible(is_to_url_visible);
      } else {
        this.is_example_disabled(true);
        this.is_from_url_visible(false);
        this.is_to_url_visible(false);
      }
    });
  }
}

/* Project search analytics view
 *
 * Search analytics chart data and config is loaded from an inline
 * application/json script block, so that data, labels, and localized strings
 * can be handled from the templates.
 *
 * @param {Element} elem - Element that view is attached to
 */
export class ProjectSearchAnalyticsView extends ChartView {
  constructor() {
    super();
    this.config = ko.observable();
    this.is_loading = ko.observable(true);
    this.config.subscribe((config) => {
      this.is_loading(false);
    });
  }
}

/* Project traffic analytics view
 *
 * This is identical to search analytics currently
 */
export class ProjectTrafficAnalyticsView extends ProjectSearchAnalyticsView {}
