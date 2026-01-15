import jquery from "jquery";
import ko from "knockout";

import { Registry } from "../application/registry";

import { html, nothing, render } from "lit";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { ref, createRef } from "lit/directives/ref.js";
import { map } from "lit/directives/map.js";

import { LightDOMElement } from "../application/elements";

/**
 * Combination field for project repository
 *
 * This element uses progressive enhancement of the existing form fields from
 * Django/Crispy. This web component adds dynamic interaction between the
 * fields and some additional UI elements to help describe what the user is
 * changing about the project.
 *
 * This uses :js:class:`InputFieldElement` and :js:class:`RichSelectFieldElement`
 * to isolate direct DOM manipulation from template driven web component logic.
 */
export class ProjectRepositoryMultifieldElement extends LightDOMElement {
  static properties = {
    label: { type: String },

    repoValue: { type: String },
    repoError: { state: true },
    remoteRepositoryValue: { type: String },
    remoteRepositoryUrl: { type: String },
    remoteRepositoryError: { state: true },

    useManual: { state: true },
    previousChoice: { state: true },
  };

  // TODO references
  refRemoteRepository = createRef();
  refRepo = createRef();

  constructor() {
    super();
    this.remoteRepositoryValue = "";
    this.useManual = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.slotRemoteRepository = Array.from(
      this.querySelector("#div_id_remote_repository").children,
    );
    this.slotRepo = Array.from(this.querySelector("#div_id_repo").children);

    // Mimic shadow DOM default slot behavior, unused slotted children are discarded
    this.slotDefault = document.createElement("div");
    this.slotDefault.replaceChildren(...this.children);
  }

  listenerRemoteRepository(event) {
    if (
      event.type == "change" &&
      event.target === this.refRemoteRepository.value
    ) {
      this.remoteRepositoryValue = event.target.value;
      this.remoteRepositoryUrl = event.target.description;
      this.remoteRepositoryError = event.target.hasError;
    }
  }

  listenerRepo(event) {
    if (event.type == "change" && event.target === this.refRepo.value) {
      this.repoValue = event.target.value;
      this.repoError = event.target.hasError;
    }
  }

  toggleManual(event) {
    this.useManual = Boolean(event.target.checked);
  }

  /**
   * Renders combined repository field
   *
   * The elements we targeted in :js:method:`connectedCallback` are used in
   * this render template. When an :js:class:`Element` is included in a rendered
   * template, Lit is internally calling :js:method:`Element.appendChild`. When
   * ``appendChild`` is called with an element that already has a parent, that
   * element is simply moved in the DOM. So, by including these elements (with
   * ``${this.refRepo.value}``), we're moving the elements around in our light
   * DOM.
   */
  render() {
    const isRemoteRepositoryDimmed = false;
    const isRemoteRepositoryDisabled = this.useManual;
    const isRemoteRepositoryUsable =
      isRemoteRepositoryDimmed || isRemoteRepositoryDisabled;

    const classesRemoteRepositoryField = {
      disabled: !isRemoteRepositoryDimmed && isRemoteRepositoryDisabled,
      error: Boolean(this.remoteRepositoryError),
    };
    const classesRepoField = {
      disabled: !this.useManual,
      error: Boolean(this.repoError),
    };
    const classesUseManualField = {
      disabled: isRemoteRepositoryDimmed,
    };

    return html`
      <div class="ui required field">
        <label>
          ${this.label}
        </label>

        <div class="ui field segment">
          <readthedocs-richselect-field
            .value="${this.remoteRepositoryValue}"
            .disabled="${this.useManual}"
            @change="${this.listenerRemoteRepository}"
            ${ref(this.refRemoteRepository)}
          >
            <div
              class="ui basic fitted blurring segment ${classMap(
                classesRemoteRepositoryField,
              )} field"
            >
              ${when(
                isRemoteRepositoryDimmed,
                () => html`
                  <div class="ui inverted active dimmer">
                    <div class="ui message">
                      <i class="fas fa-circle-info icon"></i>
                      Add a connected service account to use automatic
                      repository connections
                    </div>
                  </div>
                `,
              )}
              ${this.slotRemoteRepository}
              ${when(
                !isRemoteRepositoryDimmed,
                () => html`
                  <div class="ui small message">
                    <i class="fas fa-circle-info icon"></i>
                    Another user maintains the connection to this repository.
                  </div>
                `,
              )}

              <div class="ui divider"></div>
            </div>
          </readthedocs-richselect-field>

          <div
            class="ui basic fitted segment ${classMap(
              classesUseManualField,
            )} field"
          >
            <div class="ui checkbox">
              <input
                type="checkbox"
                ?checked="${this.useManual}"
                @change="${this.toggleManual}"
              />
              <label> Use manually configured repository URL </label>
            </div>
          </div>

          <readthedocs-input-field
            .value="${this.repoValue}"
            .disabled="${!this.useManual}"
            @change="${this.listenerRepo}"
            ${ref(this.refRepo)}
          >
            <div class="ui ${classMap(classesRepoField)} field">
              ${this.slotRepo}
            </div>
          </readthedocs-input-field>
        </div>
      </div>
    `;
  }

