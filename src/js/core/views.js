import ko from "knockout";
import jquery from "jquery";

// Constants, pulled from SUI:
// https://semantic-ui.com/elements/container.html
const breakpoints = {
  mobile: 0,
  tablet: 768,
  computer: 992,
  large_screen: 1200,
};

export class ResponsiveView {
  /**
   * :class:`ResponsiveView` is used to create bindings that alter elements on
   * changes to the viewport width. This can be used to add an SUI class when the
   * viewport width changes.
   *
   * Usage in a binding context:
   *
   * .. code:: html
   *
   *   <div class="ui menu" data-bind="css: {vertical: device.mobile()}">
   *   <div class="ui menu" data-bind="css: {vertical: device.tablet()}">
   *   <div class="ui menu" data-bind="css: {vertical: device.computer()}">
   *   <div class="ui menu" data-bind="css: {vertical: device.large_screen()}">
   */
  constructor() {
    this.viewport_width = ko.observable();
    this.device = {
      mobile: ko.observable(true),
      tablet: ko.observable(false),
      computer: ko.observable(false),
      large_screen: ko.observable(false),
    };

    // Don't send too many events to listeners
    this.viewport_width.extend({ ratelimit: 500 });
    this.viewport_width.subscribe((width) => {
      for (const device_name of Object.keys(this.device)) {
        const is_device = width >= breakpoints[device_name];
        this.device[device_name](is_device);
      }
    });

    // Update window width. This will trigger changes to this.device
    const jq_window = jquery(window);
    const fn_update = () => {
      this.viewport_width(jq_window.width());
    };
    jq_window.on("resize", fn_update);
    fn_update();
  }
}

/* Knockout binding to help show popups
 *
 * This is used inside normal Django templates, where we iterate
 * over a list of objects inside the template, not inside hte KO
 * view. This binding will create individual popup contexts.
 *
 */
export class PopupView {
  create_popup() {
    return new Popup();
  }
}

export class Popup {
  constructor() {
    this.is_showing = ko.observable(false);
  }

  show() {
    this.is_showing(true);
  }

  hide() {
    this.is_showing(false);
  }
}

export class APIListItemView extends PopupView {
  constructor(data) {
    super();
    this.id = data.id;
    this.url = data.url;
    this.loaded = ko.observable(false);
    this.loading = ko.observable(false);
    this.promise = null;
    this.data = ko.observable();
  }

  fetch() {
    if (this.promise) {
      return this.promise;
    }
    this.promise = new Promise((resolve, reject) => {
      if (this.loaded()) {
        return resolve(this.data());
      }
      this.loading(true);
      jquery.getJSON(this.url).then((data) => {
        this.data(data);
        this.loaded(true);
        this.loading(false);
        return resolve(data);
      });
    });
  }
}
