import jquery from "jquery";
import ko from "knockout";

function EmbedTopic(data) {
  const self = this;

  self.docs_url = ko.observable(data.docs_url);
  self.section = ko.observable(data.section);
  self.url = ko.computed(() => {
    return self.docs_url() + self.section();
  });
  self.text = ko.observable(data.text);
  self.children = ko.observableArray();
}

export function EmbedTopicsView() {
  const self = this;

  self.topics = ko.observableArray();
  self.is_loading = ko.observable(false);

  self.header_to_topics = (data) => {
    for (let header of data.headers) {
      for (let text of Object.keys(header)) {
        const section = header[text];
        self.topics.push(
          new EmbedTopic({
            docs_url: data.url + ".html",
            section: section,
            text: text,
          })
        );
      }
    }
  };

  self.load = (doc) => {
    self.is_loading(true);
    const params = jquery.param({
      project: "docs",
      version: "stable",
      doc: doc,
    });
    const docs = jquery("#edit-right");
    const url = "https://readthedocs.org/api/v2/embed/?" + params;

    jquery
      .get(url, (data) => {
        self.header_to_topics(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .always(() => {
        self.is_loading(false);
      });
  };
}

EmbedTopicsView.init = function (doc, dom_obj) {
  jquery(document).ready(() => {
    var view = new EmbedTopicsView();
    ko.applyBindings(view, dom_obj);
    view.load(doc);
  });
};

export function embed_docs() {
  jquery("[data-embed-doc-view]").each((index, obj) => {
    const embed = jquery(obj);
    const embed_doc = embed.attr("data-embed-doc-view");
    EmbedTopicsView.init(embed_doc, embed[0]);
  });
}
