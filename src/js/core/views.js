import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

// Constants, pulled from SUI:
// https://semantic-ui.com/elements/container.html
const breakpoints = {
  mobile: 0,
  tablet: 768,
  computer: 992,
  large_screen: 1200,
};

/**
 * :class:`ResponsiveView` is used to create bindings that alter elements on
 * changes to the viewport width. This can be used to add an SUI class when the
 * viewport width changes.
 *
 * Usage in a binding context:
 *
 * .. code:: html
 *
 *   <div class="ui menu" data-bind="css: {vertical: device.mobile()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.tablet()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.computer()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.large_screen()}">
 */
export class ResponsiveView {
  constructor() {
    this.viewport_width = ko.observable();
    this.device = {
      mobile: ko.observable(true),
      tablet: ko.observable(false),
      computer: ko.observable(false),
      large_screen: ko.observable(false),
    };

    // Don't send too many events to listeners
    this.viewport_width.extend({ ratelimit: 500 });
    this.viewport_width.subscribe((width) => {
      for (const device_name of Object.keys(this.device)) {
        const is_device = width >= breakpoints[device_name];
        this.device[device_name](is_device);
      }
    });

    // Update window width. This will trigger changes to this.device
    const jq_window = jquery(window);
    const fn_update = () => {
      this.viewport_width(jq_window.width());
    };
    jq_window.on("resize", fn_update);
    fn_update();
  }
}

/**
 * Knockout binding to help show popups
 *
 * This is used inside normal Django templates, where we iterate
 * over a list of objects inside the template, not inside hte KO
 * view. This binding will create individual popup contexts.
 *
 * Creates a :class:`Popup`.
 *
 */
export class PopupView {
  create_popup() {
    return new Popup();
  }
}

/**
 * Popupcard base class. Provides some helps to show/hide the popup
 */
export class Popup {
  constructor() {
    /** @observable {Boolean} Is the popup showing currently? */
    this.is_showing = ko.observable(false);
  }

  /** Show the popup */
  show() {
    this.is_showing(true);
  }

  /** Hide the popup */
  hide() {
    this.is_showing(false);
  }
}

/**
 * Base class for API listing views. Provides a foundation for waiting to load
 * data from an API, loading data from an API request, and handling the data.
 *
 * ``data`` parameter needs an ``id`` and ``url`` property.
 *
 * @extends {PopupView}
 */
export class APIListItemView extends PopupView {
  constructor(data) {
    super();
    this.id = data.id;
    this.url = data.url;
    /** @observable {Boolean} Is the API request started loading? */
    this.loaded = ko.observable(false);
    /** @observable {Boolean} Is the API request done loading? */
    this.loading = ko.observable(false);
    /** The central promise for the request.
     * @type {Promise} */
    this.promise = null;
    /** @observable {Object} The data returned from the API */
    this.data = ko.observable();
  }

  /**
   * Using the supplied configuration, perform an API request. Sets up
   * :attr:`promise` so that the child class can manage promise resolve and
   * reject
   */
  fetch() {
    if (this.promise) {
      return this.promise;
    }
    this.promise = new Promise((resolve, reject) => {
      if (this.loaded()) {
        return resolve(this.data());
      }
      this.loading(true);
      jquery.getJSON(this.url).then((data) => {
        this.data(data);
        this.loaded(true);
        this.loading(false);
        return resolve(data);
      });
    });
  }
}

// And some partial views for base template components

/**
 * HeaderView
 */
export class HeaderView {
  static view_name = "HeaderView";

  constructor() {
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Header configuration, mostly for search */
    this.config = ko.observable();
    /** SUI search configuration object, used from templates
     * @observable {Object} Search configuration */
    this.search_project_config = ko.observable();

    // Wait for :func:`config` to change before we init search
    this.config.subscribe((config) => {
      if (config === undefined) {
        return;
      }
      // The URL from the config object is a relative URL, we'll use the
      // window URL origin as the full URL
      const url = new URL(config.api_projects_list_url, window.location.origin);
      url.search = "?name={query}";
      this.search_project_config({
        type: "category",
        apiSettings: {
          url: url.href,
          onResponse: (resp) => {
            const projects = resp.results.map((elem, index) => {
              // TODO description might be better off in the application model
              let description = elem.slug;
              if (elem.subproject_of) {
                // TODO localize this
                description = "Subproject of " + elem.subproject_of.name;
              } else if (elem.translation_of) {
                // TODO localize this
                description =
                  elem.language.name +
                  " translation of " +
                  elem.translation_of.name;
              }
              return {
                title: elem.name,
                description: description,
                url: elem.urls.home,
              };
            });
            const results = {
              results: {
                "category-projects": {
                  name: "Projects",
                  results: projects,
                },
              },
            };
            return results;
          },
        },
        minCharacters: 2,
      });
    });
  }
}
Registry.add_view(HeaderView);
