import jquery from "jquery";
import ko from "knockout";
import semantic_ui_transition from "semantic-ui-transition";
import semantic_ui_dropdown from "semantic-ui-dropdown";
import semantic_ui_popup from "semantic-ui-popup";
import semantic_ui_modal from "semantic-ui-modal";
import semantic_ui_dimmer from "semantic-ui-dimmer";
import semantic_ui_progress from "semantic-ui-progress";
import semantic_ui_search from "semantic-ui-search";
import semantic_ui_api from "semantic-ui-api";
import semantic_ui_accordion from "semantic-ui-accordion";
import semantic_ui_tab from "semantic-ui-tab";

// SemanticUI JS is brought in piecemeal, through separate dependencies
export function configure_jquery() {
  jquery.fn.transition = semantic_ui_transition;
  jquery.fn.dropdown = semantic_ui_dropdown;
  jquery.fn.popup = semantic_ui_popup;
  jquery.fn.modal = semantic_ui_modal;
  jquery.fn.dimmer = semantic_ui_dimmer;
  jquery.fn.progress = semantic_ui_progress;
  jquery.fn.search = semantic_ui_search;
  jquery.fn.api = semantic_ui_api;
  jquery.fn.accordion = semantic_ui_accordion;
  jquery.fn.tab = semantic_ui_tab;
}

// HTML binding. Gets initial value as HTML, sets HTML in return
export const htmlInit = add_init_handler(
  (element) => {
    return element.innerHTML;
  },
  (property) => {
    return { html: property };
  }
);

// Text binding. Gets initial value as node inner text, sets inner text in return
export const textInit = add_init_handler(
  (element) => {
    return element.innerText;
  },
  (property) => {
    return { text: property };
  }
);

// Value init binding. Gets initial value as node value, sets value in return
export const valueInit = add_init_handler(
  (element) => {
    return element.value;
  },
  (property) => {
    return { value: property };
  }
);

// JSON binding. Gets initial value as JSON from node inner HTML, doesn't
// set anything in return
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
      value_accessor()
    );
    const jq_element = jquery(element);
    jq_element.popup(config).hover(() => {
      context.$rawData.show();
    });
  },
};

/**
 * Message plugin for Knockout
 *
 * This manipulates the child DOM to provide messages that can be dismissed by
 * either closing via the close button, or clicking the link in the message.
 * This will fade out the message.
 *
 * This is a plugin as we manipulate JQuery elements directly. Knockout views
 * are not a good fit here because the underlying JQuery element is not
 * surfaced to Knockout views.
 *
 * Usage:
 *
 *     <div data-bind="message: {}"></div>
 *     <div data-bind="message: {dismiss_url: '/foo'}"></div>
 *
 */
export const message = {
  init: (element, value_accessor, bindings, view, context) => {
    const jq_element = jquery(element);

    const config = value_accessor()

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
  }
};

export const semanticui = {
  update: (element, value_accessor, all_bindings) => {
    const value = ko.unwrap(value_accessor());
    for (const [key, value] of Object.entries(value)) {
      if (value !== undefined) {
        console.debug('Setting up SemanticUI component:', key, value, element);
        // Call jquery(element).search(value), but dynamically
        jquery(element)[key](value);
      }
    }
  },
};
