import jquery from "jquery";
import ko from "knockout";

import { ChartView } from "../core/views";

/* Project automation rule form view
 *
 * @param {Object} automation_rule - Initial instance data, optional
 */
export class ProjectAutomationRuleView {
  constructor(automation_rule) {
    this.predefined_match_arg = ko.observable();
    this.predefined_match_arg.subscribe((predefined_match_arg) => {
      console.log(predefined_match_arg);
    });
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

  /* View attachment static method
   *
   * @param {Object} automation_rule - Initial data for automation rule
   * @param {string} selector - Selector string to use for view attachment
   * @returns {ProjectAutomationRuleView}
   */
  static init(automation_rule, selector = "#edit-content") {
    jquery(document).ready(() => {
      const view = new ProjectAutomationRuleView(automation_rule);
      ko.applyBindings(view, jquery(selector)[0]);
      return view;
    });
  }
}

/* Project redirect rule form view
 *
 * @param {Object} redirect - Initial instance data, optional
 */
export class ProjectRedirectView {
  constructor(redirect) {
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

  /* View attachment static method
   *
   * @param {Object} redirect - Initial instance data, optional
   * @param {string} selector - Selector string to use for view attachment
   * @returns {ProjectRedirectView}
   */
  static init(redirect, selector = "#edit-content") {
    jquery(document).ready(() => {
      var view = new ProjectRedirectView(redirect);
      ko.applyBindings(view, jquery(selector)[0]);
      return view;
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

  //<link rel="stylesheet" href="{% static 'vendor/chartjs/chartjs.min.css' %}">
  //<script src="{% static 'vendor/chartjs/chartjs.bundle.min.js' %}"></script>

  /* View attachment static method
   *
   * @param {string} selector - Selector string to use for view attachment
   * @returns {ProjectSearchAnalyticsView}
   */
  static init(selector = "#edit-content") {
    jquery(document).ready(() => {
      const elem = jquery(selector);
      const view = new ProjectSearchAnalyticsView();
      ko.applyBindings(view, elem[0]);
      return view;
    });
  }
}

/* Project traffic analytics view
 *
 * This is identical to search analytics currently
 */
export class ProjectTrafficAnalyticsView extends ProjectSearchAnalyticsView {}
