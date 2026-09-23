import jquery from "jquery";
import ko from "knockout";

import * as tasks from "../tasks";
import { ResponsiveView } from "../core/views";
import { Registry } from "../application/registry";

/**
 * Project creation view, for setting up a new project from a remote
 * repository.
 *
 * The repository list itself is rendered server side. This view only handles
 * resyncing the user's remote repositories and the repair modal, which
 * explains why a repository might be missing from the list.
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
    /** @observable {Object} Repair modal module configuration */
    this.repair_modal_config = ko.observable(undefined);
    /** @observable {Boolean} Are remote repositories current resyncing? */
    this.is_syncing = ko.observable(false);
    /** @observable {Boolean} Are remote repositories done resyncing? */
    this.is_synced = ko.observable(false);
    /** @observable {string} The error message to show the user */
    this.error = ko.observable();

    // Wait for config to be loaded to init the modal
    this.config.subscribe((config) => {
      if (config !== undefined) {
        this.init_modal();
      }
    });
  }

  /**
   * Set up the repair modal once :func:`config` is loaded.
   *
   * The modal is shown immediately on view load if the URL contains the
   * ``#repair`` hash. Use this for linking users in support directly to this
   * modal.
   */
  init_modal() {
    const show_modal = jquery(location).attr("hash") == "#repair";
    this.repair_modal_config({
      autoShow: show_modal,
      centered: false,
    });
  }

  /**
   * Sync remote repository objects using a call to our API. This sets the UI to
   * a loading state so that user interaction can be limited. Configuration is
   * loaded using :func:`config` and :func:`application.plugins.jsonInit`.
   *
   * The repository list is rendered server side, so the page is reloaded once
   * the sync finishes to show the updated list.
   */
  sync_remote_repos() {
    const config = this.config();

    const params = {
      url: config.urls.api_sync_remote_repositories,
      token: config.csrf_token,
    };

    this.is_synced(false);
    this.is_syncing(true);

    let promise = tasks
      .trigger_task(params)
      .done(() => {
        this.is_synced(true);
        window.location.reload();
      })
      .fail((error) => {
        console.error("Error syncing remote repositories:", error.message);
        this.error(error.message);
        this.is_syncing(false);
      });

    return promise;
  }

  /** Show repair modal */
  show_modal() {
    this.repair_modal_config((modal) => modal("show"));
  }
}
Registry.add_view(ProjectCreateView);
