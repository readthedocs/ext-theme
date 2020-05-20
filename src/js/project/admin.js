import jquery from "jquery";
import ko from "knockout";

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
    }
    else if (redirect_type === "page") {
      return "/$lang/$version/" + from_url.replace(/^\/+/, '');
    }
    else if (redirect_type === "exact") {
      return from_url;
    }
    return "";
  });
  self.redirect_to = ko.computed(() => {
    const to_url = self.to_url();
    const redirect_type = self.redirect_type();
    if (redirect_type === "prefix") {
      return "/$lang/$version/faq.html";
    }
    else if (redirect_type === "page") {
      return "/$lang/$version/" + to_url.replace(/^\/+/, '');
    }
    else if (redirect_type === "exact") {
      return to_url;
    }
    return "";
  });

  self.redirect_type.subscribe((redirect_type) => {
    if (['prefix', 'page', 'exact'].includes(redirect_type)) {
      self.is_example_disabled(false);
      let is_to_url_visible = true;

      // Update visibility
      if (redirect_type == 'prefix') {
        is_to_url_visible = false;
      }
      self.is_from_url_visible(true);
      self.is_to_url_visible(is_to_url_visible);
    }
    else {
      self.is_example_disabled(true);
      self.is_from_url_visible(false);
      self.is_to_url_visible(false);
    }
  });
};

// TODO Move this to the django form widget attributes. This is a hack to add
// the data bindings without touching the form code.
ProjectRedirectView.install = function () {
  jquery(document).ready(() => {
    jquery('#id_redirect_type').attr('data-bind', 'value: redirect_type');
    jquery('#id_from_url').attr('data-bind', 'textInput: from_url, enable: is_from_url_visible');
    jquery('#id_to_url').attr('data-bind', 'textInput: to_url, enable: is_to_url_visible');
    var view = new ProjectRedirectView({});
    ko.applyBindings(view, jquery('#project-redirect-form')[0]);
    return view;
  });
}

ProjectRedirectView.init = function (instance, selector) {
  jquery(document).ready(() => {
    var view = new ProjectRedirectView(instance);
    ko.applyBindings(view, jquery(selector)[0]);
    return view;
  });
};
