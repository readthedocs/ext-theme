import jquery from "jquery";
import ko from "knockout";

import * as tasks from "../tasks";
import * as utils from "../core/utils";
import { ResponsiveView } from "../core/views";
import { Registry } from "../application/registry";

/**
 * Remote repository instance for remote repository listing.
 *
 * @param {Object} remote_repo - Remote repository API data
 */
class RemoteRepository {
  constructor(remote_repo) {
    // Just copy attributes over instead of prototyping. KO observables make a
    // prototype change more awkward. Note, ``projects`` now comes directly from
    // the API response, there is no need to parse this data from the v2
    // ``matches`` response.
    for (const key of Object.keys(remote_repo)) {
      this[key] = remote_repo[key];
    }

    /** @observable {Boolean} Is this repository private? */
    this.is_private = ko.observable(this.private);
    /** @observable {Booleean} Is this repository active? */
    this.is_active = ko.observable(this.active);
    /** @observable {Boolean} Does user have admin privilege on the repo? */
    this.has_admin = ko.observable(this.admin);
    /** @computed {Boolean} Can user import this repository? */
    this.is_locked = ko.computed(() => {
      // TODO take platform private repo setting into consideration
      return this.is_private() && !this.has_admin();
    });
    /** @observable {Boolean} Was the repository already imported? */
    this.has_project = ko.computed(() => {
      return this.projects.length > 0;
    });
  }
}

/**
 * Project creation view, for setting up a new project or linking an existing
 * repository to a new project.
 *
 * @extends {ResposiveView}
 */
export class ProjectCreateView extends ResponsiveView {
  static view_name = "ProjectCreateView";

  constructor() {
    super();

    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} View configuration */
    this.config = ko.observable();
    /** Configuration passed in via :func:`~application.plugins.jsonInit`
     * @observable {Object} Search configuration */
    this.search_config = ko.observable();
    /** @observable {Object} The selected repository */
    this.selected = ko.observable();
    /** @observable {Boolean} Is UI loading from the API currently? */
    this.is_loading = ko.observable(false);
    /** @observable {Boolean} Are remote repositories current resyncing? */
    this.is_syncing = ko.observable(false);
    /** @computed {Boolean} Is there a selected repository? */
    this.is_selected = ko.computed(() => {
      return this.selected() !== undefined;
    });
    /** @observable {Boolean} Can private repositories be imported */
    this.allow_private_repos = ko.observable(false);
    /** @observable {string} The error message to show the user */
    this.error = ko.observable();

    // Wait for config to be loaded to init search
    this.config.subscribe((config) => {
      if (config !== undefined) {
        this.allow_private_repos(config.allow_private_repos);
        this.init_search();
      }
    });
  }

  /**
   * Sync remote repository objects using a call to our API. This sets the UI to
   * a loading state so that user interaction can be limited. Configuration is
   * loaded using :func:`config` and :func:`application.plugins.jsonInit`.
   */
  sync_remote_repos() {
    const config = this.config();

    const params = {
      url: config.urls.api_sync_remote_repositories,
      token: config.csrf_token,
    };

    this.is_syncing(true);
    this.is_loading(true);

    let promise = tasks
      .trigger_task(params)
      .fail((error) => {
        console.error("Error syncing remote repositories:", error.message);
        this.error(error.message);
      })
      .always(() => {
        this.is_syncing(false);
        this.is_loading(false);
      });

    return promise;
  }

  /**
   * Set up SUI search once :func:`config` is fully loaded.
   *
   * This uses a Knockout template to make it easier to display the individual
   * elements in the list. The template is loaded from the element
   * ``remote-repo-results``.
   *
   * Ultimately, this sets :func:`search_config`, which is the configuration
   * object that will be eventually be used by SUI search jQuery plugin.
   *
   * .. seealso::
   *     https://knockoutjs.com/documentation/template-binding.html
   */
  init_search() {
    const config = this.config();
    const url =
      config.urls.remoterepository_list + "?expand=projects&full_name={query}";

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
              data: {
                remote_repos: response.results.map((repo) => {
                  return new RemoteRepository(repo);
                }),
              },
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

  /** {Boolean} Is repository supported, based on permissions? */
  is_repository_supported(repo) {
    if (repo.is_private()) {
      return this.allow_private_repos();
    }
    return true;
  }
}
Registry.add_view(ProjectCreateView);

export class ProjectOrganizationView extends ResponsiveView {
  static view_name = "ProjectOrganizationView";

  constructor() {
    super();

    // searches across any array/object of searchable objects
    // let content = [
    //   {
    //     category: "Read the Docs, Inc",
    //     title: "Admin",
    //   },
    //   {
    //     category: "Read the Docs, Inc",
    //     title: "Read Only",
    //   },
    //   {
    //     category: "My Organization",
    //     title: "Admin",
    //   },
    //   {
    //     category: "My Organization",
    //     title: "Auto-join",
    //   },
    //   {
    //     category: "My Organization",
    //     title: "Read Only",
    //   },
    // ];

    let content = JSON.parse(
      document
        .querySelector("#organizations-teams")
        .text.replace(/\\u0027/g, '"'),
    );

    jquery(".ui.search").search({
      type: "category",
      minCharacters: 1,
      source: content,
      searchFields: ["title", "description"],
      fullTextSearch: false,
    });
  }
}
Registry.add_view(ProjectOrganizationView);
