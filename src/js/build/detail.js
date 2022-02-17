// Build - detail view

import jquery from "jquery";
import ko from "knockout";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

/** Build command output subview, used in :class:`BuildCommand`
 *
 * .. note::
 *     TODO write docs
 */
class BuildCommandOutput {
  constructor(build_command_output, view) {
    // Used for calls to the root view and parent command
    this.view = view;

    this.command = build_command_output.command;
    this.output = ko.observable(build_command_output.output);
    this.line_number = ko.observable(build_command_output.line_number);
    this.anchor_id = ko.computed(() => {
      return this.command.id() + "--" + this.line_number();
    });

    this.is_highlighted = ko.computed(() => {
      return (
        this.line_number() == this.view.selected_line() &&
        this.command.id() == this.view.selected_command()
      );
    });
  }
}

/** Build command subview, used in :class:`BuildDetailView`
 *
 * .. note::
 *     TODO write docs
 */
class BuildCommand {
  constructor(build_command, view) {
    // Used for calls to the root view
    this.view = view;

    // Remove the path from display
    // TODO do this on the API level
    const re_command_trim =
      /(\/usr\/src\/app|\/home\/docs)\/checkouts\/readthedocs.org\/user_builds\/[^\/]+\/[^\/]+\/[^\/]+\//g;
    let command = build_command.command.replace(re_command_trim, "");

    // Observables
    this.id = ko.observable(build_command.id);
    this.command = ko.observable(command);
    this.exit_code = ko.observable(build_command.exit_code || 0);
    this.successful = ko.computed(() => {
      return this.exit_code() === 0;
    });
    this.run_time = ko.observable(build_command.run_time);

    // Conditional expansion
    const is_showing = this.successful() ? false : true;
    this.is_showing = ko.observable(is_showing);

    this.command_status = ko.computed(() => {
      return this.successful()
        ? "build-command-successful"
        : "build-command-failed";
    });

    this.output = ko.observable(build_command.output);
    this.output_lines = ko.observableArray([]);
    this.render_output();
  }

  toggle_showing() {
    this.is_showing(!this.is_showing());
  }

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

/** Build detail view shows build metadata, build commands, and build command
 * output.
 *
 * .. note::
 *     TODO write docs
 */
export class BuildDetailView {
  constructor(build = {}) {
    /* Attributes */
    this.id = build.id;
    // TODO make this configurable?
    this.api_url = "/api/v2/build/";

    /* State variables */
    this.success = ko.observable(build.success);
    this.error = ko.observable(build.error);
    this.state = ko.observable(build.state);
    this.state_display = ko.observable(build.state_display);
    this.finished = ko.computed(() => {
      return this.state() === "finished";
    });
    this.is_loading = ko.observable(true);

    /* State subscriptions -- performed on load to ensure jquery plugins */
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
    this.state_progress_css = ko.computed(() => {
      const finished = this.finished();
      const is_success = this.success();
      return {
        success: finished && is_success,
        error: finished && !is_success,
      };
    });

    /* Time attributes */
    this.date = ko.observable(build.date);
    this.length = ko.observable(build.length);

    this.date_display = ko.observable();
    this.date_display_since = ko.observable();
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
    this.builder = ko.observable(build.builder);
    this.commands = ko.observableArray(build.commands);
    this.commit = ko.observable(build.commit);
    this.commit_short = ko.computed(() => {
      let commit = this.commit();
      if (commit !== undefined) {
        return commit.substring(0, 8);
      }
    });
    this.docs_url = ko.observable(build.docs_url);
    this.commit_url = ko.observable(build.commit_url);

    /* Others */
    this.legacy_output = ko.observable(false);

    /* Debug */
    this.config = ko.observable();
    this.config_display = ko.computed(() => {
      return JSON.stringify(this.config(), null, 2);
    });

    // Anchor handling
    this.selected_command = ko.observable();
    this.selected_line = ko.observable();

    this.poll_api();
  }

  /* Initial static method used to create view instance and attach to DOM
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

  /* Continually poll API for build object and update Build, BuildCommand, and
   * BuildCommandOutput states.
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

  /* Get a reference id for each command output line
   *
   * @returns {string}
   */
  line_number(command_id, line_number) {
    return command_id + "--" + line_number;
  }

  /* Use URL hash change to highlight the selected command output line */
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

      // Show and focus
      for (const command of this.commands()) {
        if (command.id() == selected_command) {
          command.is_showing(true);
        }
      }
      jquery(hash).focus();

      // Stop processing the event
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
