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

  configure() {
    // TODO make this a function somewhere
    jquery(".ui.progress").progress();
    jquery(".ui.accordion").accordion();
    // We only enable popup functionality with a broad CSS selector here
    // because `data-content` is very basic usage of a popup. Anything more
    // complicated should use the `semanticui` KO plugin.
    jquery(".ui[data-content]").popup();
    jquery(".ui.menu > .item[data-tab]").tab();

    // Dropdowns
    // For .ui.link.dropdown, alter the action to only allow selecting, and allow
    // select by keyboard for .ui.link.search.dropdown. We separate dropdown
    // with nested select elements so that we don't double initialize the
    // dropdown, which breaks things. Using a select in a dropdown is mostly
    // used by crispy forms.
    // TODO make this more efficient, selectors can reduce the work here
    jquery(".ui.dropdown:not(.manual)").each((index, obj) => {
      const dropdown = jquery(obj);
      const child_select = dropdown.children("select");

      if (child_select.length > 0) {
        child_select.dropdown({ placeholder: "" });
      } else {
        dropdown.add(".link").dropdown({
          action: "hide",
          onChange: function (value, text, $selectedItem) {
            const url = $selectedItem.attr("href");
            window.location = url;
          },
        });
        dropdown.not(".link").dropdown({ placeholder: "" });
      }
    });

    jquery(".ui.button[data-modal]").on("click", function () {
      var modal_selector = jquery(this).attr("data-modal");
      if (modal_selector) {
        jquery(modal_selector).modal("show");
      }
    });

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
    this.configure();
    this.attach_view();
  }
}
