import ko from "knockout";
import jquery from "jquery";

import * as admin from "./admin";
import * as create from "./create";

import { PopupView, APIListItemView } from "../core/views";

export { admin, create };

export class ProjectListView extends PopupView {
  constructor() {
    super();

    this.projects = ko.observableArray();
    this.config = ko.observable();
    this.filter_project_config = ko.observable();

    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      const url = config.api_url + "?name={query}";
      const errors = config.errors || {};
      this.filter_project_config({
        apiSettings: {
          url: url,
        },
        fields: {
          name: "name",
          value: "slug",
        },
        saveRemoteData: true,
        filterRemoteData: true,
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

  project(data) {
    const project = new Project(data);
    this.projects.push(project);
    return project;
  }
}

class Project extends APIListItemView {
  constructor(project) {
    super(project);

    this.url_docs = ko.observable();
    this.data.subscribe((data) => {
      this.url_docs(data.canonical_url);
    });
  }
}

/**
 * View for project version creation and version activation.
 *
 * @class
 * @extends {PopupView}
 * @construtor
 * @public
 */
export class ProjectVersionCreateView extends PopupView {
  constructor() {
    super();

    /** Observable for configuration passed in via :func:`~application.plugins.jsonInit`
     * @function
     * @param {Object} arg
     * @returns {Object} Search configuration object */
    this.config = ko.observable();

    /** Observable to show if search data is loading
     * @function
     * @param {boolean} arg
     * @returns {boolean} True if we are in the middle of a request */
    this.is_loading = ko.observable(false);

    /** Computed observable for rendering the final search configuration. This
     * is used to initialize search as soon as the :func:`config` observable is
     * set.
     * @function
     * @returns {Object} Search configuration object */
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
    const url = config.api_url + "?verbose_name={query}";
    const errors = config.errors || {};
    return {
      apiSettings: {
        url: url,
      },
      selector: {
        // Required because the default of ``.ui.prompt`` is a rounded input
        prompt: ".ui.text",
      },
      fields: {
        title: "verbose_name",
        description: "identifier",
      },
      fullTextSearch: true,
      onSelect: (result, response) => {
        window.location.href = result.urls.dashboard.edit;
      },
      error: errors,
    };
  }
}

/**
 * View for project version listing. This view wraps a list of :class:`Version`.
 *
 * @class
 * @extends {PopupView}
 * @construtor
 * @public
 */
export class ProjectVersionListView extends PopupView {
  constructor() {
    super();

    /** Observable array of :class:`Version` instances
     * @function
     * @param {Array<Version>} arg - List of versions for the listing
     * @returns {Array<Version>} List of versions for the listing */
    this.versions = ko.observableArray();
    /** Observable for configuration passed in via :func:`~application.plugins.jsonInit`
     * @function
     * @param {Object} arg
     * @returns {Object} Search configuration object */
    this.config = ko.observable();
    /** Observable for version filter
     * @function
     * @param {Object} arg
     * @returns {Object} Search configuration object */
    this.filter_version_config = ko.observable();

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

  attach_add_version() {
    console.log(arguments);
    return {};
  }

  version(data) {
    const version = new Version(data);
    this.versions.push(version);
    return version;
  }
}

/** Version subview
 *
 * .. note:: TODO needs docs
 */
class Version extends APIListItemView {
  constructor(version) {
    super(version);
    this.url_pdf = ko.observable();
    this.url_epub = ko.observable();
    this.url_html = ko.observable();
    this.url_docs = ko.observable();
    this.is_built = ko.observable(true);

    this.data.subscribe((data) => {
      this.url_pdf(data.downloads.pdf);
      this.url_epub(data.downloads.epub);
      this.url_html(data.downloads.html);
      this.url_docs(data.urls.documentation);
      this.is_built(data.built);
    });
  }

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
          // The user could be redirected to the build that was just created here,
          // but API v3 is missing the URL on the build object. I don't mind that
          // the interaction leaves me on the same interface while showing the new
          // build either.
          // TODO maybe redirect the user to the new build?
          // https://github.com/readthedocs/readthedocs.org/issues/7361
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    };
  }
}
