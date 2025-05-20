import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import DOMPurify from "dompurify";

import { LightDOMElement } from "../application/elements";

/**
 * Notification
 *
 * Used internally and directly to render a notification API response. This
 * element is not rendered using element attributes, but it is possible to
 * pass in a full notification API response item via the ``notification``
 * object attribute.
 *
 * @param {Object} notification - Single item from notification API response
 * @param {string} csrfToken - CSRF token from Django, attribute ``csrf-token``
 * @param {Boolean} inverted - Whether the message is ``inverted`` variant
 **/
export class NotificationElement extends LightDOMElement {
  static properties = {
    csrfToken: { type: String, attribute: "csrf-token" },
    notification: { state: true },
    inverted: { type: Boolean },
  };

  render() {
    if (this.notification === undefined || this.notification.message === null) {
      return nothing;
    }

    // classMap can't be mixed with any other template logic inside ``class=``
    // so we include all conditional logic outside.
    const classes = {
      // Explicitly always invert high level messages to make sure these are
      // more visible than tip/note messages.
      inverted:
        this.inverted ||
        ["error", "warning", "info"].includes(this.notification.message.type),
    };
    classes[this.notification.message.type] = true;

    return html`
      <div class="ui ${classMap(classes)} notification message">
        ${when(
          this.notification.dismissable,
          () => html`
            <i
              class="fas fa-xmark close inline icon"
              @click=${this.dismiss}
            ></i>
          `,
        )}
        <h5 class="header">
          <i class="fad ${this.notification.message.icon_classes} icon"></i>
          ${unsafeHTML(this.notification.message.header)}
        </h5>
        <p>${unsafeHTML(this.notification.message.body)}</p>
      </div>
    `;
  }

  dismiss() {
    console.debug("Dismissing notification:", this.notification.id);
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken,
      },
      body: JSON.stringify({
        state: "dismissed",
      }),
    };
    fetch(this.notification._links._self, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid API request");
        }
        // Use FUI transition module to fade out and remove the notification
        jquery(this).transition({
          animation: "fade",
          onComplete: () => {
            this.parentElement.removeChild(this);
          },
        });
      })
      .catch((err) => {
        console.error("Error dismissing notification", err);
      });
  }
}

/**
 * NotificationListElement
 *
 * This is the wrapper to :js:class:`NotificationElement`, and provides the initial
 * API interaction to populate all of the notification element instances with
 * data.
 *
 * @param {string} url - APIv3 notification URL to use
 * @param {string} csrfToken - Django CSRF token
 * @param {string} state - Notification states to filter for
 * @param {Boolean} inverted - Whether inverted variant should be forced
 **/
export class NotificationListElement extends LightDOMElement {
  static properties = {
    url: { type: String },
    csrfToken: { type: String, attribute: "csrf-token" },
    state: { type: String },
    inverted: { type: Boolean },

    notifications: { state: true },
    request: { state: true },
  };

  constructor() {
    super();
    this.state = "read,unread";
  }

  fetchNotifications() {
    if (!this.url || this.request !== undefined) {
      return;
    }
    const params = new URLSearchParams({
      state__in: this.state,
    });
    this.request = fetch(`${this.url}?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data?.results === undefined) {
          throw new Error("Invalid notification API response");
        }
        return data.results;
      })
      .then((notifications) => {
        if (notifications) {
          this.notifications = notifications.map((notification) => {
            notification.message.header = DOMPurify.sanitize(
              notification.message.header,
            );
            notification.message.body = DOMPurify.sanitize(
              notification.message.body,
            );
            return notification;
          });
        }
      })
      .catch((err) => {
        console.error(`Error fetching notifications from ${this.url}`, err);
      });
  }

  render() {
    // Trigger async notification fetch
    this.fetchNotifications();

    if (this.notifications && this.notifications.length > 0) {
      return repeat(
        this.notifications,
        (notification) => notification.id,
        (notification, index) => {
          const elem = document.createElement("readthedocs-notification");
          elem.notification = notification;
          elem.csrfToken = this.csrfToken;
          elem.inverted = this.inverted;

          // For FUI .ui.list.item
          elem.className = "item";
          return elem;
        },
      );
    } else {
      return nothing;
    }
  }
}

customElements.define("readthedocs-notification", NotificationElement);
customElements.define("readthedocs-notification-list", NotificationListElement);
