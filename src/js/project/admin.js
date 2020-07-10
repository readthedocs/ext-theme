import jquery from "jquery";
import ko from "knockout";

export function ProjectAutomationRuleView(data) {
  const self = this;

  self.predefined_match_arg = ko.observable();
  self.predefined_match_arg.subscribe((predefined_match_arg) => {
    console.log(predefined_match_arg);
  });
  self.is_match_arg_visible = ko.computed(() => {
    let predefined_match_arg = self.predefined_match_arg();
    return predefined_match_arg === "";
  });
  self.is_all_versions = ko.computed(() => {
    return self.predefined_match_arg() === "all-versions";
  });
  self.is_semver_versions = ko.computed(() => {
    return self.predefined_match_arg() === "semver-versions";
  });
  self.is_custom = ko.computed(() => {
    return self.predefined_match_arg() === "";
  });
}

ProjectAutomationRuleView.init = function (instance, selector) {
  jquery(document).ready(() => {
    var view = new ProjectAutomationRuleView(instance);
    ko.applyBindings(view, jquery(selector)[0]);
    return view;
  });
};

export function ProjectRedirectView(data) {
  const self = this;

  self.redirect_type = ko.observable();
  self.from_url = ko.observable("");
  self.to_url = ko.observable("");

  self.is_example_disabled = ko.observable(false);
  self.is_from_url_visible = ko.observable();
  self.is_to_url_visible = ko.observable();

  self.redirect_from = ko.computed(() => {
    var from_url = self.from_url();
    var redirect_type = self.redirect_type();
    if (redirect_type === "prefix") {
      return from_url + "faq.html";
    } else if (redirect_type === "page") {
      return "/$lang/$version/" + from_url.replace(/^\/+/, "");
    } else if (redirect_type === "exact") {
      return from_url;
    }
    return "";
  });
  self.redirect_to = ko.computed(() => {
    const to_url = self.to_url();
    const redirect_type = self.redirect_type();
    if (redirect_type === "prefix") {
      return "/$lang/$version/faq.html";
    } else if (redirect_type === "page") {
      return "/$lang/$version/" + to_url.replace(/^\/+/, "");
    } else if (redirect_type === "exact") {
      return to_url;
    }
    return "";
  });

  self.redirect_type.subscribe((redirect_type) => {
    if (["prefix", "page", "exact"].includes(redirect_type)) {
      self.is_example_disabled(false);
      let is_to_url_visible = true;

      // Update visibility
      if (redirect_type == "prefix") {
        is_to_url_visible = false;
      }
      self.is_from_url_visible(true);
      self.is_to_url_visible(is_to_url_visible);
    } else {
      self.is_example_disabled(true);
      self.is_from_url_visible(false);
      self.is_to_url_visible(false);
    }
  });
}

ProjectRedirectView.init = function (instance, selector) {
  jquery(document).ready(() => {
    var view = new ProjectRedirectView(instance);
    ko.applyBindings(view, jquery(selector)[0]);
    return view;
  });
};
