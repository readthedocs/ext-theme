import ko from "knockout";
import { msg } from "@lit/localize";

import { Registry } from "../application/registry";

/**
 * Listing view for social account connections.
 *
 * This view is subclassed by the :js:cls:`LoginView`, as the templates that
 * use this code are shared between the social account connection listing view
 * and the login view. On the social account listing we don't want the same
 * features for last login method etc so this view overloads the functions
 * used.
 */
export class SocialAccountView {
  static view_name = "SocialAccountView";

  constructor(options) {
    this.github_modal_config = ko.observable();
  }

  show_github_modal() {
    this.github_modal_config((modal) => modal("show"));
  }

  // No-op to skip popup setup
  popup_login_method() {}

  save_login_method() {
    return true;
  }
}

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
export class LoginView extends SocialAccountView {
  static view_name = "LoginView";

  constructor(options) {
    super(options);

    /** @observable {string} Last tab to be selected. Comes from view */
    this.last_tab = ko.observable(options?.last_tab || "vcs");
    /** @observable {string} Last method to be used. Comes from view */
    // XXX fix default, this is just for testing
    this.last_method = ko.observable(options?.last_method || "githubapp");

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
   * Accepts multiple method ids just because we have a GitHub sub-modal right
   * now. This can be removed eventually.
   *
   * @param {string|Array.<string>} method - Method id or list of method ids
   * @param {string} position - Position to pass to SUI popup position attribute
   * @param {string} method - Method id
   */
  popup_login_method(method, position = "top center", fuzzy = true) {
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
      if (!Array.isArray(method) && this.last_method() == method) {
        popup("show");
      } else if (Array.isArray(method) && method.includes(this.last_method())) {
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

  // On top of showing the GitHub modal, show any popups for GitHub providers as
  // well. This avoids requiring the popups to always be visible and avoids
  // manual removal of the popups.
  show_github_modal() {
    super.show_github_modal();
    const last_method = this.last_method();
    if (["github", "githubapp"].includes(last_method)) {
      console.debug(last_method, this.popups, this.popups[last_method]);
      this.popups[last_method]((popup) => popup("show"));
    }
  }
}

Registry.add_view(SocialAccountView);
Registry.add_view(LoginView);
