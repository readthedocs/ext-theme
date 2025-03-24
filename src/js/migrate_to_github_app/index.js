import { Registry } from "../application/registry";

/*
 * View for tracking opened links, and reloading the page when they are closed.
 *
 * Useful when we depend on changes done outside of the app,
 * but we don't want to have users manually reload the page,
 * or constantly poll the server.
 */
export class TrackOpenedLinksView {
  static view_name = "TrackOpenedLinksView";
  constructor() {
    this.openedWindows = [];
    this.trackClosedWindows();
  }

  trackClosedWindows() {
    setInterval(() => {
      let originalLength = this.openedWindows.length;
      this.openedWindows = this.openedWindows.filter(win => !win.closed);
      if (this.openedWindows.length < originalLength) {
        // Wait some seconds before reloading the page,
        // so our app has time to update the status.
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }, 250);
  }

  /*
   * Click event handler for tracking opened links.
   */
  trackLinkClick(data, event) {
    event.preventDefault();
    const newWindow = window.open(event.target.href, "_blank");
    if (newWindow) {
      this.openedWindows.push(newWindow);
    }
  }
}

Registry.add_view(TrackOpenedLinksView);
