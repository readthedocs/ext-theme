import jquery from "jquery";
import ko from "knockout";

import * as tasks from "../tasks";
import * as utils from "../core/utils";
import { ResponsiveView } from "../core/views";

class RemoteRepository {
  constructor(remote_repo) {
    // Just copy attributes over instead of prototyping. KO observables make a
    // prototype change more awkward.
    for (const key of Object.keys(remote_repo)) {
      this[key] = remote_repo[key];
    }

    // Get project attributes from API using project PK
    const project_pk = this.project;
    this.project = ko.observable();
    if (project_pk) {
      this.get_project(project_pk);
    }

    this.is_private = ko.observable(this.private);
    this.is_active = ko.observable(this.active);
    this.is_locked = ko.computed(() => {
      return this.is_private() && !this.has_admin();
    });
    this.has_admin = ko.observable(this.admin);
    this.has_project = ko.observable(false);
  }

  get_project(pk) {
    // TODO convert to APIv3 and hopefully use a URL field from the
    // RemoteRepository APIv3 response to link here, instead of hardcoding.
    const url = "/api/v2/project/" + pk + "/";

    let promise = jquery.getJSON(url).done((response) => {
      response.url = "/projects/" + response.slug;
      this.project(response);
      this.has_project(true);
    });

    return promise;
  }
}

export class ProjectCreateView extends ResponsiveView {
  constructor() {
    super();

    this.config = ko.observable();
    this.search_config = ko.observable();
    this.remote_repos = ko.observableArray();
    this.selected = ko.observable();
    this.is_loading = ko.observable(false);
    this.is_syncing = ko.observable(false);
    this.is_selected = ko.computed(() => {
      return this.selected() !== undefined;
    });

    /*
    // Viewport size for altering component display
    this.viewport_width = ko.observable(jquery(window).width());
    this.viewport_width.extend({ratelimit: 500});
    this.is_breakpoint_computer = ko.computed(() => {
      const width = this.viewport_width();
      console.log(width);
      return (width > 992);
    });

    jquery(window).on('resize', () => {
      this.viewport_width(jquery(window).width());
    });
    */

    // Wait for config to be loaded
    this.config.subscribe((config) => {
      if (config !== undefined) {
        this.init_search();
      }
    });
  }

  sync_remote_repos() {
    const config = this.config();

    const params = {
      url: config.urls.api_sync_remote_repositories,
      token: config.csrf_token,
    };

    this.is_syncing(true);
    this.is_loading(true);
    //this.error(null);

    let promise = tasks
      .trigger_task(params)
      .fail((error) => {
        console.log(error);
        //this.error(error);
      })
      .always(() => {
        this.is_syncing(false);
        this.is_loading(false);
      });

    return promise;
  }

  init_search() {
    const config = this.config();
    const url = config.urls.remoterepository_list + "?full_name={query}";
    this.search_config({
      // We use a Knockout template here, embedded in the template as a script
      // element. This avoids string interpolation in JS and keeps HTML in one
      // place, along with HTML translations.
      type: "knockout",
      templates: {
        knockout: (response) => {
          let node_temp = jquery("<div>");

          ko.applyBindingsToNode(node_temp[0], {
            template: {
              name: "remote-repo-results",
              data: response,
            },
          });

          const output = node_temp.html();
          node_temp.remove();
          return output;
        },
      },
      apiSettings: {
        url: url,
      },
      selector: {
        // Required because the default of ``prompt`` is a rounded input
        prompt: ".ui.text",
        // Required as we use `.title` to style a complex result title. SUI uses
        // the `text()` of this element to look up the result
        title: ".title .text",
      },
      fullTextSearch: true,
      onSelect: (result, response) => {
        this.selected(new RemoteRepository(result));
      },
    });
  }
}
