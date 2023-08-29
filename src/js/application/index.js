import jquery from "jquery";
import ko from "knockout";
import clipboard from "clipboard";

import { ApplicationView } from "./views";
import * as plugins from "./plugins";
import { Registry } from "./registry";

// Application views
import * as build_views from "../build";
import * as core_views from "../core";
import * as docs_views from "../docs";
import * as gold_views from "../gold";
import * as module_views from "../modules";
import * as organization_views from "../organization";
import * as project_views from "../project";

/**
 * This is the main entry point for the front end code and is used to set up and
 * instantiate Webpack, Knockout, and SemanticUI. This class is used to set up
 * and instantiate all of the front end functionality. The main entry point is
 * :meth:`Application.run`.
 */
export class Application {
  constructor() {
    this.registry = new Registry();
  }

  /**
   * This is the first method to be executed after instantiation. It handles
   * all of the set up and instantiation.
   *
   * - :meth:`Application.load_config` loads the site configuration
   * - :meth:`Application.configure_plugins` loads plugins
   * - :meth:`Application.attach_view` does view routing and attaches the view
   * - :meth:`Application.start_plugins` sets up jQuery plugins on some elements
   */
  run() {
    this.load_config();
    this.configure_plugins();
    this.attach_view();
    this.add_jquery_plugins();
  }

  /**
   * Load site configuration from a special ``application/json`` script element.
   * This configures paths for Webpack async imports, console debugging.
   *
   * .. seealso::
   *     Convention on :ref:`js-json-config`
   */
  load_config() {
    console.debug("Loading site front end configuration from script tag");

    const site_config_src = jquery("script#site-config").text() || "{}";
    const site_config = JSON.parse(site_config_src);
    if (site_config.webpack_public_path) {
      __webpack_public_path__ = site_config.webpack_public_path;
      global.__webpack_public_path__ = window.__webpack_public_path__ =
        site_config.webpack_public_path;
    }
    // Null route debug logging, don't do output anything that was debug
    if (!site_config.debug) {
      console.debug = () => {};
    }

    return site_config;
  }

  /**
   * Add jQuery and Knockout plugins so that HTML and JS can use these plugins.
   * This is mainly just the various import logic and configuration, not where
   * we would run something like ``$('.ui.modal').modal()``.
   */
  configure_plugins() {
    plugins.configure_jquery_plugins();
    plugins.configure_knockout_plugins();
  }

  /**
   * Attach the :class:`ApplicationView` view router, which gives templates
   * access to all views that we have available. This is how we are able to
   * reference a view in a Knockout data binding.
   */
  attach_view() {
    const view = new ApplicationView();
    this.registry.attach(view);
    view.attach();
  }

  /**
   * Set up jQuery and SUI jQuery plugins that were not explicitly set up in
   * templates. Elements that are configured inside templates use the Knockout
   * plugin :func:`~application.plugins.semanticui`. This allows for explicit
   * set up of an element's plugin, and should be the standard way to attach a
   * jQuery plugin to an element.
   *
   * We don't do generic targeting of elements when setting up jQuery plugins as
   * there are a number of places where an element needs to be initialized with
   * specific plugin configuration. It's easiest to define in HTML what plugin
   * and plugin configuration the element needs.
   *
   * .. warning::
   *     Generic targeting use should be avoided and it's use deprecated.
   */
  add_jquery_plugins() {
    // TODO remove instances of these in code and replace with the explicit
    // semanticui KO plugin.
    jquery(".ui.progress:not([data-semanticui-progress])").progress();
    jquery(".ui.accordion:not([data-semanticui-accordion])").accordion();
    jquery(".ui.dropdown:not([data-semanticui-dropdown])").dropdown({
      placeholder: "",
    });
    // Automatically convert ``<select>`` in a nested dropdown element. This is
    // used with Crispy form fields and other Django form fields mostly.
    jquery(".ui.dropdown[data-semanticui-dropdown] > select").dropdown({
      placeholder: "",
    });

    // Enable popup functionality with a broad CSS selector here because
    // `data-content` is very basic usage of a popup. Anything more complicated
    // should use the semanticui KO plugin.
    jquery("[data-content]:not([data-semanticui-popup])").popup({
      position: "top center",
      delay: {
        show: 500,
      },
      variation: "small",
    });
    jquery(".ui.menu > .item[data-tab]").tab();

    /* Initialize clipboard.js using a few selectors that we are using. This
     * isn't a great fit for Knockout custom data binding or plugin, as the
     * library uses some builtin/hardcoded selectors. */
    var clipboard_global = new clipboard(
      "[data-clipboard-text], [data-clipboard-target]"
    );
    // Provide the user with some visual feedback using FUI popups
    jquery("[data-clipboard-text], [data-clipboard-target]").popup({
      on: "click",
      hoverable: false,
      content: "Copied!",
    });
  }
}
