// Build - detail view

import jquery from "jquery";
import ko from "knockout";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { Registry } from "../application/registry";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(LocalizedFormat);

/** Build command output subview, represented in :class:`BuildCommand` as an
 * array of output lines.
 *
 * @param {Object} build_command_output - BuildCommand APIv2 data
 */
class BuildCommandOutput {
  constructor(build_command_output) {
    /** The command that was executed
     * @type {string} */
    this.command = build_command_output.command;
    /** @observable {string} Build command output line */
    this.output = ko.observable(build_command_output.output);
    /** Command output line number provided by :class:`BuildCommand`.
     * @observable {number} Command output line number */
    this.line_number = ko.observable(build_command_output.line_number);
    /** Computed observable for the achor id, the linkable element in the UI.
     * The anchor matches the syntax ``12--123``, which is the command index in
     * the array of commands, and the command output line number index in the
     * array of command output lines.
     * @computed {string} Anchor id in the syntax ``12--123`` */
    this.anchor_id = ko.computed(() => {
      return this.command.id() + "--" + this.line_number();
    });

    /** @observable {Boolean} Is the line selected/highlighted. Selected lines
     * are lines that are linked to via URL hash */
    this.is_selected = ko.observable(false);
  }
}

/**
 * Build command subview. :class:`BuildDetailView` retains an array of
 * :class:`BuildCommand` objects for display. This class uses an array of
 * :class:`BuildCommandOutput` objects to display individual lines of output.
 *
 * @param {Object} build_command - APIv2 build command data
 */
class BuildCommand {
  constructor(build_command) {
    // Remove the full path from build command display, and hack debug flag
    // TODO rely on debug flag from build model when it's added
    const re_command_trim =
      /(\/usr\/src\/app|\/home\/docs)\/checkouts\/readthedocs.org\/user_builds\/[^\/]+\/[^\/]+\/[^\/]+\//g;
    let command = build_command.command.replace(re_command_trim, "");
    let looks_like_debug = false;
    if (build_command.is_debug === undefined) {
      const re_commands = /^(pip freeze|cat .*conf.py)$/;
      looks_like_debug = command.match(re_commands);
    }
    const is_debug = build_command.is_debug || looks_like_debug;

    /** @observable {number} Build command id */
    this.id = ko.observable(build_command.id);
    /** @observable {string} Build command executed */
    this.command = ko.observable(command);
    /** @observable {number} Build command posix exit code */
    this.exit_code = ko.observable(build_command.exit_code || 0);
    /** @computed {Boolean} Was :func:`exit_code` successful? */
    this.is_successful = ko.computed(() => {
      return this.exit_code() === 0;
    });
    /** @computed {Boolean} Did command emit exit code 183? */
    this.is_cancelled = ko.computed(() => {
      return this.exit_code() === 183;
    });
    /** @observable {number} Command run time in seconds */
    this.run_time = ko.observable(build_command.run_time);
    /** @computed {Boolean} This command is a debug class command */
    this.is_debug = ko.observable(is_debug);
    /** @computed {Boolean} Hide debug commands until debug mode is enabled */
    this.is_visible = ko.computed(
      () => {
        if (this.is_debug()) {
          return false;
        } else {
          return true;
        }
      },
      null,
      { deferEvaluation: true },
    );
    /** @computed {string} Command text class */
    this.command_class = ko.computed(() => {
      if (this.is_debug()) {
        return "grey";
      } else if (this.is_cancelled()) {
        return "yellow";
      } else {
        return this.is_successful() ? "olive" : "red";
      }
    });

    /** @observable {Boolean} Is this command expanded? */
    this.is_expanded = ko.observable(false);
    this.exit_code.subscribe((exit_code) => {
      if (exit_code !== undefined && exit_code > 0) {
        this.is_expanded(true);
      }
    });

    /** @observable {string} Raw command output */
    this.output = ko.observable();
    /** @computed {Array.<BuildCommandOutput>} Split output lines */
    this.output_lines = ko.computed(
      () => {
        const output_lines = this.output().split(/\n/);

        return output_lines.map((line, index) => {
          return new BuildCommandOutput({
            command: this,
            output: line,
            line_number: index + 1,
          });
        });
      },
      null,
      { deferEvaluation: true },
    );

    this.output(build_command.output);
    // TODO color output is disabled for now. This needs to be async due to the
    // extra libraries loaded, and should block page load, polling, and updating
    // the selected line. This also requires an application change.
    // this.color_output(build_command.output);
  }

