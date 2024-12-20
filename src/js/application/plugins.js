import jquery from "jquery";
import ko from "knockout";

// TODO this is only really needed while testing, it could be behind a
// conditional
import "./globals";

import Plausible from "plausible-tracker";

// Required for FUI tab module
import * as jqueryAddress from "jquery-address";

/* CommonJS require instead of import syntax on purpose */
import * as fomanticVisibility from "fomantic-ui-less/definitions/behaviors/visibility.js";
import * as fomaticForm from "fomantic-ui-less/definitions/behaviors/form.js";
import * as fomaticState from "fomantic-ui-less/definitions/behaviors/state.js";
import * as fomaticAPI from "fomantic-ui-less/definitions/behaviors/api.js";
import * as fomaticTransition from "fomantic-ui-less/definitions/modules/transition.js";
import * as fomaticTab from "fomantic-ui-less/definitions/modules/tab.js";
import * as fomaticDropdown from "fomantic-ui-less/definitions/modules/dropdown.js";
import * as fomaticModal from "fomantic-ui-less/definitions/modules/modal.js";
import * as fomaticSearch from "fomantic-ui-less/definitions/modules/search.js";
import * as fomaticSticky from "fomantic-ui-less/definitions/modules/sticky.js";
import * as fomaticShape from "fomantic-ui-less/definitions/modules/shape.js";
import * as fomaticAccordian from "fomantic-ui-less/definitions/modules/accordion.js";
import * as fomaticSidebar from "fomantic-ui-less/definitions/modules/sidebar.js";
import * as fomaticDimmer from "fomantic-ui-less/definitions/modules/dimmer.js";
import * as fomaticCheckbox from "fomantic-ui-less/definitions/modules/checkbox.js";
import * as fomaticSlider from "fomantic-ui-less/definitions/modules/slider.js";
import * as fomaticPopup from "fomantic-ui-less/definitions/modules/popup.js";
import * as fomaticEmbed from "fomantic-ui-less/definitions/modules/embed.js";
import * as fomaticProgress from "fomantic-ui-less/definitions/modules/progress.js";
import * as fomaticToast from "fomantic-ui-less/definitions/modules/toast.js";
import * as fomaticSite from "fomantic-ui-less/definitions/globals/site.js";

/**
 * Set up jQuery plugins. SemanticUI jQuery plugins are brought in piecemeal,
 * through separate dependencies. This allows for a smaller footprint.
 */
