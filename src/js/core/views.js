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

/*
 * ResponsiveView is used to create bindings that alter elements on changes to
 * the viewport width.
 *
 * Usage in a binding context:
 *
 *   <div class="ui menu" data-bind="css: {vertical: device.mobile()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.tablet()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.computer()}">
 *   <div class="ui menu" data-bind="css: {vertical: device.large_screen()}">
 */
export class ResponsiveView {
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