  /**
   * Add ANSI coloring and other fun to output string. Modules used here are
   * dynamically loaded separate from the normal vendor bundle. This is to
   * reduce the size of the standard vendor bundle.
   *
   * @param {string} output - The output string to colorize
   * @returns {Promise}
   */
  color_output(output) {
    // Dynamically load expensive chunks. These will be kept out of the normal
    // vendor bundle.
    return import(
      /* webpackChunkName: 'ansi_up' */
      "ansi_up"
    ).then(({ default: AnsiUp }) => {
      // Build output lines
      let ansi_up = new AnsiUp();
      ansi_up.use_classes = true;
      output = ansi_up.ansi_to_html(output);
      // TODO use dompurify here
      //output = DOMPurify.sanitize_html(output);
      return output;
    });
  }

  /**
   * Toggle :func:`is_expanded`, used to expand command output
   *
   * This is triggered by a click event, so ``false`` is returned to avoid
   * default behavior and event propagation.
   */
  toggle_expanded() {
    this.is_expanded(!this.is_expanded());
    return false;
  }
}

/**
 * Build detail view shows build metadata, build commands, and build command
 * output. In most cases you are only passing in the build pk, and relying on
 * the API to fill in the rest of the build data.
 *
 * Usage from a Django template:
 *
 * .. code:: html
 *
 *     <div data-bind="using: BuildDetailView({id: {{ build.pk }}}, '{% url ... %}', '{% url ... %}')"></div>
 *
 * @param {Object} build - API data for a build.
 */
export class BuildDetailView {
  static view_name = "BuildDetailView";

