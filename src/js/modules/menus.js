import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";

import { LightDOMElement } from "../application/elements";

/**
 *  API event on click
 *
 *  Generic button/link wrapper to POST to a URL on click, much like a form
 *  handling button. Handles error feedback via toast message and redirection on
 *  success.
 **/
export class APIWrapper extends LightDOMElement {
  static properties = {
    csrfToken: { type: String, attribute: "csrf-token" },
    method: { type: String },
    url: { type: String },
    urlSuccess: { type: String, attribute: "url-success" },
    errorMessage: { type: String, attribute: "error-message" },
  };

  constructor() {
    super();
    this.method = "POST";
    this.errorMessage = "There was a problem with your request";
  }

  // This is just a wrapper, so we rely on the inner HTML for all of the
  // display and instead just wrap the outer with a clickable element.
  render() {
    this.addEventListener("click", () => {
      this.sendRequest();
    });
  }

  sendRequest() {
    const classes = this.classList;
    classes.add("loading");

    const options = {
      method: this.method,
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
        this.processData(data);
        if (this.urlSuccess) {
          window.location.href = this.urlSuccess;
        }
      })
      .catch((err) => {
        jquery.toast({
          class: "error",
          message: this.errorMessage,
        });
      })
      .finally(() => {
        classes.remove("loading");
      });
  }

  processData(data) {
    // TODO don't hard code this. I suppose we need multiple elements for each
    // button/event type, so that we can hard code the success logic or redirect
    // URL.
    this.urlSuccess = data.build.urls.build;
  }
}

customElements.define("readthedocs-api-button", APIWrapper);
