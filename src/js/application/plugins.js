import jquery from "jquery";
import ko from "knockout";

window.jQuery = jquery;
global.jQuery = jquery;

// Required for FUI tab module
require("jquery-address");

/* CommonJS require instead of import syntax on purpose */
require("fomantic-ui-less/definitions/behaviors/visibility.js");
require("fomantic-ui-less/definitions/behaviors/form.js");
require("fomantic-ui-less/definitions/behaviors/state.js");
require("fomantic-ui-less/definitions/behaviors/api.js");
require("fomantic-ui-less/definitions/modules/transition.js");
require("fomantic-ui-less/definitions/modules/tab.js");
require("fomantic-ui-less/definitions/modules/dropdown.js");
require("fomantic-ui-less/definitions/modules/modal.js");
require("fomantic-ui-less/definitions/modules/search.js");
require("fomantic-ui-less/definitions/modules/sticky.js");
require("fomantic-ui-less/definitions/modules/shape.js");
require("fomantic-ui-less/definitions/modules/accordion.js");
require("fomantic-ui-less/definitions/modules/sidebar.js");
require("fomantic-ui-less/definitions/modules/dimmer.js");
require("fomantic-ui-less/definitions/modules/checkbox.js");
require("fomantic-ui-less/definitions/modules/slider.js");
require("fomantic-ui-less/definitions/modules/popup.js");
require("fomantic-ui-less/definitions/modules/embed.js");
require("fomantic-ui-less/definitions/modules/progress.js");
require("fomantic-ui-less/definitions/modules/toast.js");
require("fomantic-ui-less/definitions/globals/site.js");

/**
 * Set up jQuery plugins. SemanticUI jQuery plugins are brought in piecemeal,
 * through separate dependencies. This allows for a smaller footprint.
 */
export function configure_jquery_plugins() {
  jquery.fn.site("normalize");
  jquery.fn.tabs = jquery_tabmenu;
  // ``tabmenu`` was ported from our website, but ``tabs`` is nicer
  jquery.fn.tabmenu = jquery_tabmenu;
}

/**
 * Set up Knockout plugins for interacting with HTML templates
 */
export function configure_knockout_plugins() {
  ko.bindingHandlers.htmlInit = htmlInit;
  ko.bindingHandlers.textInit = textInit;
  ko.bindingHandlers.jsonInit = jsonInit;
  ko.bindingHandlers.valueInit = valueInit;
  ko.bindingHandlers.element = element;
  ko.bindingHandlers.chart = chart;
  ko.bindingHandlers.popup = popup;
  ko.bindingHandlers.message = message;
  ko.bindingHandlers.semanticui = semanticui;
}

/**
 * Binding for initializing an observable using the inner HTML of an element.
 */
export const htmlInit = add_init_handler(
  (element) => {
    return element.innerHTML;
  },
  (property) => {
    return { html: property };
  },
);

/**
 * Binding for initializing an observable using the inner text (the child text
 * nodes) of an element.
 */
export const textInit = add_init_handler(
  (element) => {
    return element.innerText;
  },
  (property) => {
    return { text: property };
  },
);

/**
 * Binding for initializing an observable from the ``value`` attribute of an
 * element -- for example a form ``<input>`` element.
 */
export const valueInit = add_init_handler(
  (element) => {
    return element.value;
  },
  (property) => {
    return { value: property };
  },
);

/**
 * JSON binding for writing JSON configuration objects in HTML and initializing
 * the value in a Knockout observable. This is used to transfer configuration
 * from Django and Django template tags, into our front end code.
 *
 * This binding does not set anything, it is only used to initialize an
 * observable on page load.
 *
 * Usage:
 *
 * .. code:: html
 *
 *     <script type="application/json" data-bind="jsonInit: config">
 *     {"url": "https://example.com/api/v3/projects/1234"}
 *     </script>
 *
 * In turn, there should be a Knockout observable ``config`` in the view:
 *
 * .. code:: javascript
 *
 *     self.config = ko.observable()
 *     self.url = ko.computed(() => {
 *       return self.config().url;
 *     })
 */
export const jsonInit = add_init_handler((element) => {
  return JSON.parse(element.innerHTML);
});

