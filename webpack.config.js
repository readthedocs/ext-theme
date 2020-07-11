const path = require("path");
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
      //vendor: ["knockout", "jquery"],
    },
    output: {
      filename: is_production
        ? "js/[name].min.js?[hash]"
        : "js/[name].js?[hash]",
      chunkFilename: is_production
        ? "js/[name].min.js?[hash]"
        : "js/[name].js?[hash]",
      publicPath: is_production ? "/" : "http://localhost:8080/static/",
      path: path.join(
        __dirname,
        "readthedocsext",
        "theme",
        "static",
        "readthedocsext",
        "theme"
      ),
      // This is what exports a `readthedocs.site` object when loading the `site.js`
      // file via a `<script>` element.
      library: ["readthedocs", "[name]"],
      globalObject: "this",
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
      new MiniCssExtractPlugin({
        filename: is_production
          ? "css/[name].min.css?[hash]"
          : "css/[name].css?[hash]",
        chunkFilename: "css/[name].css?[hash]",
      }),
    ],
    resolve: {
      alias: {
        // This is required to override the semanticui theme.config
        "../../theme.config": path.join(__dirname, "src/theme/theme.config"),
        "../../src/theme/site": path.join(__dirname, "src/theme/site"),
      },
      extensions: [".less", ".js", ".json"],
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
      publicPath: "/static/",
      disableHostCheck: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  };
};
