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
 * Project list view for listing projects
 */
export class ProjectListView {
  static view_name = "ProjectListView";

  constructor() {
    /** @observable {Array<Project>} List of project instances in the list */
    this.projects = ko.observableArray();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Search configuration */
    this.config = ko.observable();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Filter configuration */
    this.filter_project_config = ko.observable();

    // Wait for :func:`config` to change before we init search
    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      const url = config.api_url + "?name={query}";
      const errors = config.errors || {};
      this.filter_project_config({
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
          window.location.href = "?project=" + value;
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

  /**
   * Helper for adding new projects to :func:`projects`.
   *
   * @param {Object} data - Project data to pass to :class:`Project`
   * @returns {Project}
   */
  project(data) {
    const project = new Project(data);
    this.projects.push(project);
    return project;
  }
}
Registry.add_view(ProjectListView);

/**
 * Project object used for displaying individual projects in the project
 * listing.
 *
 * @param {Object} project - Project API data
 * @extends {APIListItemView}
 */
class Project extends APIListItemView {
  constructor(project) {
    super(project);

    /** Asynchronously load documentation URL as rendering this URL for each
     * project slows the dashboard down considerably. Instead, this is only
     * fetched when it is needed.
     * @observable {string} Documentation URL for the project */
    this.url_docs = ko.observable();
    // Subscribe to the data loaded via :class:`APIListItemView`
    this.data.subscribe((data) => {
      this.url_docs(data.canonical_url);
    });
  }
}

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
    const maxResults = 30;
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

/**
 * View for project version listing. This view wraps a list of :class:`Version`.
 *
 * @class
 * @construtor
 * @public
 */
export class ProjectVersionListView {
  static view_name = "ProjectVersionListView";

  constructor() {
    /** @observable {Array<Version>} Versions for project version listing */
    this.versions = ko.observableArray();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Search configuration */
    this.config = ko.observable();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Filter configuration object */
    this.filter_version_config = ko.observable();

    // Subscribe to changes to :func:`config` and set up search once we have it.
    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      const url = config.api_url + "?verbose_name={query}&active=True";
      const errors = config.errors || {};
      this.filter_version_config({
        apiSettings: {
          url: url,
          cache: false,
          // Use onResponse instead of ``fields`` here as there seems to be some
          // problem the response structure. Dropdowns consistently give 0
          // results.
          onResponse: (response) => {
            return {
              results: response.results.map((result) => {
                return {
                  name: result.verbose_name,
                  value: result.slug,
                };
              }),
            };
          },
        },
        throttle: 500,
        saveRemoteData: false,
        filterRemoteData: false,
        sortSelect: true,
        onChange: (value, label, $elem) => {
          window.location.href = "?version=" + value;
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

  // TODO remove
  attach_add_version() {
    console.debug(arguments);
    return {};
  }

  /**
   * Add :class:`Version` to version list.
   *
   * @param {Object} data - Version data to use in creation
   */
  version(data) {
    const version = new Version(data);
    this.versions.push(version);
    return version;
  }
}
Registry.add_view(ProjectVersionListView);

/** Version subview, used from :class:`ProjectVersionListView`.
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
class Version extends APIListItemView {
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
      this.url_html(data.downloads.html);
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
