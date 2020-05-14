const jquery = require('jquery');
const clipboard = require('clipboard');

// Application views
export const build = require("./build");

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
    jquery('.ui[data-popup]').popup({hoverable: true});
    jquery('.ui.progress').progress();

    // Dropdowns
    // For .ui.link.dropdown, alter the action to only allow selectiong, and allow
    // select by keyboard for .ui.link.search.dropdown
    let dropdowns = jquery('.ui.dropdown');
    dropdowns.add('.link').dropdown({
      action: 'hide',
      onChange: function(value, text, $selectedItem) {
        const url = $selectedItem.attr('href');
        window.location = url;
      },
    })
    dropdowns.not('.link').dropdown();

    jquery('.ui.button[data-modal]').on('click', function () {
        var modal_selector = $(this).attr('data-modal');
        if (modal_selector) {
            $(modal_selector).modal('show');
        }
    });

    // Initialize clipboard, but only for data-clipboard-text. This is the most
    // generalized pattern for clipboard usage, so I won't yet worry about
    // adding the other data binding selectors.
    var clipboard_global = new clipboard('.ui.button[data-clipboard-text]');
});
