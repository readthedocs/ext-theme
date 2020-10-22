import ko from "knockout";
import jquery from "jquery";

import * as project from "../project";
import * as build from "../build";
import * as docs from "../docs";
import { MessageView } from "../core/views";

/* Fun fact, we can't rely on dynamic naming here, like using
 * ``ProjectListView.constructor.name``, as minification renames the class
 */
const views = {
  BuildDetailView: build.detail.BuildDetailView,
  ProjectListView: project.ProjectListView,
  ProjectVersionCreateView: project.ProjectVersionCreateView,
  ProjectVersionListView: project.ProjectVersionListView,
  ProjectCreateView: project.create.ProjectCreateView,
  ProjectSearchAnalyticsView: project.admin.ProjectSearchAnalyticsView,
  ProjectTrafficAnalyticsView: project.admin.ProjectTrafficAnalyticsView,
  ProjectRedirectView: project.admin.ProjectRedirectView,
  ProjectAutomationRuleView: project.admin.ProjectAutomationRuleView,
  EmbedTopicsView: docs.EmbedTopicsView,
  MessageView: MessageView,
};

export class ApplicationView {
  constructor() {
    console.debug("Configuring application view subviews");
    for (const [view_name, view_class] of Object.entries(views)) {
      this[view_name] = (params) => {
        console.debug("Loading view with parameters:", view_name, params);
        // ignoreDependencies is needed here or the context used by the subview
        // is incorrect
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
