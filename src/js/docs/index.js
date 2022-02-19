import jquery from "jquery";
import ko from "knockout";

import { Registry } from "../application/registry";

class EmbedTopic {
  constructor(topic) {
    this.docs_url = ko.observable(topic.docs_url);
    this.section = ko.observable(topic.section);
    this.url = ko.computed(() => {
      return this.docs_url() + this.section();
    });
    this.text = ko.observable(topic.text);
    this.children = ko.observableArray();
  }
}

export class EmbedTopicsView {
  static view_name = "EmbedTopicsView";

  constructor(doc) {
    this.doc = doc;
    this.topics = ko.observableArray();
    this.is_loading = ko.observable(false);

    // `doc` can be empty in the template, just ignore if so.
    if (this.doc) {
      this.load();
    }
  }

  header_to_topics(data) {
    for (let header of data.headers) {
      for (let text of Object.keys(header)) {
        const section = header[text];
        this.topics.push(
          new EmbedTopic({
            docs_url: data.url + ".html",
            section: section,
            text: text,
          })
        );
      }
    }
  }

  load() {
    console.debug("Loading doc from embed API:", this.doc);
    this.is_loading(true);
    const params = jquery.param({
      project: "docs",
      version: "stable",
      doc: this.doc,
    });
    const url = "https://readthedocs.org/api/v2/embed/?" + params;

    jquery
      .get(url, (data) => {
        this.header_to_topics(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .always(() => {
        this.is_loading(false);
      });
  }
}
Registry.add_view(EmbedTopicsView);
