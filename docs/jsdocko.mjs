/* JSdoc Knockout tag support
 *
 * Gives the following tags
 *
 * @observable {Boolean} An observable
 * @computed {Boolean} A computed observable
 */

function transform_observable(doclet) {
  const re_text = /^\{([^\}]+)\} (.*)$/;
  if (doclet.tags == undefined) {
    return doclet;
  }
  doclet.tags = Array.prototype.map.call(doclet.tags, (tag) => {
    if (tag.title === "observable" || tag.title === "computed") {
      const match = re_text.exec(tag.text);
      if (match) {
        const obs_type = match[1];
        const obs_desc = match[2];
        doclet.kind = "function";
        if (tag.title === "observable") {
          doclet.params = [
            {
              type: { names: [obs_type] },
              description: obs_desc,
              name: "arg",
            },
          ];
        }
        doclet.returns = [
          {
            type: { names: [obs_type] },
            description: obs_desc,
          },
        ];
      }
    } else {
      return tag;
    }
  });
  return doclet;
}

export const handlers = {
  newDoclet: function (e) {
    let doclet = e.doclet;
    doclet = transform_observable(doclet);
    return doclet;
  },
};
