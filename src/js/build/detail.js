// Build - detail view

import jquery from "jquery";
import ko from "knockout";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import { Registry } from "../application/registry";

/** Build command output subview, represented in :class:`BuildCommand` as an
 * array of output lines.
 *
 * @param {Object} build_command_output - BuildCommand APIv2 data
 * @param {BuildCommand} view - Parent build command instance
 */
class BuildCommandOutput {
  constructor(build_command_output, view) {
    /** Parent view that included this class, used for calls to the root view
     * @type {BuildCommand} */
    this.view = view;

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

    /** Computed observable for determining whether the line is highlighted or
     * not. This looks to see if the command and command line number match the
     * window anchor. This could be not performant on large views
     * @computed {Boolean} Boolean value if window hash matches command/line */
    this.is_highlighted = ko.computed(() => {
      return (
        this.line_number() == this.view.selected_line() &&
        this.command.id() == this.view.selected_command()
      );
    });
  }
}

/**
 * Build command subview. :class:`BuildDetailView` retains an array of
 * :class:`BuildCommand` objects for display. This class uses an array of
 * :class:`BuildCommandOutput` objects to display individual lines of output.
 *
 * @param {Object} build_command - APIv2 build command data
 * @param {BuildDetailView} view - The build detail view display this command
 */
class BuildCommand {
  constructor(build_command, view) {
    /** :class:`BuildDetailView` instance that invoked this command
     * @type {BuildDetailView} */
    this.view = view;

    // Remove the full path from build command display
    // TODO do this on the API level probably.
    const re_command_trim =
      /(\/usr\/src\/app|\/home\/docs)\/checkouts\/readthedocs.org\/user_builds\/[^\/]+\/[^\/]+\/[^\/]+\//g;
    let command = build_command.command.replace(re_command_trim, "");

    /** @observable {number} Build command id */
    this.id = ko.observable(build_command.id);
    /** @observable {string} Build command executed */
    this.command = ko.observable(command);
    /** @observable {number} Build command posix exit code */
    this.exit_code = ko.observable(build_command.exit_code || 0);
    /** @computed {Boolean} Was :func:`exit_code` successful? */
    this.successful = ko.computed(() => {
      return this.exit_code() === 0;
    });
    /** @observable {number} Command run time in seconds */
    this.run_time = ko.observable(build_command.run_time);

    // TODO I'm confused why this isn't a computed observable. It uses the
    // observable for success already, this seems off.
    const is_showing = this.successful() ? false : true;
    /** @observable {Boolean} Is this command expanded? */
    this.is_showing = ko.observable(is_showing);

    /** @computed {string} CSS class used to show failure/success */
    this.command_status = ko.computed(() => {
      return this.successful()
        ? "build-command-successful"
        : "build-command-failed";
    });

    /** Used by :func:`render_output`, which handles ANSI color codes and other
     * processing.
     * @observable {string} Raw command output */
    this.output = ko.observable(build_command.output);
    /** @observable {Array.<BuildCommandOutput>} Rendered output lines */
    this.output_lines = ko.observableArray([]);
    this.render_output();
  }

  /**
   * Toggle :func:`is_showing`, used for single clicks on commands to expand
   */
  toggle_showing() {
    this.is_showing(!this.is_showing());
  }

