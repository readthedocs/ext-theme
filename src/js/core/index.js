import jquery from "jquery";
import ko from "knockout";

/*
 * MessageView.init('#messages .ui.message');
 */
export class MessageView {
  constructor(message = {}) {
    this.message = message;
    this.dismiss_url = message.attr("data-message-dismiss-url");

    message.children(".close").on("click", this.dismiss());
    message.children("a").on("click", this.dismiss());
  }

  /* Dismiss URL and redirect client to link location, if any */
  dismiss() {
    return (event) => {
      const target = jquery(event.target);
      const link_url = target.attr("href");

      event.preventDefault();

      if (this.dismiss_url) {
        jquery
          .get(this.dismiss_url)
          .done((resp) => {
            if (link_url) {
              window.location = link_url;
            }
          })
          .fail((error) => {
            console.log(error);
          })
          .always(() => {
            this.message.transition("fade");
          });
      } else {
        this.message.transition("fade");
      }

      return false;
    };
  }

  static init(selector) {
    jquery(selector).each((index, obj) => {
      const message = jquery(obj);
      const view = new MessageView(message);
    });
  }
}
