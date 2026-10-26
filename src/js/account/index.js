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
 *       <button data-bind="click: save_login_method.bind($data, 'email'), semanticui: { popup: popup_login_method('email') }">
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
    this.last_method = ko.observable(options?.last_method);

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
  popup_login_method(method, position = "top center") {
    this.popups[method] = ko.observable((popup) => {
      // First set up the element as a manual popup, then manually show it.
      // This is using the anonymous function pattern for passing arguments to
      // the ``popup()`` jQuery plugin binding, via :func:`application.plugins.semanticui`
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
   *       <button data-bind="click: save_login_method.bind($data, 'email')">
   *         Log in using GitHub
   *       </button>
   *     </form>
   *
   * @param {string} method - Method id
   * @returns {knockout_click}
   */
  save_login_method(method) {
    console.debug("Saving last login method:", method);
    let cookie = `last-login-method=${method}`;
    if (window.isSecureContext) {
      cookie = cookie + `; Secure`;
    }
    document.cookie = cookie;
    return true;
  }

  // On top of showing the GitHub modal, show any popups for GitHub providers as
  // well. This avoids requiring the popups to always be visible and avoids
  // manual removal of the popups.
  show_github_modal() {
    super.show_github_modal();
    const last_method = this.last_method();
    if (["github", "githubapp"].includes(last_method)) {
      this.popups[last_method]((popup) => popup("show"));
    }
  }
}

Registry.add_view(SocialAccountView);
Registry.add_view(LoginView);
