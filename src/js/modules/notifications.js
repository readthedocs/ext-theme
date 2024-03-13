import jquery from "jquery";
import { LitElement, css, html, nothing } from "lit";
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';
import {classMap} from 'lit/directives/class-map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {ref, createRef} from 'lit/directives/ref.js';

export class NotificationList extends LitElement {
  static properties = {
    url: {type: String},
    csrfToken: {type: String, attribute: "csrf-token"},
    notifications: {state: true},
    finished: {state: true, type: Boolean},
  };

  // Use light DOM with inherited styles instead of shadow DOM
  createRenderRoot() {
    return this;
  }

  fetchNotifications() {
    if (!this.url || this.finished) {
      return;
    }
    fetch(this.url).then((response) => {
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
      return html`
        <div class="ui vertical relaxed list">
          ${repeat(
            this.notifications,
            (notification) => notification.id,
            (notification, index) => {
              return this.renderNotification(notification);
            }
          )}
        </div>
      `;
    } else {
      return nothing;
    }
  }

  renderNotification(notification) {
    if (notification.dismissed) {
      return nothing;
    }

    // Direct reference to 
    const refClose = createRef();

    return html`
      <div class="ui small ${notification.message.type} message" ${ref(refClose)}>
        ${when(notification.dismissable, () => html`
          <i class="fas fa-xmark close inline icon" @click=${{handleEvent: () => this.dismissNotification(notification, refClose.value), once: true}}></i>
        `)}
        <h5 class="header">
          <i class="fad ${notification.message.icon_classes} icon"></i>
          ${unsafeHTML(notification.message.header)}
        </h5>
        ${unsafeHTML(notification.message.body)}
      </div>
    `
  }

  dismissNotification(notification, element) {
    if (notification.dismissable === false) {
      return;
    }

    console.debug("Dismissing notification:", notification.id);
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
    fetch(notification._links._self, options).then((response) => {
      if (response.ok) {
        // Use FUI transition module to fade out and remove the notification
        jquery(element).transition("fade");
      }
      else {
        console.debug("Error dismissing notification", response);
      }
    });
  }
}

customElements.define("rtd-notification-list", NotificationList);
