import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

/* Notification
 *
 * Used internally and directly to render a notification API response. This
 * element is not rendered using element attributes.
 */
export class Notification extends LitElement {
  static properties = {
    csrfToken: { type: String, attribute: "csrf-token" },
    notification: { state: true },
  };

  // Use light DOM with inherited styles instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  render() {
    if (this.notification === undefined) {
      return nothing;
    }
    return html`
      <div class="ui small ${this.notification.message.type} message">
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
        ${unsafeHTML(this.notification.message.body)}
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
    fetch(this.notification._links._self, options).then((response) => {
      if (response.ok) {
        // Use FUI transition module to fade out and remove the notification
        jquery(this).transition({
          animation: "fade",
          onComplete: () => {
            this.parentElement.removeChild(this);
          },
        });
      } else {
        console.debug("Error dismissing notification", response);
      }
    });
  }
}

export class NotificationList extends LitElement {
  static properties = {
    url: { type: String },
    csrfToken: { type: String, attribute: "csrf-token" },
    state: { type: String },
    notifications: { state: true },
    finished: { state: true, type: Boolean },
    build: { type: String },
  };

  constructor() {
    super();
    this.state = "unread";
  }

  // Use light DOM with inherited styles instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  fetchNotifications() {
    if (!this.url || this.finished) {
      return;
    }
    const params = new URLSearchParams({
      state: this.state,
    });
    fetch(`${this.url}?${params}`).then((response) => {
      response.json().then((data) => {
        if (data.results) {
          this.notifications = data.results;
        }
      });
      this.finished = true;
    });
  }

  render() {
    // Trigger async notification fetch
    this.fetchNotifications();

    if (this.notifications && this.notifications.length > 0) {
      //return html`
      //    ${repeat(
      return repeat(
        this.notifications,
        (notification) => notification.id,
        (notification, index) => {
          const elem = document.createElement("readthedocs-notification");
          elem.notification = notification;
          elem.csrfToken = this.csrfToken;

          // For FUI .ui.list.item
          elem.className = "item";
          return elem;
        },
      );
      //    )}
      //`;
    } else {
      return nothing;
    }
  }
}

customElements.define("readthedocs-notification", Notification);
customElements.define("readthedocs-notification-list", NotificationList);
