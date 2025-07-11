import ko from "knockout";
import jquery from "jquery";
import { html, render } from "lit";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";

import * as admin from "./admin";
import * as create from "./create";

import { APIListItemView } from "../core/views";
import { Registry } from "../application/registry";

export { admin, create };

/**
 * Project item view object used for displaying individual projects in the project
 * listing.
 *
 * @param {Object} project - Project API data
 * @extends {APIListItemView}
 */
export class ProjectListItemView extends APIListItemView {
  static view_name = "ProjectListItemView";

  constructor(project) {
    super(project);

    // Add expansion to API URL
    this.url = this.url + "?expand=permissions";

    /** Asynchronously load documentation URL as rendering this URL for each
     * project slows the dashboard down considerably. Instead, this is only
     * fetched when it is needed.
     * @observable {string} Documentation URL for the project */
    this.url_docs = ko.observable();
    /* @observable {Boolean} Does the user have admin permissions on this? */
    this.is_admin = ko.observable(false);

    // Subscribe to the data loaded via :class:`APIListItemView`
    this.data.subscribe((data) => {
      this.url_docs(data.urls.documentation);
      this.is_admin(data.permissions.admin);
    });
  }
}
Registry.add_view(ProjectListItemView);

/**
 * View for project version creation and version activation.
 *
 * @class
 * @construtor
 * @public
 */
export class ProjectVersionCreateView {
  static view_name = "ProjectVersionCreateView";

  constructor() {
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Search configuration */
    this.config = ko.observable();

    /** @observable {Boolean} Is search data loading? */
    this.is_loading = ko.observable(false);

    /** Computed observable for rendering the final search configuration. This
     * is used to initialize search as soon as the :func:`config` observable is
     * finalized.
     * @computed {Object} Search configuration object */
    this.search_config = ko.computed(() => {
      const config = this.config();
      if (config !== undefined) {
        return this.init_search(config);
      }
    });
  }

  /**
   * Initialize the SUI search element using the configuration loaded in
   * :func:`search_config`.
   *
   * This sets up various configuration for the search SUI element, but also
   * sets up functions like `onSelect`, for performing actions on events.
   *
   * @param {object} config - configuration for search element
   */
  init_search(config) {
    const maxResults = 100;
    // String interpolation over URLSearchParams here as FUI uses basic string
    // replacement for `{query}`, but this is encoded for URLSearchParams.
    const url = config.api_url + `?limit=${maxResults}&verbose_name={query}`;
    const errors = config.errors || {};
    return {
      apiSettings: {
        url: url,
      },
      error: errors,
      fullTextSearch: true,
      maxResults: maxResults,
      onSelect: (result, response) => {
        window.location.href = result.urls.dashboard.edit;
      },
      selector: {
        // Required because this uses ``.ui.text`` instead of ``.ui.prompt``
        // because prompt uses a rounded input style
        prompt: ".ui.text",
        // Required as ``.title`` is a complex element in our use, not a simple
        // string like normal. The inner ``.title .text`` sets the field result
        // to just the string value.
        title: ".title .text",
      },
      // Show results immediately on focus
      minCharacters: 0,
      searchOnFocus: true,
      // Use custom template for rich result display
      type: "versions",
      templates: {
        versions: (response) => {
          // Using Lit here as this will likely very soon just be a web component
          // anyways. The project create form references a Knockout observable
          // and a template in HTML. This uses a temporary element to render down
          // to HTML, then removes the element from ``document`` immediately.
          const container = document.createElement("div");
          const results = html`
            <div class="results">
              ${map(
                response.results,
                (version) => html`
                  <a class="result">
                    <div class="image"></div>
                    <div class="content">
                      <div class="title">
                        <span class="text">${version.verbose_name}</span>
                        <i
                          class="fas ${classMap({
                            "fa-code-branch": version.type === "branch",
                            "fa-tag": version.type === "tag",
                          })} small icon"
                        ></i>
                        ${when(
                          version.active,
                          () => html`
                            <span class="ui horizontal label">
                              <i class="fas fa-check icon"></i>
                              Active
                            </span>
                          `,
                        )}
                      </div>
                      <div class="description">
                        <code>${version.identifier}</code>
                      </div>
                    </div>
                  </a>
                `,
              )}
            </div>
          `;

          // Lit renders on an element, but FUI search templates expect HTML return
          render(results, container);
          const htmlResults = container.innerHTML;
          container.remove();
          return htmlResults;
        },
      },
    };
  }
}
Registry.add_view(ProjectVersionCreateView);

/** Version list item subview
 *
 * This mutates project version API return data for use in the Knockout view.
 *
 * URLs for documentation output are lazy loaded when they are requested. We
 * don't do an API call until the user interacts with the version object. This
 * way we don't have to render all of the documentation artifact URLs at once
 * through the resolver. This can cause 10s dashboard load times with a lot of
 * versions.
 *
 * @param {Object} version - Version object data from API
 * @extends {APIListItemView}
 */
export class VersionListItemView extends APIListItemView {
  static view_name = "VersionListItemView";

  constructor(version) {
    super(version);

    /** @observable {string} Async loaded URL for version PDF */
    this.url_pdf = ko.observable();
    /** @observable {string} Async loaded URL for version EPUB */
    this.url_epub = ko.observable();
    /** @observable {string} Async loaded URL for version HTMLzip */
    this.url_html = ko.observable();
    /** @observable {string} Async loaded URL for version docs */
    this.url_docs = ko.observable();
    /** @observable {Boolean} is version successfully built? */
    this.is_built = ko.observable(true);

    // On resolving the data from the API, fill out these observables.
    this.data.subscribe((data) => {
      this.url_pdf(data.downloads.pdf);
      this.url_epub(data.downloads.epub);
      this.url_html(data.downloads.htmlzip);
      this.url_docs(data.urls.documentation);
      this.is_built(data.built);
    });
  }

  /**
   * Trigger a build task for a specific version. This replaces the build
   * dropdown form and instead provides a link on each version admin menu, which
   * is far more intuitive.
   *
   * @param {string} url - URL to post to, this is a project form view, so comes
   * from the Django template
   * @param {string} csrf_token - Also from the Django form, the CSRF token
   * @returns {function} Callback function
   */
  trigger_build(url, csrf_token) {
    return (context, ev) => {
      jquery
        .ajax({
          type: "POST",
          url: url,
          data: {
            csrfmiddlewaretoken: csrf_token,
          },
        })
        .then((data) => {
          if (data.build.urls.build) {
            window.location.href = data.build.urls.build;
          } else {
            console.debug("Redirect to new build failed");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    };
  }
}
Registry.add_view(VersionListItemView);

export class ProjectAnnouncementView {
  static view_name = "ProjectAnnouncementView";

  constructor(cache_key) {
    this.cache_key = cache_key;
    this.prefix_key = "announcements";
    this.storage_key = `${this.prefix_key}.${this.cache_key}`;
    this.closed = ko.observable();
    const cached_value = localStorage.getItem(this.storage_key);
    if (cached_value) {
      this.closed(true);
    } else {
      this.closed(false);
    }
  }

  close_announcement() {
    this.closed(true);
    localStorage.setItem(this.storage_key, true);
  }
}
Registry.add_view(ProjectAnnouncementView);
