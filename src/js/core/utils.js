import jquery from "jquery";

// Append query string parameters to a URL
export function append_url_params(url, params) {
  let link = jquery("<a>").attr("href", url).get(0);

  Object.keys(params).map(function (key) {
    if (link.search) {
      link.search += "&";
    }
    link.search += key + "=" + params[key];
  });
  return link.href;
}
