import jquery from "jquery";
import clipboard from "clipboard";
import RouteRecognizer from "route-recognizer";

// Application views
export const build = require("./build");
export const project = require("./project");
export const docs = require("./docs");
export const core = require("./core");

// SemanticUI JS is brought in piecemeal, through separate dependencies
jquery.fn.transition = require("semantic-ui-transition");
jquery.fn.dropdown = require("semantic-ui-dropdown");
jquery.fn.popup = require("semantic-ui-popup");
jquery.fn.modal = require("semantic-ui-modal");
jquery.fn.dimmer = require("semantic-ui-dimmer");
jquery.fn.progress = require("semantic-ui-progress");
jquery.fn.search = require("semantic-ui-search");
jquery.fn.api = require("semantic-ui-api");
jquery.fn.accordion = require("semantic-ui-accordion");
jquery.fn.tab = require("semantic-ui-tab");

jquery(document).ready(() => {
  // TODO make this a function somewhere
  jquery(".ui[data-content]").popup();
  jquery(".ui[data-html]").popup({ hoverable: true });
  jquery(".ui[data-popup]").popup({ hoverable: true });
  jquery(".ui.progress").progress();
  jquery(".ui.accordion").accordion();
  jquery(".ui.menu > .item[data-tab]").tab();

  jquery(".ui[data-popup-on-click]").popup({
    on: "click",
  });

  // Dropdowns
  // For .ui.link.dropdown, alter the action to only allow selecting, and allow
  // select by keyboard for .ui.link.search.dropdown. We separate dropdown
  // with nested select elements so that we don't double initialize the
  // dropdown, which breaks things. Using a select in a dropdown is mostly
  // used by crispy forms.
  // TODO make this more efficient, selectors can reduce the work here
  jquery(".ui.dropdown").each((index, obj) => {
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

  // Search
  /*
    jquery('.ui.search').each((index, obj) => {
      const search = jquery(obj);
      const config_obj = search.children('script.config').first();
      const config_src = config_obj.text();

      if (config_src && config_obj.attr('type') == "application/json") {
        const config = JSON.parse(config_src);
        search.search(config);
      }
    });
    */

  // Initialize clipboard, but only for data-clipboard-text. This is the most
  // generalized pattern for clipboard usage, so I won't yet worry about
  // adding the other data binding selectors.
  var clipboard_global = new clipboard(".ui.button[data-clipboard-text]");
  jquery(".ui.button[data-clipboard-text]").popup({
    on: "click",
    hoverable: false,
  });

  // Messages
  core.views.MessageView.init("#messages .message");

  // Add embedded docs
  docs.embed_docs();

  // Do routing to avoid a per page inline script. Avoid future issues with CSP
  const router = new RouteRecognizer();
  router.add([{
      path: "/dashboard",
      handler: core.views.PopupView,
  }])
  router.add([{
      path: "/projects/:id",
      handler: core.views.PopupView,
  }])

  const results = router.recognize(window.location.pathname);
  if (results !== undefined) {
    const result = results[0];
    result.handler.init(result.params);
  }
});