export function configure_jquery_plugins() {
  jquery.fn.site("normalize");
  jquery.fn.tabs = jquery_tabmenu;
  // ``tabmenu`` was ported from our website, but ``tabs`` is nicer
  jquery.fn.tabmenu = jquery_tabmenu;
  jquery.fn.plausible = jqueryPlausible;
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
  ko.bindingHandlers.semanticui = semanticui;
  ko.bindingHandlers.webcomponent = webcomponent;
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
  try {
    return JSON.parse(element.innerHTML);
  } catch (err) {
    console.error(err);
    return {};
  }
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
 * Web component bridge binding
 *
 * This binding is used to help bridge Knockout views and web components, but
 * allowing observables to set web component attributes when updated.
 *
 * It's important to note that there is likely a bit of extra overhead here as
 * both Knockout and Lit have differing patterns for property/observable
 * lifecycles. That is, Knockout will process the observable change with
 * multiple calls, and then pass the value off to the LitElement, which will do
 * its own round of internal calls to update the property value.
 *
 * Either way, this binding can help with the transition to web components.
 *
 * With an underlying Knockout view, a web component property can be updated
 * with this data binding like so:
 *
 * .. code:: html
 *
 *     <readthedocs-foo data-bind="webcomponent: {someProperty: someObservable}">
 *
 * In the above example here, the web component property ``someProperty`` is
 * updated by the Knockout view observable ``someObservable``. When there is an
 * update to the observable in the Knockout view, this property will then be
 * updated on the web component. This can be a full object, this pattern is not
 * limited to data primitives, like when using web components from HTML.
 */
export const webcomponent = {
  update: (element, value_accessor, all_bindings) => {
    const binding_value = ko.unwrap(value_accessor());
    for (const [key, value] of Object.entries(binding_value)) {
      if (value !== undefined) {
        if (typeof value === "function") {
          console.error("Unsupported function in data binding");
        } else {
          element[key] = value;
        }
      }
    }
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
    const binding_value = ko.unwrap(value_accessor());
    const jq_element = jquery(element);
    for (const [key, value] of Object.entries(binding_value)) {
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
 * Plausible tracking module
 *
 * This reuses jQuery to provide explicit tracking of events at Plausible. To
 * use events, add the ``data-analytics-events`` attribute to an element. In most
 * cases, this should be a link element, however in the case of other UI
 * components, it may be a ``<div>`` or ``<button>``
 *
 * You may also define custom event properties with
 * ``data-analytics-property-*`` attributes, the attribute value is passed to
 * Plausible.
 *
 *     <button class="ui button"
 *            data-analytics-events="some-event-id,another-id"
 *            data-analytics-property-foo="bar">
 *       Something
 *     </button>
 *
 * In the case of a link with a ``href`` attribute, the link click event will
 * continue after all events have been tracked at Plausible, or after a 1s
 * timeout passes.
 */
function jqueryPlausible(domain, debug = false) {
  let plausibleSettings = { domain: domain };
  if (debug === true) {
    plausibleSettings.trackLocalhost = true;
  }
  const { trackEvent } = Plausible(plausibleSettings);
  const { trackPageview } = Plausible(plausibleSettings);

  // Track pageview for all pages
  trackPageview();

  return this.each((index, elem) => {
    // ``data-analytics`` is used on the website, but we added some more
    // functionality here so ``data-analytics-events`` is preferred.
    const data = jquery(elem).data();
    const eventNames =
      data.analyticsEvents?.split(/,/) || data.analytics?.split(/,/) || [];
    const eventProperties = {};

    // ``data-analytics-property-*`` attributes are used to populate properties.
    Object.keys(data).forEach((key) => {
      const match = key.match(/analyticsProperty(.*)/);
      if (match) {
        const [_, property] = match;
        eventProperties[property.toLowerCase()] = data[key];
      }
    });

    function handleAnalyticsEvent(event) {
      const isLink =
        elem.tagName != undefined && elem.tagName.toLowerCase() == "a";
      const isMiddleClick = event.type == "auxclick" && event.which == 2;
      const isClick = event.type == "click";
      const isLinkClick =
        isLink &&
        isClick &&
        !elem.target &&
        !(event.ctrlKey || event.metaKey || event.shiftKey);

      if (isMiddleClick || isClick) {
        Promise.all(
          eventNames.map((eventName) => {
            return new Promise((resolve, reject) => {
              const options = { callback: resolve, props: eventProperties };
              trackEvent(eventName, options);
              // Fallback timeout
              setTimeout(() => {
                reject();
              }, 1000);
            });
          }),
        )
          .catch((e) => {
            console.debug(
              "Plausible didn't receive a response for one or more event",
            );
          })
          .finally(() => {
            console.debug(
              "Plausible tracked events:",
              eventNames,
              eventProperties,
            );
            if (isLinkClick && elem.href && elem.href != "#") {
              console.debug("Plausible replaying click event", elem.href);
              window.location = elem.href;
            }
          });
      }

      // If this is a normal click of an anchor element, prevent the default
      // event from propagating and instead wait until the callback
      // returns/expires to redirect the current page URL. If the user held
      // control/shift/meta while clicking, we're assuming the browser is doing
      // something special instead and will not block the default event.
      if (isLinkClick) {
        event.preventDefault();
        return false;
      }
    }

    // TODO support other methods than click
    elem.addEventListener("click", handleAnalyticsEvent);
    elem.addEventListener("auxclick", handleAnalyticsEvent);
  });
}

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
