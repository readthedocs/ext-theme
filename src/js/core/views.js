import ko from "knockout";
import jquery from "jquery";

// Constants, pulled from SUI:
// https://semantic-ui.com/elements/container.html
const breakpoints = {
  mobile: 0,
  tablet: 768,
  computer: 992,
  large_screen: 1200,
};

/*
 * MessageView.init('#messages .ui.message');
 */
export class MessageView {
  constructor(message = {}) {
    this.message = message;
    this.dismiss_url = message.attr("data-message-dismiss-url");

    message.children(".close").on("click", this.dismiss());
    message.children("a").on("click", this.dismiss());
  }

  /* Dismiss URL and redirect client to link location, if any */
  dismiss() {
    return (event) => {
      const target = jquery(event.target);
      const link_url = target.attr("href");

      event.preventDefault();

      if (this.dismiss_url) {
        jquery
          .get(this.dismiss_url)
          .done((resp) => {
            if (link_url) {
              window.location = link_url;
            }
          })
          .fail((error) => {
            console.error(error);
          })
          .always(() => {
            this.message.transition("fade");
          });
      } else {
        this.message.transition("fade");
      }

      return false;
    };
  }
}

/* A view mixin to enable initial knockout view model binding
 *
 * The selector ``[data-list-view]`` is added in the base CRUD list.html
 * template that is used by all the list view pages.
 *
 */
export class KnockoutView {
  /* View attachment static method
   *
   * @param {Object} params - Initial instance data, optional
   * @param {string} selector - Selector string to use for view attachment
   * @returns {ProjectRedirectView}
   */
  static init(params, selector = "[data-list-view], #edit-content") {
    var view = new this(params);
    ko.applyBindings(view, jquery(selector)[0]);
    return view;
  }
}

/*
 * ResponsiveView is used to create bindings that alter elements on changes to
 * the viewport width.
 *
 * Usage in a binding context:
 *
 *   <div class="ui menu" data-bind="css: {vertical: device.mobile()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.tablet()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.computer()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.large_screen()}">
 */
export class ResponsiveView extends KnockoutView {
  constructor() {
    super();
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

/* View class for providing knockout observable initial values from templates
 *
 * This allows templates to supply initial value for observables. This is useful
 * for supplying data for KO views in templates, where it would be otherwise a
 * lot of work to supply this data from something like an API return.
 *
 * This adds 3 binding handlers to KO:
 *
 * * htmlInit - Gets/sets HTML value from node to/from observable
 * * textInit - Gets/sets text value from node to/from observable
 * * jsonInit - Gets JSON value from node to observable, doesn't read
 *
 * Usage:
 *
 *    <script type="application/json" data-bind="jsonInit: config">
 *      {"foo": "foo"}
 *    </script>
 */
export class InitView extends KnockoutView {
  constructor() {
    super();
  }
}

/* Knockout chart view based on chartjs
 *
 * This will dynamically load chartjs using webpack dynamic imports, and will
 * configure a chart view for display. This uses InitView to provide a way to
 * configure the chart labels, data, and localized strings from templates.
 *
 * Chart.js is dynamically loaded as it also brings in momentjs, which is very
 * large due to locales. The resulting script is >1MB, so we won't ever load it
 * unless necessary.
 *
 * Usage:
 *
 *    <script type="application/json" data-bind="jsonInit: config">
 *      // This is the chartjs configuration as JSON
 *      {...}
 *    </script>
 *    <canvas data-bind="chart: config"></canvas>
 */
export class ChartView extends InitView {
  constructor() {
    super();
  }
}

/* Knockout binding to help show popups
 *
 * This is used inside normal Django templates, where we iterate
 * over a list of objects inside the template, not inside hte KO
 * view. This binding will create individual popup contexts.
 *
 */
export class PopupView extends KnockoutView {
  constructor() {
    super();
  }

  create_popup() {
    return new Popup();
  }
}

export class Popup {
  constructor() {
    this.is_showing = ko.observable(false);
  }

  show() {
    this.is_showing(true);
  }

  hide() {
    this.is_showing(false);
  }
}

export class APIListItemView extends PopupView {
  constructor(data) {
    super();
    this.id = data.id;
    this.url = data.url;
    this.loaded = ko.observable(false);
    this.loading = ko.observable(false);
    this.promise = null;
    this.data = ko.observable();
  }

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
