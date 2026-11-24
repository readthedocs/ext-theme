import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

export class PopupcardView {
  static view_name = "PopupcardView";

  constructor(url, url_notifications) {
    this.url = url;
    this.url_notifications = url_notifications;

    /** @observable {Boolean} Is the popup showing currently? */
    this.is_showing = ko.observable(false);
    this.is_showing.subscribe((is_showing) => {
      if (is_showing) {
        this.fetch();
      }
    });
    /** @observable {Boolean} Is the popup loading from the API? */
    this.is_loading = ko.observable(false);
    /** @observable {Boolean} Is the popup loading from the API? */
    this.is_loaded = ko.observable(false);

    /** @computed */
    this.popup = ko.observable();
    /** @computed */
    this.popup_config = ko.computed(() => {
      const popup = this.popup();
      if (ko.computedContext.isInitial()) {
        return {
          hoverable: true,
          delay: {
            show: 200,
            hide: 200,
          },
          onShow: () => {
            this.is_showing(true);
          },
          onHide: () => {
            this.is_showing(false);
          },
        };
      } else {
        return popup;
      }
    });

    /** @observable {Object} The response object from the API */
    this.data = ko.observable();
    /** @observableArray {Object} Notifications from the API, if ``url_notifications`` was given */
    this.notifications = ko.observableArray();

    this.promise = null;
    this.promise_notifications = null;
  }

  fetch() {
    this.fetch_notifications();
    if (!this.url) {
      // This popupcard is for a local only request, there might not be an API
      // to request from.
      this.data({});
      this.is_loaded(true);
      this.is_loading(false);
      return;
    }
    if (this.promise) {
      return this.promise;
    }
    this.promise = new Promise((resolve, reject) => {
      if (this.is_loaded()) {
        return resolve(data);
      }
      this.is_loading(true);
      jquery
        .getJSON(this.url)
        .then((data) => {
          this.data(data);
          this.is_loaded(true);
          this.is_loading(false);
          return resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    }).catch((err) => {
      console.debug("Error fetching from API:", err.responseJSON);
      this.is_loading(false);
      this.is_loaded(false);
    });
  }

  /** Fetch non-dismissed notifications, only once and only if a URL was given */
  fetch_notifications() {
    if (!this.url_notifications || this.promise_notifications) {
      return;
    }
    this.promise_notifications = jquery
      .getJSON(this.url_notifications, { state__in: "read,unread" })
      .then((data) => {
        this.notifications(data.results || []);
      })
      .catch((err) => {
        console.debug(
          "Error fetching notifications from API:",
          err.responseJSON,
        );
      });
  }

  show() {
    this.is_showing(true);
  }

  hide() {
    this.is_showing(false);
  }
}
Registry.add_view(PopupcardView);