  willUpdate(changed) {
    if (changed.has("remoteRepositoryValue")) {
      if (this.remoteRepositoryValue !== "" && !changed.has("useManual")) {
        this.useManual = false;
        this.repoValue = this.remoteRepositoryUrl;
        if (this.repoError) {
          this.repoError = false;
          this.refRepo.value.clearErrors();
        }
      }
    } else if (changed.has("useManual")) {
      if (this.useManual) {
        this.previousChoice = this.remoteRepositoryValue;
        this.remoteRepositoryValue = "";
      } else {
        this.remoteRepositoryValue = this.previousChoice;
      }
    }
  }
}
customElements.define(
  "readthedocs-project-repository-multifield",
  ProjectRepositoryMultifieldElement,
);

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

    // HTML prefix content for from field, don't use user input here
    this.redirect_from_prefix = ko.computed(() => {
      const redirect_type = this.redirect_type();
      const lang_part = `/<span class="ui violet text">$lang</span>`;
      const version_part = `/<span class="ui violet text">$version</span>`;

      if (redirect_type === "page") {
        return `${lang_part}${version_part}/`;
      } else if (redirect_type === "clean_url_to_html") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>/`;
      } else if (redirect_type === "clean_url_without_trailing_slash_to_html") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>`;
      } else if (redirect_type === "html_to_clean_url") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>.html`;
      }
      return "";
    });
    // User input for from field as text, no HTML allowed
    this.redirect_from = ko.computed(() => {
      const from_url = this.from_url();
      const redirect_type = this.redirect_type();
      if (redirect_type === "prefix") {
        return from_url + "faq.html";
      } else if (redirect_type === "page") {
        return from_url.replace(/^\/+/, "");
      } else if (redirect_type === "exact") {
        return from_url;
      }
      return "";
    });
    // HTML prefix content for to field, don't use user input here.
    this.redirect_to_prefix = ko.computed(() => {
      const redirect_type = this.redirect_type();
      const lang_part = `/<span class="ui violet text">$lang</span>`;
      const version_part = `/<span class="ui violet text">$version</span>`;

      if (redirect_type === "prefix") {
        return `${lang_part}${version_part}/faq.html`;
      } else if (redirect_type === "page") {
        return `${lang_part}${version_part}/`;
      } else if (redirect_type === "clean_url_to_html") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>.html`;
      } else if (redirect_type === "clean_url_without_trailing_slash_to_html") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>.html`;
      } else if (redirect_type === "html_to_clean_url") {
        return `${lang_part}${version_part}/<span class="ui violet text">$file</span>/`;
      }
      return "";
    });
    // User input for to field as text, no HTML allowed
    this.redirect_to = ko.computed(() => {
      const to_url = this.to_url();
      const redirect_type = this.redirect_type();
      if (redirect_type === "page") {
        return to_url.replace(/^\/+/, "");
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
      } else if (
        [
          "clean_url_to_html",
          "clean_url_without_trailing_slash_to_html",
          "html_to_clean_url",
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
