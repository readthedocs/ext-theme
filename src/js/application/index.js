import jquery from "jquery";
import ko from "knockout";
import clipboard from "clipboard";

import { ApplicationView } from "./views";
import * as plugins from "./plugins";

// Application views
export const docs = require("../docs");
export const core = require("../core");

export class Application {
  constructor() {}

  /**
   * Load site configuration from JSON
   *
   * This is a global configuration, for things like webpack asset URLs and
   * debug mode.
   */
  load_config() {
    console.debug("Loading site front end configuration from script tag");

    // TODO modularize this for reuse, or go global with additional settings?
    const site_config_src = jquery("script#site-config").text() || "{}";
    const site_config = JSON.parse(site_config_src);
    if (site_config.webpack_public_path) {
      __webpack_public_path__ = site_config.webpack_public_path;
      global.__webpack_public_path__ = window.__webpack_public_path__ =
        site_config.webpack_public_path;
    }
    // Null route debug logging
    if (!site_config.debug) {
      console.debug = () => {};
    }

    return site_config;
  }

  /**
   * Do final set up
   *
   * This is for jQuery and SUI jQuery plugins that were not explicitly set up
   * in the templates. There are a number of places where an element needs to
   * be initialized with specific plugin configuration, and so we can't do a
   * blanket configuration of these plugins.
   *
   * The additional negative selectors here are added by the `semanticui` KO
   * plugin and allow an easy way to detect elements that already have jQuery
   * plugins initialized.
   */
  finalize() {
    jquery(".ui.progress:not([data-semanticui-progress])").progress();
    jquery(".ui.accordion:not([data-semanticui-accordion])").accordion();
    jquery(".ui.dropdown:not([data-semanticui-dropdown])").dropdown({placeholder: ""});
    // Automatically convert ``<select>`` in a nested dropdown element. This is
    // used with Crispy form fields and other Django form fields mostly.
    jquery(".ui.dropdown[data-semanticui-dropdown] > select").dropdown({placeholder: ""});
    // We only enable popup functionality with a broad CSS selector here
    // because `data-content` is very basic usage of a popup. Anything more
    // complicated should use the `semanticui` KO plugin.
    jquery(".ui[data-content]:not([data-semanticui-popup])").popup();
    jquery(".ui.menu > .item[data-tab]").tab();

    // Initialize clipboard, but only for data-clipboard-text. This is the most
    // generalized pattern for clipboard usage, so I won't yet worry about
    // adding the other data binding selectors.
    var clipboard_global = new clipboard(".ui.button[data-clipboard-text]");
    jquery(".ui.button[data-clipboard-text]").popup({
      on: "click",
      hoverable: false,
    });
  }

  configure_plugins() {
    plugins.configure_jquery();
    ko.bindingHandlers.htmlInit = plugins.htmlInit;
    ko.bindingHandlers.textInit = plugins.textInit;
    ko.bindingHandlers.jsonInit = plugins.jsonInit;
    ko.bindingHandlers.valueInit = plugins.valueInit;
    ko.bindingHandlers.element = plugins.element;
    ko.bindingHandlers.chart = plugins.chart;
    ko.bindingHandlers.popup = plugins.popup;
    ko.bindingHandlers.message = plugins.message;
    ko.bindingHandlers.semanticui = plugins.semanticui;
  }

  attach_view() {
    const view = new ApplicationView();
    view.attach();
  }

  run() {
    this.load_config();
    this.configure_plugins();
    this.attach_view();
    this.finalize();
  }
}
