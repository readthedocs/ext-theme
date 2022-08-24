const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// Use export as a function to inspect `--mode`
module.exports = (env, argv) => {
  const is_production = argv.mode == "production";

  return {
    entry: {
      // LESS goes first because the output library only exports that last entry
      // point in an entry point array
      site: ["./src/css/site.less", "./src/js/site.js"],
    },
    externals: {
      moment: "moment",
    },
    output: {
      filename: "js/[name].js?[hash]",
      chunkFilename: "js/[name].js?[hash]",
      publicPath: "./",
      path: path.join(
        __dirname,
        "readthedocsext",
        "theme",
        "static",
        "readthedocsext",
        "theme"
      ),
    },
    optimization: {
      minimize: is_production,
      minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin({})],
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/].*\.js/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
            },
            {
              loader: "less-loader",
            },
          ],
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]?[hash]",
                outputPath: "css/images/",
                publicPath: "images/",
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]?[hash]",
                outputPath: "css/fonts/",
                publicPath: "fonts/",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        DEBUG_MODE: !is_production,
      }),
      new MiniCssExtractPlugin({
        filename: "css/[name].css?[hash]",
        chunkFilename: "css/[name].css?[hash]",
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jquery: "jquery",
        "window.jQuery": "jquery",
        jQuery: "jquery",
      }),
    ],
    resolve: {
      alias: {
        "../../theme.config": path.join(__dirname, "src/sui/theme.config"),
      },
      extensions: [".less", ".js", ".json", ".overrides", ".variables"],
    },

    // Development options
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: [
        "./node_modules/",
        "./readthedocs.org/",
        "readthedocsext_theme.egg-info",
      ],
    },
    devServer: {
      open: false,
      hot: false,
      liveReload: true,
      publicPath: "/readthedocsext/theme/",
      disableHostCheck: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  };
};
