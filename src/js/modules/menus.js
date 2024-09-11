import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";

import { LightDOMElement } from "../application/elements";

/**
 *  API event wrapper
 *
 *  Generic button/link wrapper to POST to a URL on an event like "click".
 *  Handles error feedback via toast message and redirection on success.
 *
 * @param {string} csrfToken - CSRF token from Django, attribute ``csrf-token``
 * @param {string} url - API URL for request
 *
 **/
export class APIEventWrapper extends LightDOMElement {
  static properties = {
    csrfToken: { type: String, attribute: "csrf-token" },
    url: { type: String },

    // For API response
    data: { state: true },
  };

  static method = "POST";
  static event = "click";
  static errorMessage = "There was a problem with your request";

  // This is just a wrapper, so we rely on the inner HTML for all of the
  // display and instead just wrap the outer with a clickable element.
  render() {
    this.addEventListener(this.constructor.event, () => {
      this.sendRequest();
    });
  }

  sendRequest() {
    const classes = this.classList;
    classes.add("loading");

    const options = {
      method: this.constructor.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken,
      },
    };

    this.request = fetch(`${this.url}`, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        console.debug("Received API reponse:", data);
        this.data = data;
        const urlSuccess = this.getSuccessURL();
        if (urlSuccess) {
          window.location.href = urlSuccess;
        }
      })
      .catch((err) => {
        this.onError(err);
      })
      .finally(() => {
        classes.remove("loading");
      });
  }

  /** Return URL to redirect to on success
   *
   * Can use ``this.data`` to get API return from ``_link`` and other fields.
   *
   * @returns {string} - URL
   **/
  getSuccessURL() {
    return;
  }

  /** Display error toast message on request error
   *
   * @param {Error} err - Exception raised during request
   **/
  onError(err) {
    jquery.toast({
      class: "error",
      message: this.constructor.errorMessage,
    });
  }
}

/** Menu item for rebuilding a version **/
class MenuBuildRebuildElement extends APIEventWrapper {
  // TODO translate this here or use a different pattern
  static errorMessage =
    "There was an error starting a new build for this version";

  getSuccessURL() {
    return this?.data?.build?.urls?.build;
  }
}

customElements.define(
  "readthedocs-menu-build-rebuild",
  MenuBuildRebuildElement,
);

/** Menu item for resyncing all **/
class MenuSyncAllVersionsElement extends APIEventWrapper {
  // TODO translate this here or use a different pattern
  static errorMessage = "There was an error syncing versions";

  getSuccessURL() {
    // Refresh the existing page to hopefully show new versions in 3 seconds, so they have time to sync.
    // This is a bit of a hack, but it's better than nothing.
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}

customElements.define(
  "readthedocs-menu-sync-all-versions",
  MenuSyncAllVersionsElement,
);
