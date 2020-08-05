import ko from "knockout";
import jquery from "jquery";

import * as admin from "./admin";
import * as create from "./create";

import { PopupView, APIListItemView } from "../core/views";

export { admin, create };


export class ProjectListView extends PopupView {
  constructor() {
    super();

    this.projects = ko.observableArray();
  }

  project(data) {
    const project = new Project(data);
    this.projects.push(project);
    return project;
  }
}

class Project extends APIListItemView {
  constructor(project) {
    super(project);

    this.url_docs = ko.observable();
    this.data.subscribe((data) => {
      this.url_docs(data.canonical_url);
    });
  }
}

export class ProjectVersionListView extends PopupView {
  constructor() {
    super();

    this.versions = ko.observableArray();
  }

  version(data) {
    const version = new Version(data);
    this.versions.push(version);
    return version;
  }
}

class Version extends APIListItemView {
  constructor(version) {
    super(version);
    this.url_pdf = ko.observable();
    this.url_epub = ko.observable();
    this.url_html = ko.observable();
    this.url_docs = ko.observable();
    this.is_built = ko.observable(true);

    this.data.subscribe((data) => {
      this.url_pdf(data.downloads.pdf);
      this.url_epub(data.downloads.epub);
      this.url_html(data.downloads.html);
      this.url_docs(data.urls.documentation);
      this.is_built(data.built);
    });
  }

  trigger_build(url, csrf_token) {
    return (context, ev) => {
      jquery.ajax({
        type: "POST",
        url: url,
        data: {
          csrfmiddlewaretoken: csrf_token,
        },
      }).then((data) => {
        // The user could be redirected to the build that was just created here,
        // but API v3 is missing the URL on the build object. I don't mind that
        // the interaction leaves me on the same interface while showing the new
        // build either.
        // TODO maybe redirect the user to the new build?
        // https://github.com/readthedocs/readthedocs.org/issues/7361
        window.location.reload();
      }).catch((err) => {
        console.error(err);
      });
    };
  }
}
