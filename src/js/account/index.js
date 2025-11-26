import { Registry } from "../application/registry";

/**
 * LoginView manages login-related functionality including saving the
 * last used login method to a cookie for session persistence.
 *
 * Usage in a binding context:
 *
 * .. code:: html
 *
 *   <div data-bind="using: LoginView()">
 *     <form method="post" action="...">
 *       <button data-bind="click: save_login_method" data-provider="github">
 *         Log in using GitHub
 *       </button>
 *     </form>
 *   </div>
 */
export class LoginView {
  static view_name = "LoginView";

  constructor() {}

  /**
   * Save the provider used for login.
   *
   * This could be used like:
   *
   * .. code:: html
   *
   *     <form method="post" action="...">
   *       <button data-bind="click: save_login_method" data-provider="github">
   *         Log in using GitHub
   *       </button>
   *     </form>
   *
   * @param {Object} data - Context data
   * @param {Event} event - Click event
   * @returns {knockout_click}
   */
  save_login_method(data, event) {
    const elem = event.currentTarget;
    if (window.isSecureContext) {
      console.debug("Setting last login method: ", elem.dataset.provider);
      cookieStore.set("last-login-method", elem.dataset.provider);
    }
    return true;
  }
}

Registry.add_view(LoginView);
