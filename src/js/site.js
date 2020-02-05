const ko = require('knockout');
const jquery = require('jquery');

window.jQuery = jquery;
window.$ = jquery;

jquery.fn.transition = require('semantic-ui-transition');
jquery.fn.dropdown = require('semantic-ui-dropdown');
jquery.fn.dropdown = require('semantic-ui-popup');

var resizePopup = function(){$('.ui.popup').css('max-height', $(window).height());};

$(window).resize(function(e){
    resizePopup();
});


jquery(document).ready(function () {
    console.log('ready!');
    jquery('.ui.dropdown').dropdown({action: 'hide'});
})