  constructor(build = {}, url_api_build, url_api_notifications) {
    /** @type {number} The build pk/id to fetch */
    this.id = build.id;
    /** @type {string} APIv2 build detail API URL */
    this.url_api_build = url_api_build;
    /** @type {string} APIv3 build notification API URL */
    this.url_api_notifications = url_api_notifications;

    /** @observable {Boolean} Was for successful build or not */
    this.success = ko.observable(build.success);
    /** @observable {string} Build error message */
    this.error = ko.observable(build.error);
    /** @observableArray {Object} List of notifications from API */
    this.notifications = ko.observableArray();
    /** @computed {Boolean} Has notifications? */
    this.has_notifications = ko.computed(() => {
      return this.notifications().length > 0;
    });

    /** @obsevable {string} Build state */
    this.state = ko.observable(build.state);
    /** @observable {string} Build state as a display string */
    this.state_display = ko.observable(build.state_display);

    // State helpers that are not modeled from the backend API
    /** @observable {Boolean} Is the build in a finished state? */
    this.is_finished = ko.observable(false);
    /** @observable {Boolean} Have we received data from the API yet? */
    this.is_loading = ko.observable(true);
    /** @observable {Boolean} Build can be cancelled */
    this.can_cancel = ko.observable(false);
    /** @observable {Boolean} Build can be retried */
    this.can_retry = ko.observable(false);
    /** @observable {Boolean} There was doc output in the build */
    this.can_view_docs = ko.observable(false);

    /** @observable {Boolean} Is the command output wrapped? */
    this.is_wrapped = ko.observable(true);

    // Consolidate all of the observable updates that depend on build state
    this.state.subscribe((state) => {
      this.update_state(state);
    });

    /** SUI progress module config/behavior
     * @computed {Object or Function} the parameters to pass to the module call
     *
     * See the `semanticui` Knockout plugin for more information */
    this.progress_config = ko
      .computed(() => {
        const state = this.state();
        const states = [
          "triggered",
          "queued",
          "cloning",
          "installing",
          "building",
          "uploading",
          "finished",
        ];
        // If this is the first update, configure the module. If this is an
        // update, then send progress updates using module behaviors instead.
        if (ko.computedContext.isInitial()) {
          return {
            autoSuccess: false,
            value: states.indexOf(state),
            total: states.length - 1,
            label: this.state_display(),
          };
        } else {
          if (this.is_finished()) {
            const is_cancelled = state === "cancelled";
            const is_failed = this.error() || this.success() === false;
            if (is_cancelled) {
              return (progress) => {
                progress("set warning", "Build cancelled");
              };
            } else if (is_failed) {
              return (progress) => {
                // TODO translate this in the application or templates
                progress("set error", "Build failed");
              };
            } else {
              return (progress) => {
                // TODO translate this in the application or templates
                progress("set success", "Build succeeded");
              };
            }
          } else {
            return (progress) => {
              progress("set progress", states.indexOf(state));
              progress("set label", this.state_display());
            };
          }
        }
      })
      .extend({
        // Debounce API updates, so we aren't triggering this once for each
        // observable update -- from the API response for example.
        deferred: true,
      });

    // Date and time manipulation
    /* @observable {number} Build date ... as integer? TBD */
    this.date = ko.observable(build.date);
    /* @observable {number} Build length in seconds */
    this.length = ko.observable(build.length);
    /* @observable {string} Build date display in a localized format */
    this.date_display = ko.observable();
    /* @observable {string} Build date as a relative format */
    this.date_display_since = ko.observable();
    /* @observable {string} Build length in a human readable format */
    this.length_display = ko.observable();

    this.date.subscribe((date) => {
      const date_readable = dayjs(date);
      this.date_display(date_readable.format("llll"));
      this.date_display_since(date_readable.fromNow());
    });
    this.length.subscribe((length) => {
      let duration;
      if (length) {
        duration = dayjs.duration(length, "seconds");
      } else {
        // Infer length from build start time
        const dateNow = dayjs();
        const dateStart = dayjs(this.date());
        duration = dayjs.duration(dateNow.diff(dateStart));
      }
      let formatParts = ["s[s]"];
      if (duration.minutes()) {
        formatParts.unshift("m[m]");
      }
      if (duration.hours()) {
        formatParts.unshift("H[h]");
      }
      this.length_display(duration.format(formatParts.join(" ")));
    });

    /* Output */
    /** @observable {Object} Build configuration used for the build */
    this.config = ko.observable();
    /** @observable {string} The build instance to process the build */
    this.builder = ko.observable(build.builder);
    /** @observable {Array.<Object>} Build command objects as an array */
    this.commands = ko.observableArray(build.commands);

    /** @observable {string} Repository commit for the build */
    this.commit = ko.observable(build.commit);
    /** @computed {string} A truncated version of the build commit */
    this.commit_short = ko.computed(() => {
      let commit = this.commit();
      if (commit) {
        return commit.substring(0, 8);
      }
    });
    /** @observable {string} URL for build's documentation */
    this.docs_url = ko.observable(build.docs_url);
    /** @observable {string} URL for build commit */
    this.commit_url = ko.observable(build.commit_url);

    /* Others */
    /** This is old old build output, before we were separating commands by
     * build command and just lumping evertying by STDOUT/STDERR. Oooof. We
     * don't want to show these, and probably just want to show a "Sorry, this
     * is too old" error.
     * @observable {Boolean} Build output doesn't have build commands */
    this.legacy_output = ko.observable(false);

    // Selected line handling
    /** The selected command and command line are updated when the window hash
     * (anchor) changes. The hash is meant to be in the format of ``12--123``,
     * which is the command id and the command id output line number.
     * @observable {string} The window hash/anchor */
    this.selected_hash = ko.observable(jquery(location).attr("hash"));
    this.selected_hash.subscribe((selected_hash) => {
      jquery(location).attr("hash", selected_hash);
    });
    /** @observable {BuildCommandOutput} The command line found from the selected hash*/
    this.selected_line = ko.observable();
    // Remove the selected state on the current/old selected line
    this.selected_line.subscribe(
      (selected_line_prev) => {
        if (selected_line_prev) {
          selected_line_prev.is_selected(false);
        }
      },
      this,
      "beforeChange",
    );
    // Update the new selected line
    this.selected_line.subscribe((selected_line) => {
      if (selected_line.command.is_debug()) {
        this.show_debug(true);
      }
      selected_line.command.is_expanded(true);
      selected_line.is_selected(true);
      this.selected_hash(selected_line.anchor_id());
    });

    /* Debug */
    /** @observable {Boolean} Show debug/info commands */
    this.show_debug = ko.observable(false);

    /** @observable {Boolean} Are we still polling the API? */
    this.is_polling = ko.observable(true);
    this.is_polling.subscribe((is_polling) => {
      if (!is_polling) {
        this.set_selected_line_from_hash(this.selected_hash());
      }
    });

    if (this.url_api_build) {
      this.poll_api_build();
    }
    if (this.url_api_notifications) {
      this.poll_api_notifications();
    }
  }

  /**
   * Continually poll our APIv2 for build object and update Build, BuildCommand,
   * and BuildCommandOutput states. When the API return indicates the build is
   * finished, we stop recursive polling.
   */
  poll_api_build() {
    jquery
      .getJSON(this.url_api_build)
      .then((data) => {
        this.date(data.date);
        this.success(data.success);
        this.error(data.error);
        this.length(data.length);
        this.commit(data.commit);
        this.docs_url(data.docs_url);
        this.commit_url(data.commit_url);
        this.builder(data.builder);
        this.config(data.config);
        this.state(data.state);
        this.state_display(data.state_display);

        // Always update date and length, as these should update as the build progresses
        this.date.valueHasMutated();
        this.length.valueHasMutated();

        // This is a mock command used to preview the command output.
        // TODO probably do this in the application instead
        this.add_command({
          id: 0,
          command: "readthedocs-build --show-config",
          output: JSON.stringify(data.config, null, "  "),
          exit_code: 0,
          run_time: 0,
          is_debug: true,
        });
        for (const command of data.commands) {
          this.add_command(command);
        }

        // We've completed a request to the API. From here, we are not loading
        // from the API, but we'll be polling until the build is finished.
        this.is_loading(false);
      })
      .then(() => {
        // Continually poll API while build is not finished. If it is in a finished
        // state, this method will return without setting another timer. We do not
        // updated :attr:`is_polling` by computed/subscription as we want to ensure
        // this update happens at the very end of API updates instead.
        if (this.is_finished()) {
          this.is_polling(false);
        } else {
          setTimeout(() => {
            this.poll_api_build();
            this.poll_api_notifications();
          }, 2000);
        }
      });
  }

