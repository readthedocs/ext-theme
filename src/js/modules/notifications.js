import { LitElement, css, html, nothing } from "lit";
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';
import {classMap} from 'lit/directives/class-map.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

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
    return html`
      <div class="ui ${notification.message.type} message">
        ${when(notification.dismissable, () => html`
          <i class="fas fa-xmark close inline icon" @click=${{handleEvent: () => this.dismissNotification(notification), once: true}}></i>
        `)}
        <div class="header">
          <i class="fad ${notification.message.icon_classes} icon"></i>
          ${unsafeHTML(notification.message.header)}
        </div>
        ${unsafeHTML(notification.message.body)}
      </div>
    `
  }

  dismissNotification(notification) {
    console.debug("Dismissing notification:", notification.id);
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken,
      },
      body: {
        state: "dismissed",
      },
    };
    fetch(notification._links._self, options).then((response) => {
      console.log(response);
      // TODO error catch response
      response.json().then((data) => {
        console.log(data);
      });
    });
  }
}

customElements.define("rtd-notification-list", NotificationList);
