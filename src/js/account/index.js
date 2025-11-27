import ko from "knockout";
import { msg } from "@lit/localize";

import { Registry } from "../application/registry";

/**
 * LoginView saves a cookie for the last login method.
 *
 * Usage:
 *
 * .. code:: html
 *
 *   <div data-bind="using: LoginView()">
 *     <form method="post" action="...">
 *       <button data-bind="click: save_login_method.bind('email'), semanticui: { popup: popup_login_method('email') }">
 *         Log in using GitHub
 *       </button>
 *     </form>
 *   </div>
 */
export class LoginView {
  static view_name = "LoginView";

  constructor(options) {
    /** @observable {string} Last tab to be selected. Comes from view */
    this.last_tab = ko.observable(options?.last_tab || "vcs");
    /** @observable {string} Last method to be used. Comes from view */
    // XXX fix default, this is just for testing
    this.last_method = ko.observable(options?.last_method || "gitlab");

    // This is an named lookup for observables, one for each method. It is
    // populated by the template code as each popup is configured.
    this.popups = {};
  }

  /**
   * Add popup for login method
   *
   * This adds an observable using by the semanticui binding to add and
   * manipulate a popup module on the element.
   *
   * @param {string} method - Method id
   * @param {string} position - Position to pass to SUI popup position attribute
   */
  popup_login_method(method, position = "top center") {
    this.popups[method] = ko.observable((popup) => {
      // This is using the KO data binding method for utilizing SUI module
      // behaviors. Passing this an anonymous function provides access to
      // `$(element).popup()` essentially.
      // First set up the element as a manual popup, then manually show it.
      popup({
        content: msg(`Last used`),
        position: position,
        variation: "mini teal",
        closable: true,
        preserve: true,
        on: "manual",
      });
      if (this.last_method() == method) {
        popup("show");
      }
    });
    return this.popups[method]();
  }

  /**
   * Save a cookie to track last login method.
   *
   * This could be used like:
   *
   * .. code:: html
   *
   *     <form method="post" action="...">
   *       <button data-bind="click: save_login_method.bind('email')">
   *         Log in using GitHub
   *       </button>
   *     </form>
   *
   * @param {string} method - Method id
   * @returns {knockout_click}
   */
  save_login_method(method) {
    if (window.isSecureContext) {
      console.debug("Setting last login method:", method);
      cookieStore.set("last-login-method", method);
    } else {
      console.debug("Insecure, not setting last login method:", method);
    }
    return true;
  }
}

Registry.add_view(LoginView);
