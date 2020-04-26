// Build - detail view

const ko = require("knockout");
const $ = require("jquery");
import moment from "moment";


function BuildCommandOutput(data) {
  var self = this;

  // Used for calls to the root view and parent command
  self.view = data.view;
  self.command = data.command;

  self.output = ko.observable(data.output);
  self.line_number = ko.observable(data.line_number);
  self.anchor_id = ko.computed(function () {
    return self.command.id() + "--" + self.line_number();
  });

  self.is_highlighted = ko.computed(() => {
    return (
      self.line_number() == self.view.selected_line() &&
      self.command.id() == self.view.selected_command()
    );
  });
}

function BuildCommand(data) {
  var self = this;

  // Used for calls to the root view
  self.view = data.view;

  // Observables
  self.id = ko.observable(data.id);
  self.command = ko.observable(data.command);
  self.exit_code = ko.observable(data.exit_code || 0);
  self.successful = ko.observable(self.exit_code() === 0);
  self.run_time = ko.observable(data.run_time);

  // Conditional expansion
  var is_showing = self.successful() ? false : true;
  self.is_showing = ko.observable(is_showing);
  self.toggle_showing = function () {
    self.is_showing(!self.is_showing());
  };

  // Build output lines
  var output_lines = data.output.split(/\n/);
  self.output_lines = ko.observableArray(
    output_lines.map(function (line, index) {
      return new BuildCommandOutput({
        view: self.view,
        command: self,
        output: line,
        line_number: index + 1,
      });
    })
  );

  self.command_status = ko.computed(function () {
    return self.successful()
      ? "build-command-successful"
      : "build-command-failed";
  });
}

export function BuildDetailView(instance) {
  var self = this;
  var instance = instance || {};

  /* State variables */
  self.success = ko.observable(instance.success);
  self.error = ko.observable(instance.error);
  self.state = ko.observable(instance.state);
  self.state_display = ko.observable(instance.state_display);
  self.finished = ko.computed(function () {
    return self.state() === "finished";
  });
  self.is_loading = ko.observable(true);

  /* State subscriptions -- performed on load to ensure jquery plugins */
  self.state_progress = self.state.subscribe(function (new_value) {
    var states = [
      "triggered",
      "queued",
      "cloning",
      "installing",
      "building",
      "uploading",
      "finished",
    ];
    var progress_value = states.indexOf(self.state());
    $("#build-progress").progress({
      value: progress_value,
      total: states.length - 1,
    });
  });
  self.state_progress_css = ko.computed(() => {
    const finished = self.finished();
    const is_success = self.success();
    return {
      success: (finished && is_success),
      error: (finished && !is_success),
    }
  });

  /* Output variables */
  self.date = ko.observable(instance.date);
  self.date_display = ko.computed(() => {
    const date = self.date();
    return moment(date).format('llll');
  });
  self.date_display_since = ko.computed(() => {
    const date = self.date();
    return moment(date).fromNow();
  });
  self.length = ko.observable(instance.length);
  self.length_display = ko.computed(() => {
    return moment.duration(self.length(), 'seconds').humanize();
  })
  self.builder = ko.observable(instance.builder);
  self.commands = ko.observableArray(instance.commands);
  self.commit = ko.observable(instance.commit);
  self.commit_short = ko.computed(() => {
    let commit = self.commit();
    if (commit !== undefined) {
      return commit.substring(0, 8);
    }
  });
  self.docs_url = ko.observable(instance.docs_url);
  self.commit_url = ko.observable(instance.commit_url);

  /* Others */
  self.legacy_output = ko.observable(false);
  self.show_legacy_output = function () {
    self.legacy_output(true);
  };
  self.line_number = function (command_id, line_number) {
    return command_id + "--" + line_number;
  };

  /* Debug */
  self.config = ko.observable();
  self.config_display = ko.computed(() => {
    return JSON.stringify(self.config(), null, 2);
  });
  self.show_debug = function () {
    $("#build-debug-modal").modal("show");
  }

  // Anchor handling
  var re_hash = /^#(\d+)--(\d+)$/;
  self.selected_command = ko.observable();
  self.selected_line = ko.observable();
  self.update_hash = function (ev) {
    var hash = $(location).attr("hash");
    if (hash) {
      // Update selected command and line
      let found = hash.match(re_hash);

      if (!found) {
        return;
      }

      let selected_command = found[1];
      let selected_line = found[2];
      self.selected_command(selected_command);
      self.selected_line(selected_line);

      // Show and focus
      for (let command of self.commands()) {
        if (command.id() == selected_command) {
          command.is_showing(true);
        }
      }
      $(hash).focus();

      // Stop processing the event
      return false;
    }
  };

  function poll_api() {
    if (self.finished()) {
      return;
    }
    $.getJSON("/api/v2/build/" + instance.id + "/", function (data) {
      self.state(data.state);
      self.state_display(data.state_display);
      self.date(data.date);
      self.success(data.success);
      self.error(data.error);
      self.length(data.length);
      self.commit(data.commit);
      self.docs_url(data.docs_url);
      self.commit_url(data.commit_url);
      self.builder(data.builder);
      self.config(data.config);

      let commands = self.commands()
      if (data.commands.length !== commands.length) {
        for (let n in data.commands) {
          var command = data.commands[n];
          var match = ko.utils.arrayFirst(
            commands,
            function (command_cmp) {
              return command_cmp.id() === command.id;
            }
          );
          if (!match) {
            command.view = self;
            self.commands.push(new BuildCommand(command));
          }
        }
      }
      self.is_loading(false);
      self.update_hash();
    });

    setTimeout(poll_api, 2000);
  }

  poll_api();
}

export var build_ctl = null;

BuildDetailView.init = function (instance, domobj) {
  $(document).ready(() => {
    var hash = $(location).attr("hash");
    instance.hash = hash;

    var view = build_ctl = new BuildDetailView(instance);
    var domobj = domobj || $("#build-detail")[0];

    ko.applyBindings(view, domobj);

    $(window).bind("hashchange", view.update_hash);

    return view;
  })
};