function add_init_handler(getter, setter) {
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

export const element = {
  init: function (element, value_accessor) {
    var property = value_accessor();
    property(element);
  },
};

/**
 * Chart binding used in a couple views to instantiate chartjs on a ``<canvas>``.
 * This plugin loads chartjs, which is rather large, via an async import in
 * Webpack. This will load the chartjs and dependencies separately from the rest
 * of our application code.
 *
 * Usage:
 *
 * .. code:: html
 *
 *    <canvas width="400" height="150" data-bind="chart: config"></canvas>
 *    <script type="application/json" data-bind="jsonInit: config">
 *    {...}
 *    </script>
 */
export const chart = {
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

/**
 * Popup plugin for configuring SUI popups. This can be replaced by
 * :func:`semanticui`.
 */
export const popup = {
  init: (element, value_accessor, bindings, view, context) => {
    const config = Object.assign(
      {
        hoverable: true,
        delay: {
          show: 300,
          hide: 100,
        },
        exclusive: true,
        onHide: () => {
          context.$rawData.hide();
        },
      },
      value_accessor(),
    );
    const jq_element = jquery(element);
    jq_element.popup(config).hover(() => {
      context.$rawData.show();
    });
  },
};

/**
 * Message plugin for Knockout for displaying messages that can be dismissed by
 * either closing via the close button, or clicking the link in the message.
 * This will fade out the message.
 *
 * This is a plugin as we manipulate JQuery elements directly. Knockout views
 * are not a good fit here because the underlying JQuery element is not
 * surfaced to Knockout views.
 *
 * Usage:
 *
 * .. code:: html
 *
 *     <div data-bind="message: {}"></div>
 *     <div data-bind="message: {dismiss_url: '/foo'}"></div>
 *
 */
export const message = {
  init: (element, value_accessor, bindings, view, context) => {
    const jq_element = jquery(element);

    const config = value_accessor();

    // This intercepts the normal function of the button, and injects a call to
    // first dismiss the message.
    const dismiss = (event) => {
      const target = jquery(event.target);
      const link_url = target.attr("href");

      event.preventDefault();

      if (config.dismiss_url) {
        jquery
          .get(config.dismiss_url)
          .done((resp) => {
            if (link_url) {
              window.location = link_url;
            }
          })
          .fail((error) => {
            console.error(error);
          })
          .always(() => {
            jq_element.transition("fade");
          });
      } else {
        jq_element.transition("fade");
      }

      return false;
    };

    // We will use the above handler on both the close button, and also on any
    // links in the text of the message. This ensures both options dismiss the
    // notification message.
    jq_element.find(".close").on("click", dismiss);
    jq_element.find("a").on("click", dismiss);
  },
};

/**
 * SemanticUI Knockout binding for applying SemanticUI jQuery plugins, and
 * plugin configuration to individual elements.
 *
 * .. warning::
 *     The modal plugin is not supported in this configuration because of some
 *     fun interaction with jQuery.
 *
 * There are two methods of using this Knockout plugin. The first is using
 * literal values from tempaltes:
 *
 * .. code:: html
 *
 *     <a class="ui item" data-bind="semanticui: {popup: {on: 'click'}}">
 *
 * This template code would be similar to executing the following JS:
 *
 * .. code:: js
 *
 *     $(".ui.item").popup({on: "click"});
 *
 * The second way of using this plugin is through an Knockout observable that
 * returns either a literal object or a function from the observable.
 *
 * See :func:`BuildDetailView.progress_config` for an example of both.
 *
 * To pass a literal object via an observable, use an observable such as:
 *
 * .. code:: js
 *
 *     this.popup_config = ko.computed(() => {
 *       return {
 *         label: this.example_observable(),
 *         on: "click",
 *       }
 *     });
 *
 * You can also return a function from an observable. This function will be
 * called with a single argument: a callback function representing the jQuery
 * plugin method for the underlying element. This allows for also executing
 * module _behaviors_. Behaviors are listed on some SUI modules, such as:
 * https://fomantic-ui.com/modules/progress.html#behavior
 *
 * For example, the bound element in template code would be:
 *
 * .. code:: html
 *
 *     <a class="ui item" data-bind="semanticui: {progress: progress_config() }">
 *
 * The the matching observable code to trigger a behavior:
 *
 * .. code:: js
 *
 *     this.progress_config = ko.computed(() => {
 *       if (ko.computedContext.isInitial()) {
 *         // First call, initialize the module
 *         return {
 *           total: 10,
 *         }
 *       } else {
 *         return (progress) => {
 *           progress("set progress", self.value());
 *         }
 *       }
 *     });
 *
 */
export const semanticui = {
  update: (element, value_accessor, all_bindings) => {
    const value = ko.unwrap(value_accessor());
    const jq_element = jquery(element);
    for (const [key, value] of Object.entries(value)) {
      if (key === "modal") {
        // modal is not supported here because the jQuery ``modal()`` plugin
        // replaces ``<body>`` and this causes an error from Knockout, because
        // the binding was applied to ``<body>`` more than once.
        console.error("SemanticUI modal instantiation is not supported.");
        return;
      }
      if (value !== undefined) {
        if (typeof value === "function") {
          const callback = (behavior, ...args) => {
            console.debug(
              "Calling SemanticUI component behavior:",
              key,
              element,
              behavior,
              ...args,
            );
            jq_element[key](behavior, ...args);
          };
          value(callback);
        } else {
          // The value is probably an object, and is almost certainly a module
          // configuration for initializing the module
          console.debug(
            "Setting up SemanticUI component:",
            key,
            value,
            element,
          );
          jq_element[key](value);
        }

        // Set attribute for CSS selector on element. This is used to avoid
        // initializing SUI jQuery plugins twice on elements.
        jq_element.attr("data-semanticui-" + key, true);
      }
    }
  },
};

/**
 * Tab group SUI module helper
 *
 * The tab module is instantiated in a unique way that conflicts with the normal
 * patterns used for instantiating FUI modules here. Instead of being called on
 * a singular element, the tab module is called on child elements of a menu.
 * That is, the tab module would normally be set up on multiple modules at a
 * time with ``$(".ui.menu > .item").tab({...})``.
 *
 * Calling the module on multiple ``.item`` elements in a query is important,
 * or we end up instantiating a tab menu for each menu item and the tab menu
 * does not work correctly.
 *
 * In short, this consolidates the tab module instantiation onto a query
 * instead of a singular element like the ``semanticui`` data binding normal
 * would.
 */
function jquery_tabmenu(settings) {
  return this.each((index, elem) => {
    $(elem).find(".item").tab(settings);
  });
}
