import ko from "knockout";
import jquery from "jquery";

import { Registry } from "../application/registry";

export class PopupcardView {
  static view_name = "PopupcardView";

  constructor(url) {
    this.url = url;

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

    this.promise = null;
  }

  fetch() {
    if (this.promise) {
      return this.promise;
    }
    this.promise = new Promise((resolve, reject) => {
      if (this.is_loaded()) {
        return resolve(data);
      }
      this.is_loading(true);
      jquery.getJSON(this.url).then((data) => {
        this.data(data);
        this.is_loaded(true);
        this.is_loading(false);
        return resolve(data);
      });
    }).catch(() => {
      this.is_loading(false);
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
