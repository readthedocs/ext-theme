import jquery from "jquery";
import ko from "knockout";
import DOMPurify from "dompurify";

import { Registry } from "../application/registry";

/**
 * Project automation rule form view
 *
 * @param {Object} automation_rule - Initial instance data, optional
 */
export class ProjectAutomationRuleView {
  static view_name = "ProjectAutomationRuleView";

  constructor(automation_rule) {
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
Registry.add_view(ProjectAutomationRuleView);

/**
 * Project redirect rule form view
 *
 * @param {Object} redirect - Initial instance data, optional
 */
export class ProjectRedirectView {
  static view_name = "ProjectRedirectView";

  constructor(redirect) {
    this.redirect_type = ko.observable();
    this.from_url = ko.observable("");
    this.to_url = ko.observable("");

    this.is_example_disabled = ko.observable(false);
    this.is_from_url_visible = ko.observable();
    this.is_to_url_visible = ko.observable();

    this.redirect_from = ko.computed(() => {
      var from_url = DOMPurify.sanitize(this.from_url());
      var redirect_type = this.redirect_type();
      if (redirect_type === "prefix") {
        return from_url + "faq.html";
      } else if (redirect_type === "page") {
        return (
          '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/' +
          from_url.replace(/^\/+/, "")
        );
      } else if (redirect_type === "exact") {
        return from_url;
      } else if (redirect_type === "clean_url_to_html") {
        return '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/<span class="ui violet text">$file</span>/';
      } else if (redirect_type === "clean_url_without_trailing_slash_to_html") {
        return '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/<span class="ui violet text">$file</span>';
      }
      return "";
    });
    this.redirect_to = ko.computed(() => {
      const to_url = DOMPurify.sanitize(this.to_url());
      const redirect_type = this.redirect_type();
      if (redirect_type === "prefix") {
        return '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/faq.html';
      } else if (redirect_type === "page") {
        return (
          '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/' +
          to_url.replace(/^\/+/, "")
        );
      } else if (redirect_type === "exact") {
        return to_url;
      } else if (redirect_type === "clean_url_to_html") {
        return '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/<span class="ui violet text">$file</span>.html';
      } else if (redirect_type === "clean_url_without_trailing_slash_to_html") {
        return '/<span class="ui violet text">$lang</span>/<span class="ui violet text">$version</span>/<span class="ui violet text">$file</span>.html';
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
      } else if (
        [
          "clean_url_to_html",
          "clean_url_without_trailing_slash_to_html",
        ].includes(redirect_type)
      ) {
        this.is_example_disabled(false);
        this.is_from_url_visible(false);
        this.is_to_url_visible(false);
      } else {
        this.is_example_disabled(true);
        this.is_from_url_visible(false);
        this.is_to_url_visible(false);
      }
    });
  }
}
Registry.add_view(ProjectRedirectView);

/**
 * Project sharing form view
 *
 * @param {Object} share - Initial instance data, optional
 */
export class ProjectTemporaryAccessView {
  static view_name = "ProjectTemporaryAccessView";

  constructor(share) {
    this.access_type = ko.observable();
    this.show_password_field = ko.computed(() => {
      return this.access_type() == "password";
    });

    this.allow_all = ko.observable(share.allow_all);
    this.show_versions_list = ko.computed(() => {
      return this.allow_all() === false;
    });
  }
}
Registry.add_view(ProjectTemporaryAccessView);

/**
 * Project search analytics view
 *
 * Search analytics chart data and config is loaded from an inline
 * application/json script block, so that data, labels, and localized strings
 * can be handled from the templates.
 *
 * @param {Element} elem - Element that view is attached to
 */
export class ProjectSearchAnalyticsView {
  static view_name = "ProjectSearchAnalyticsView";

  constructor() {
    this.config = ko.observable();
    this.is_loading = ko.observable(true);
    this.config.subscribe((config) => {
      this.is_loading(false);
    });
  }
}
Registry.add_view(ProjectSearchAnalyticsView);

/**
 * Project traffic analytics view
 *
 * This is identical to search analytics currently
 */
export class ProjectTrafficAnalyticsView extends ProjectSearchAnalyticsView {
  static view_name = "ProjectTrafficAnalyticsView";
}
Registry.add_view(ProjectTrafficAnalyticsView);
