import jquery from "jquery";
import ko from "knockout";


/*
 * MessageView.init('#messages .ui.message');
 */
export class MessageView {
  constructor(message={}) {
    const self = this;

    self.message = message;
    self.dismiss_url = message.attr('data-message-dismiss-url');

    message.children('.close').on('click', self.dismiss());
    message.children('a').on('click', self.dismiss());
  }

  /* Dismiss URL and redirect client to link location, if any */
  dismiss() {
    const self = this;

    return (event) => {
      const target = jquery(event.target);
      const link_url = target.attr('href');

      event.preventDefault();

      if (self.dismiss_url) {
        jquery.get(self.dismiss_url).done((resp) => {
          if (link_url) {
            window.location = link_url;
          }
        }).fail((error) => {
          console.log(error);
        }).always(() => {
          self.message.transition('fade');
        })
      }
      else {
        self.message.transition('fade');
      }

      return false;
    }
  }

  static init(selector) {
    jquery(selector).each((index, obj) => {
      const message = jquery(obj);
      const view = new MessageView(message);
    });
  }
}
