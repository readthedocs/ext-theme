const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    // LESS goes first because the output library only exports that last entry
    // point in an entry point array
    site: ["./src/css/site.less", "./src/js/site.js"],
    //vendor: ["knockout", "jquery"],
  },
  output: {
    filename: "js/[name].js?[hash]",
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
    splitChunks: {

      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/].*\.js/,
          name: "vendor",
          chunks: "initial",
        },
      },

    }
  },
  module: {
    rules: [
      /*
      {
        test: require.resolve("./src/js/site.js"),
        use: "imports-loader?this=>window"
      },
      */
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
          }
        ]
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]?[hash]",
              outputPath: "css/images/",
              publicPath: "images/"
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]?[hash]",
              outputPath: "css/fonts/",
              publicPath: "fonts/"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css?[hash]",
      chunkFilename: "css/[name].css?[hash]"
    }),
    /*
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    */
  ],
  resolve: {
    alias: {
      // This is required to override the semanticui theme.config
      "../../theme.config": path.join(__dirname, "src/theme/theme.config"),
      "../../src/theme/site": path.join(__dirname, "src/theme/site")
    },
    extensions: [".less", ".js", ".json"]
  },
};
