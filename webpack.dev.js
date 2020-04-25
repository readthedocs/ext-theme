const path = require("path");
const merge = require("webpack-merge");
const exec = require("child_process").exec;
const WatchPlugin = require("webpack-watch-files-plugin").default;
const ShellPlugin = require("webpack-shell-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: [
      './node_modules/',
      './readthedocs.org/',
      'readthedocsext_theme.egg-info',
    ]
  },
  devServer: {
    open: false,
    hot: false,
    liveReload: true,
    publicPath: "/static/",
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
});
