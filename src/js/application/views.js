import ko from "knockout";
//import ko from "knockout/build/output/knockout-latest.debug.js";
import jquery from "jquery";

import * as project from "../project";
import * as build from "../build";
import * as docs from "../docs";

/**
 * This is an explicit mapping of view name to view class
 *
 * This is required because we can't use something like
 * `ProjectListView.constructor.name``, as minification renames the class at
 * build time.
 */
const views = {
  BuildDetailView: build.detail.BuildDetailView,
  BuildListView: build.list.BuildListView,
  ProjectListView: project.ProjectListView,
  ProjectVersionCreateView: project.ProjectVersionCreateView,
  ProjectVersionListView: project.ProjectVersionListView,
  ProjectCreateView: project.create.ProjectCreateView,
  ProjectSearchAnalyticsView: project.admin.ProjectSearchAnalyticsView,
  ProjectTrafficAnalyticsView: project.admin.ProjectTrafficAnalyticsView,
  ProjectRedirectView: project.admin.ProjectRedirectView,
  ProjectAutomationRuleView: project.admin.ProjectAutomationRuleView,
  EmbedTopicsView: docs.EmbedTopicsView,
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

  /**
   * Attach application main view
   * @param {string} selector - Selector string to use for view attachment
   */
  attach(selector = "body") {
    console.debug("Attaching application to selector:", selector);
    ko.applyBindings(this, jquery(selector)[0]);
  }

  /**
   * The Knockout click callback
   * @callback knockout_click
   * @param {object} data - Knockout context data
   * @param {MouseEventPrototype} event - Event object from click event
   */

  /**
   * Show a modal using an event callback
   *
   * This should be used from an element data-bind, such as:
   *
   *     <button data-bind="click: $root.show_modal('delete')"></button>
   *     <div class="ui modal" data-modal-id="delete"></div>
   *
   * This method is executed when the view is attached and returns a callback.
   * The callback is finally executed from the ``click`` binding.
   *
   * @param {string} modal_id - Modal id, references `data-modal-id` attribute
   * @returns {knockout_click}
   */
  show_modal(modal_id) {
    return (data, event) => {
      const selector = '[data-modal-id=' + modal_id + ']';
      console.debug('Showing modal:', selector)
      const found_modal = jquery(selector).modal('show');
      if (found_modal.length === 0) {
        console.debug('Modal not found:', selector);
      }
    }
  }
}