  /**
   * Render :func:`output` into :class:`BuildCommandOutput` instances with ANSI
   * coloring and other fun. Modules used here are dynamically loaded separate
   * from the normal vendor bundle. This is to reduce the size of the standard
   * vendor bundle.
   *
   * This directly manipulates the obervable array :attr:`output_lines`.
   */
  render_output() {
    // Dynamically load expensive chunks. These will be kept out of the normal
    // vendor bundle.
    Promise.all([
      import(
        /* webpackChunkName: 'ansi_up' */
        "ansi_up"
      ).then(({ default: AnsiUp }) => {
        return AnsiUp;
      }),
      import(
        /* webpackChunkName: 'sanitize-html' */
        "sanitize-html"
      ).then(({ default: sanitize_html }) => {
        return sanitize_html;
      }),
    ]).then((imports) => {
      let AnsiUp, sanitize_html;
      [AnsiUp, sanitize_html] = imports;

      // Build output lines
      let ansi_up = new AnsiUp();
      ansi_up.use_classes = true;
      let output = ansi_up.ansi_to_html(this.output());
      output = sanitize_html(output, {
        allowedTags: ["span"],
        allowedAttributes: { span: ["class"] },
      });

      var output_lines = output.split(/\n/);
      this.output_lines(
        output_lines.map((line, index) => {
          return new BuildCommandOutput(
            {
              command: this,
              output: line,
              line_number: index + 1,
            },
            this.view
          );
        })
      );
    });
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
 *     <div data-bind="using: BuildDetailView({id: {{ build.pk }}})"></div>
 *
 * @param {Object} build - API data for a build.
 */
export class BuildDetailView {
  static view_name = "BuildDetailView";

  constructor(build = {}) {
    /** The build pk/id to fetch.
     * @type {number} */
    this.id = build.id;
    // TODO make this configurable?
    this.api_url = "/api/v2/build/";

    /** @observable {Boolean} Was for successful build or not */
    this.success = ko.observable(build.success);
    /** @observable {string} Build error message */
    this.error = ko.observable(build.error);
    /** @obsevable {string} Build state */
    this.state = ko.observable(build.state);
    /** @observable {string} Build state as a display string */
    this.state_display = ko.observable(build.state_display);
    /** @computed {Boolean} Is the build in a finished state? */
    this.finished = ko.computed(() => {
      return this.state() === "finished";
    });
    /** @observable {Boolean} Is the build data loading? */
    this.is_loading = ko.observable(true);

    /** State value for progress bar. The progress bar value is just the step
     * value that the build is on, nothing fancy. This could be something more
     * intelligent later.
     * @observable {number} Position of build state progress bar */
    this.state_progress = ko.computed(() => {
      const states = [
        "triggered",
        "queued",
        "cloning",
        "installing",
        "building",
        "uploading",
        "finished",
      ];
      return {
        value: states.indexOf(this.state()),
        total: states.length - 1,
      };
    });
    /** The CSS class for the progress bar, based on build success/failure
     * @computed {string} Progress bar CSS class */
    this.state_progress_css = ko.computed(() => {
      const finished = this.finished();
      const is_success = this.success();
      return {
        success: finished && is_success,
        error: finished && !is_success,
      };
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

    dayjs.extend(RelativeTime);
    dayjs.extend(Duration);
    dayjs.extend(LocalizedFormat);
    this.date.subscribe((date) => {
      const date_readable = dayjs(date);
      this.date_display(date_readable.format("llll"));
      this.date_display_since(date_readable.fromNow());
    });
    this.length.subscribe((length) => {
      this.length_display(dayjs.duration(length, "seconds").humanize());
    });

    /* Output */
    /** @observable {string} The build instance to process the build */
    this.builder = ko.observable(build.builder);
    /** @observable {Array.<Object>} Build command objects as an array */
    this.commands = ko.observableArray(build.commands);
    /** @observable {string} Repository commit for the build */
    this.commit = ko.observable(build.commit);
    /** @computed {string} A truncated version of the build commit */
    this.commit_short = ko.computed(() => {
      let commit = this.commit();
      if (commit !== undefined) {
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

    /* Debug */
    /** @observable {Object} Build configuration used for the build */
    this.config = ko.observable();
    /** @computed {string} Human readable build configuration */
    this.config_display = ko.computed(() => {
      return JSON.stringify(this.config(), null, 2);
    });

    // Anchor handling
    /** @observable {number} The permalink anchor part for selected command id */
    this.selected_command = ko.observable();
    /** @observable {number} The permalink anchro part for selected command line */
    this.selected_line = ko.observable();

    this.poll_api();
  }

  /**
   * Initial static method used to create view instance and attach to DOM
   *
   * @returns {BuildDetailView}
   */
  static init(build, selector = "#build-detail") {
    const hash = jquery(location).attr("hash");
    build.hash = hash;

    const view = new BuildDetailView(build);
    const domobj = domobj || jquery(selector)[0];
    ko.applyBindings(view, domobj);

    jquery(window).bind("hashchange", () => {
      view.handle_hash_change();
    });

    return view;
  }

  /**
   * Continually poll our API for build object and update Build, BuildCommand,
   * and BuildCommandOutput states. When the API return indicates the build is
   * finished, we stop recursive polling.
   */
  poll_api() {
    if (this.finished()) {
      return;
    }
    jquery.getJSON(this.api_url + this.id + "/").then((data) => {
      this.state(data.state);
      this.state_display(data.state_display);
      this.date(data.date);
      this.success(data.success);
      this.error(data.error);
      this.length(data.length);
      this.commit(data.commit);
      this.docs_url(data.docs_url);
      this.commit_url(data.commit_url);
      this.builder(data.builder);
      this.config(data.config);

      const commands = this.commands();
      if (data.commands.length !== commands.length) {
        for (const n in data.commands) {
          let command = data.commands[n];
          const match = ko.utils.arrayFirst(commands, (command_cmp) => {
            return command_cmp.id() === command.id;
          });
          if (!match) {
            this.commands.push(new BuildCommand(command, this));
          }
        }
      }
      this.is_loading(false);
      this.handle_hash_change();
    });

    // Continually poll API while build is not finished. If it is in a finished
    // state, this method will return without setting another timer.
    setTimeout(() => {
      this.poll_api();
    }, 2000);
  }

  /**
   * Get a reference id for a command output line. This may not be used anymore.
   *
   * @param {number} command_id - Build comand id
   * @param {number} line_number - Build command output line number
   * @returns {string}
   */
  line_number(command_id, line_number) {
    return command_id + "--" + line_number;
  }

  /**
   * Update this view's selected command and command line when the window hash
   * (anchor) changes. The hash is meant to be in the format of ``12--123``,
   * which is the command id and the command id output line index. This is
   * updated on the view, but observable :func:`BuildCommandOutput.is_highlighted`
   * uses the state change from this instance to update the DOM.
   *
   * This iterates over :func:`commands` to find a :class:`BuildCommand` with a
   * matching id, and then calls :func:`BuildCommand.is_showing` to set the
   * observable true.
   */
  handle_hash_change() {
    const hash = jquery(location).attr("hash");
    const re_hash = /^#(\d+)--(\d+)$/;

    if (hash) {
      // Update selected command and line
      let found = hash.match(re_hash);

      if (!found) {
        return;
      }

      const selected_command = found[1];
      const selected_line = found[2];
      this.selected_command(selected_command);
      this.selected_line(selected_line);

      // Iterate over commands to find a match and show the command
      for (const command of this.commands()) {
        if (command.id() == selected_command) {
          command.is_showing(true);
        }
      }
      jquery(hash).focus();

      // Stop processing the event to avoid page reload/etc
      return false;
    }
  }

  /* Debugging method for loading content from the main site */
  // TODO remove this after debug phase, it's only useful locally
  load_remote_build(build_id) {
    this.id = build_id;
    this.api_url = "https://readthedocs.org/api/v2/build/";
    this.state("triggered");
    this.commands([]);
    this.poll_api();
  }

  // TODO is this needed? This is likely old view cruft
  show_legacy_output() {
    this.legacy_output(true);
  }
}
Registry.add_view(BuildDetailView);