  /** Poll APIv3 build notification API directly
   *
   * We have to do this because we rely on the build APIv2 for everything else
   * and the APIv3 build endpoints don't have the data required yet.
   *
   * TODO this should all happen under a single build API v3 poll instead, and
   * this method should go away.
   *
   * @param {str} url - APIv3 build notification endpoint
   */
  poll_api_notifications() {
    const params = {
      state__in: "read,unread",
    };
    jquery.getJSON(this.url_api_notifications, params).then((data) => {
      if (data.results) {
        this.notifications(data.results);
      }
    });
  }

  /** Add a command to :attr:`commands` if it doesn't already exist
   *
   * @param {Object} command - Build command API data structure
   */
  add_command(command) {
    const command_found = ko.utils.arrayFirst(
      this.commands(),
      (command_search) => {
        return command_search.id() === command.id;
      },
    );
    if (!command_found) {
      this.commands.push(new BuildCommand(command));
    }
  }

  /**
   * Set the selected line and focus on the new selected element
   *
   * This is called from :meth:`set_selected_line_from_hash`, but also from the
   * line number link click event. We return ``false`` at the end to avoid the
   * default behavior and event propagation.
   *
   * @param {BuildCommandOutput} selected_line - Command output line to target
   */
  set_selected_line(selected_line) {
    this.selected_line(selected_line);
    // The attribute ``data-selected`` is set in the templates. This isn't
    // ideal, but easier than a custom KO plugin.
    const elem = document.querySelector("[data-selected=true]");
    if (elem) {
      if (elem.scrollIntoView) {
        // Try modern centered focus on element, instead of focus at the top of
        // the viewport.
        elem.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "center",
        });
      } else {
        // Back up to the default focus for old browsers
        jquery(elem).focus();
      }
    }
    return false;
  }

  /**
   * Set the selected line by looking up the line that corresponds to the
   * selected anchor hash.
   *
   * This loops over the commands and lines to reduce the number of operations.
   * Normally, :attr:`BuildCommandOutput.is_selected` might be a computed
   * observable, but then updates to the selected line are always O(n), for
   * every line of output, across all commands. We can reduce this greatly by
   * iterating over commands, then command lines.
   *
   * @param {string} selected_hash - Hash to lookup
   */
  set_selected_line_from_hash(selected_hash) {
    const re_hash = /^#(\d+)--(\d+)$/; // (?:$|(\d+)$)/; // multiple lines!

    if (selected_hash) {
      let found = selected_hash.match(re_hash);

      if (!found) {
        return;
      }

      const selected_command = ko.utils.arrayFirst(
        this.commands(),
        (command_search) => {
          return command_search.id() == found[1];
        },
      );
      if (selected_command) {
        const selected_line = ko.utils.arrayFirst(
          selected_command.output_lines(),
          (output_line) => {
            return output_line.line_number() == found[2];
          },
        );

        if (selected_line) {
          this.set_selected_line(selected_line);
        }
      }
    }
  }

  // TODO is this needed? This is likely old view cruft
  show_legacy_output() {
    this.legacy_output(true);
  }

  /** Helper for toggling debug mode on the view. This hides some informational
   * commands and the configuration file output step */
  toggle_debug() {
    const show_debug = this.show_debug();
    this.show_debug(!show_debug);
  }

  /** Update all attributes and observables that depend on build state */
  update_state(state) {
    // Is build in one of the finished states?
    if (["finished", "cancelled"].includes(state)) {
      this.is_finished(true);
      this.can_cancel(false);
      // TODO there is more logic on whether a build can retry in the
      // application, but this is not surfaced in the API response.
      this.can_retry(true);

      if (this.success()) {
        this.can_view_docs(true);
      }
    } else {
      // We use any other status here to finally update ``can_cancel`` from
      // it's default of ``false``. The default ensure we don't flash the
      // button if the API response ends up showing that the build finished.
      this.can_cancel(true);
    }
  }
}

Registry.add_view(BuildDetailView);
