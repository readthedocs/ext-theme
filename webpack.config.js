const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractCSS = new ExtractTextPlugin('[name].css');

module.exports = {
  entry: {
      "site.js": "./src/js/site.js",
      "site.css": "./src/css/site.less",
      "vendor.js": ['knockout'],
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
      )
    },
    extensions: ['.less', '.js', '.json'],
  },
  plugins: [
    extractCSS,
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor.js'],
      minChunks: 1,
    }),
  ],
  output: {
    filename: '[name]',
    path: __dirname + 'dist/'
  },
};
