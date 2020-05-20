const jquery = require('jquery');
const clipboard = require('clipboard');

// Application views
export const build = require("./build");
export const project = require("./project");

// SemanticUI JS is brought in piecemeal, through separate dependencies
jquery.fn.transition = require('semantic-ui-transition');
jquery.fn.dropdown = require('semantic-ui-dropdown');
jquery.fn.popup = require('semantic-ui-popup');
jquery.fn.modal = require('semantic-ui-modal');
jquery.fn.dimmer = require('semantic-ui-dimmer');
jquery.fn.progress = require('semantic-ui-progress');

jquery(document).ready(() => {
    // TODO make this a function somewhere
    jquery('.ui[data-content]').popup();
    jquery('.ui[data-html]').popup({hoverable: true});
    jquery('.ui[data-popup]').popup({hoverable: true});
    jquery('.ui.progress').progress();

    jquery('.ui[data-popup-on-click]').popup({
      on: 'click',
    })

    // Dropdowns
    // For .ui.link.dropdown, alter the action to only allow selecting, and allow
    // select by keyboard for .ui.link.search.dropdown. We separate dropdown
    // with nested select elements so that we don't double initialize the
    // dropdown, which breaks things. Using a select in a dropdown is mostly
    // used by crispy forms.
    // TODO make this more efficient, selectors can reduce the work here
    jquery('.ui.dropdown').each((index, obj) => {
      const dropdown = jquery(obj);
      const child_select = dropdown.children('select');

      if (child_select.length > 0) {
        child_select.dropdown();
      }
      else {
        dropdown.add('.link').dropdown({
          action: 'hide',
          onChange: function(value, text, $selectedItem) {
            const url = $selectedItem.attr('href');
            window.location = url;
          },
        })
        dropdown.not('.link').dropdown();
      }
    });

    jquery('.ui.button[data-modal]').on('click', function () {
        var modal_selector = jquery(this).attr('data-modal');
        if (modal_selector) {
            jquery(modal_selector).modal('show');
        }
    });

    // Initialize clipboard, but only for data-clipboard-text. This is the most
    // generalized pattern for clipboard usage, so I won't yet worry about
    // adding the other data binding selectors.
    var clipboard_global = new clipboard('.ui.button[data-clipboard-text]');
    jquery('.ui.button[data-clipboard-text]').popup({
      on: 'click',
      hoverable: false,
    })
});
