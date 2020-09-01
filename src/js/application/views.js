import ko from "knockout";
import jquery from "jquery";

import * as project from "../project";
import * as build from "../build";
import * as docs from "../docs";
import { MessageView } from "../core/views";

const views = [
  build.detail.BuildDetailView,
  project.ProjectListView,
  project.ProjectVersionListView,
  project.create.ProjectCreateView,
  project.admin.ProjectSearchAnalyticsView,
  project.admin.ProjectTrafficAnalyticsView,
  project.admin.ProjectRedirectView,
  project.admin.ProjectAutomationRuleView,
  docs.EmbedTopicsView,
  MessageView,
];

export class ApplicationView {
  constructor() {
    console.debug("Configuring application view subviews");
    for (const view_class of views) {
      this[view_class.name] = (params) => {
        console.debug("Loading view with parameters:", view_class.name, params);
        return ko.ignoreDependencies(() => {
          return new view_class(params);
        }, this);
      };
    }
  }

  /* View attachment method
   *
   * @param {string} selector - Selector string to use for view attachment
   */
  attach(selector = "body") {
    console.debug("Attaching application to selector:", selector);
    ko.applyBindings(this, jquery(selector)[0]);
  }
}
