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
            console.log(error);
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

  static init(selector) {
    jquery(selector).each((index, obj) => {
      const message = jquery(obj);
      const view = new MessageView(message);
    });
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
  static init(params, selector = "[data-list-view]") {
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
    // HTML binding. Gets initial value as HTML, sets HTML in return
    ko.bindingHandlers.htmlInit = this.add_init_handler(
      (element) => {
        return element.innerHTML;
      },
      (property) => {
        return { html: property };
      }
    );
    // Text binding. Gets initial value as node inner text, sets inner text in return
    ko.bindingHandlers.textInit = this.add_init_handler(
      (element) => {
        return element.innerText;
      },
      (property) => {
        return { text: property };
      }
    );
    // JSON binding. Gets initial value as JSON from node inner HTML, doesn't
    // set anything in return
    ko.bindingHandlers.jsonInit = this.add_init_handler((element) => {
      return JSON.parse(element.innerHTML);
    });
  }

  add_init_handler(getter, setter) {
    return {
      init: function (element, valueAccessor, allBindingsAccessor, data) {
        const property = valueAccessor();
        const value = getter(element);

        // Create the observable, if it doesn't exist
        if (!ko.isWriteableObservable(property)) {
          throw new Error("Property not found:", property);
        }

        property(value);

        if (setter) {
          ko.applyBindingsToNode(element, setter(property));
        }
      },
    };
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
    ko.bindingHandlers.chart = {
      init: function (element, value_accessor) {
        var property = value_accessor();

        // Dynamic webpack import of library. This will trigger a new request.
        import(
          /* webpackChunkName: "chartjs" */
          "chart.js"
        ).then(({ default: chartjs }) => {
          let config = property();

          const datasets = config.data.datasets.map((value) => {
            value.backgroundColor = "rgb(65, 131, 196, 0.8)";
            value.borderColor = "rgb(65, 131, 196, 1)";
            value.pointBorderColor = "rgb(65, 131, 196, 1)";
            value.borderWidth = "1px";
            return value;
          });

          config.data.datasets = datasets;
          const chart = new chartjs(element, config);
        });
      },
    };
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
    ko.bindingHandlers.popup = {
      init: (element, value_accessor, bindings, view, context) => {
        const config = Object.assign(
          {
            hoverable: true,
            delay: {
              show: 300,
              hide: 100,
            },
            exclusive: true,
            onHide: () => { context.$rawData.hide(); },
          },
          value_accessor()
        );
        const jq_element = jquery(element);
        jq_element.popup(config).hover(
          () => { context.$rawData.show(); },
        );
      },
    };
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
