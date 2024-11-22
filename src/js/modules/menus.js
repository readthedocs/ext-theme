import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";
import { ContextProvider, ContextConsumer, createContext } from "@lit/context";
import { msg } from "@lit/localize";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

import { LightDOMElement } from "../application/elements";

/**
 * API event wrapper
 *
 * Generic button/link wrapper to POST to a URL on an event like "click".
 * Handles error feedback via toast message and redirection on success.
 *
 * @param {string} csrfToken - CSRF token from Django, attribute ``csrf-token``
 * @param {string} url - API URL for request
 *
 * TODO Deprecate this in favor of APIProviderElement
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
  constructor() {
    super();
    this.addEventListener(this.constructor.event, () => {
      this.onEvent();
    });
  }

  getHeaders() {
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (this.csrfToken) {
      headers["X-CSRFToken"] = this.csrfToken;
    }
    return headers;
  }

  getUrl() {
    return this.url;
  }

  onEvent() {
    if (this.request == undefined) {
      const classes = this.classList;
      classes.add("loading");
      this.sendRequest().finally(() => {
        classes.remove("loading");
      });
    }
  }

  sendRequest() {
    const options = {
      method: this.constructor.method,
      headers: this.getHeaders(),
    };

    this.request = fetch(this.getUrl(), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        console.debug("Received API reponse:", data);
        return this.onResponse(data);
      })
      .catch((err) => {
        this.onError(err);
      });

    return this.request;
  }

  onResponse(data) {
    this.data = data;
    const urlSuccess = this.getSuccessURL();
    if (urlSuccess) {
      window.location.href = urlSuccess;
    }
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

/** Button for resyncing all versions **/
class ButtonSyncAllVersionsElement extends APIEventWrapper {
  // TODO translate this here or use a different pattern
  static errorMessage = "There was an error syncing versions.";

  getSuccessURL() {
    console.log("Successfully synced versions");
  }
}

customElements.define(
  "readthedocs-button-sync-versions",
  ButtonSyncAllVersionsElement,
);

/**
 * Lit data contexts for elements with API interactions
 *
 * These data contexts are provided by :js:class:`APIProviderElement` and
 * consumed by :js:class:`APIConsumerElement`. This allows a central element to
 * execute an API request (table row, or a group of buttons) and for sub elements
 * at any point in the nested DOM to use this response (a button nested in the
 * table row, a submenu in the group of buttons).
 **/
const contextData = createContext(Symbol("data"));
const contextState = createContext(Symbol("state"));

/**
 * API resopnse states enum
 *
 * These are used by API response provider/consumer
 **/
const States = Object.freeze({
  WAITING: Symbol("waiting"),
  LOADING: Symbol("loading"),
  DONE: Symbol("done"),
});

/**
 * Context provider element for API response
 *
 * On an event (mouseover by default), this element starts an API request to the
 * URL specified. It eventually stores the response data in a data context for
 * nested consumer elements.
 *
 * Handles error feedback via toast message and redirection on success.
 *
 * @extends APIEventWrapper
 *
 * TODO This can replace the parent APIEventWrapper element above
 **/
export class APIProviderElement extends APIEventWrapper {
  static method = "GET";
  static event = "mouseover";

  /** @type {ContextProvider} Reactive data context for API response data **/
  _providerData = new ContextProvider(this, {
    context: contextData,
  });

  set data(value) {
    this._providerData.setValue(value);
  }

  /** @type {ContextProvider} Reactive data context for API response state **/
  _providerState = new ContextProvider(this, {
    context: contextState,
  });

  set state(value) {
    this._providerState.setValue(value);
  }

  constructor() {
    super();
    this.state = States.WAITING;
  }

  onEvent() {
    if (this.request == undefined) {
      this.state = States.LOADING;
      this.sendRequest().finally(() => {
        this.state = States.DONE;
      });
    }
  }

  onResponse(data) {
    this.data = data;
  }
}

customElements.define("readthedocs-api", APIProviderElement);

/**
 * Context consumer element for API response
 *
 * This element waits for a parent anywhere up the DOM tree to emit a data
 * context element. There are two data contexts: the response state and the
 * response data.
 *
 * @extends LightDOMElement
 *
 * @property {Boolean} disabled - Render the element in a disabled state
 * @property {String} label - Label for the element and ARIA
 **/
export class APIConsumerElement extends LightDOMElement {
  static properties = {
    disabled: {
      type: Boolean,
    },
    label: {
      type: String,
    },
  };

  /** @type {ContextConsumer} Reactive consumer for API response context data **/
  _consumerData = new ContextConsumer(this, {
    context: contextData,
    subscribe: true,
  });

  get data() {
    return this._consumerData.value;
  }

  /** @type {ContextConsumer} Reactive consumer for API request state context data **/
  _consumerState = new ContextConsumer(this, {
    context: contextState,
    subscribe: true,
  });

  /** @type {State} Reactive context data for API request state **/
  get state() {
    return this._consumerState.value;
  }

  constructor() {
    super();
    this.disabled = false;
  }

  /**
   * Queue event for late loading links
   *
   * Wait until the request promise resolves and then reemit the event to
   * finally follow the link. This is useful for links that have a late-loaded
   * ``href``.
   *
   * Use it in templates with ``html`<div @click="${this.queueEvent}">``
   *
   * @param event {Event} - Click or other event
   **/
  queueEvent(event) {
    if (this.state !== States.DONE) {
      console.debug("Queueing click event:", event);
      event.preventDefault();
      event.stopPropagation();

      this._consumerState.callback = (value) => {
        if (value === States.DONE) {
          console.debug("Replaying click event:", event);
          // dispatchEvent doesn't seem to work here, so we just create a brand
          // new event here instead.
          event.target.click();
        }
      };
    }
  }
}
