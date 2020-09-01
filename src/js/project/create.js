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
    this.remote_repos = ko.observableArray();
    this.selected = ko.observable();
    this.is_loading = ko.observable(true);
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

    // Wait for config to load to call remote repos
    let promise_load;
    this.config.subscribe(() => {
      promise_load = this.get_remote_repos();
      promise_load.done((obj) => {
        this.init_search();
      });
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

  get_remote_repos() {
    const page_size = 1000;
    const config = this.config();
    const url = config.urls.remoterepository_list + "?page_size=" + page_size;

    // TODO support multiple pages here
    let promise = jquery
      .getJSON(url)
      .done((response) => {
        //this.page_next(projects_list.next);
        //this.page_previous(projects_list.previous);
        for (const remote_repo of response.results) {
          this.remote_repos.push(new RemoteRepository(remote_repo));
        }
      })
      .fail((error) => {
        const error_msg = error.responseJSON.detail || error.statusText;
        console.log("Error!", error_msg);
        //this.error({message: error_msg});
      })
      .always(() => {
        this.is_loading(false);
      });

    return promise;
  }

  init_search() {
    const remote_repos = this.remote_repos();
    const config = {
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

      source: remote_repos,
      searchFields: ["full_name"],
      selector: {
        // Required because the default of ``prompt`` is a rounded input
        prompt: ".ui.text",
        // Required as we use `.title` to style a complex result title. SUI uses
        // the `text()` of this element to look up the result
        title: ".title .text",
      },
      fullTextSearch: true,
      onSelect: (result, response) => {
        this.selected(result);
      },
    };
    jquery(".ui.search").search(config);
  }
}
