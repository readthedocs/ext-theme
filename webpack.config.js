const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractCSS = new ExtractTextPlugin('site.css');

module.exports = {
  entry: {
      "dummy.js": "./src/js/dummy.js",
      "site.js": "./src/js/site.js",
      //"site.css": "./src/css/site.less",
      "vendor.js": ['knockout', 'jquery'],
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        loader: extractCSS.extract({
          use: [
            {loader: "css-loader?minimize"},
            {loader: "less-loader"},
          ],
        })
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
        use: 'file-loader?name=[name].[ext]?[hash]'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=1000&mimetype=application/fontwoff'
      },
    ]
  },
  resolve: {
    alias: {
      // This is required to override the semanticui theme.config
      '../../theme.config': path.join(
        __dirname,
        'src/theme/theme.config'
      ),
      '../../src/theme/site': path.join(
        __dirname,
        'src/theme/site'
      ),
    },
    extensions: ['.less', '.js', '.json'],
  },
  plugins: [
    extractCSS,
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor.js'],
      minChunks: 1,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  output: {
    filename: '[name]',
    path: path.join(__dirname, 'readthedocsext', 'theme', 'static', 'readthedocsext', 'theme')
  },
};
