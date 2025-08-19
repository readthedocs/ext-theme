import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

// Use export as a function to inspect `--mode`
export default (env, argv) => {
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
      filename: "js/[name].js?[contenthash]",
      chunkFilename: "js/vendors~[name].js?[contenthash]",
      publicPath: "./",
      path: path.resolve(
        path.join(
          "readthedocsext",
          "theme",
          "static",
          "readthedocsext",
          "theme",
        ),
      ),
    },
    optimization: {
      minimize: is_production,
      minimizer: [
        new TerserPlugin({
          // Avoids creating a `.LICENSE.txt` file
          extractComments: false,
          terserOptions: {
            sourceMap: true,
          },
        }),
        new CssMinimizerPlugin(),
      ],
      chunkIds: "named",
      splitChunks: {
        cacheGroups: {
          default: false,
          defaultVendors: {
            test: /[\\/]node_modules[\\/].*\.js/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },

    // Use filesystem for cache instead memory (default) to be re-use the cache
    // between Docker container starts/stops. This speeds up boot time a lot.
    cache: {
      type: is_production ? "memory" : "filesystem",
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          resolve: {
            // Disable Webpack 5 full resolution for ES modules
            fullySpecified: false,
          },
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
              options: {
                lessLogAsWarnOrErr: true,
                lessOptions: {
                  // LESS loader will try to load these before Webpack resolver
                  // kicks in, which is the recommended method. These include
                  // paths are a hack to theme.config and the theme loading
                  // pattern. See `src/sui/theme.config` for more.
                  paths: [
                    path.resolve(path.join(".")),
                    path.resolve(path.join("src/sui/")),
                    path.resolve(
                      path.join("node_modules/@readthedocs/sui-common-theme/"),
                    ),
                    path.resolve(path.join("node_modules/fomantic-ui-less/")),
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]?[contenthash]",
                outputPath: "css/images/",
                publicPath: "css/images/",
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]?[contenthash]",
            outputPath: "css/fonts/",
            publicPath: "css/fonts/",
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        DEBUG_MODE: !is_production,
      }),
      new MiniCssExtractPlugin({
        filename: "css/[name].css?[contenthash]",
        chunkFilename: "css/[name].css?[contenthash]",
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
        "../../theme.config": path.resolve(path.join("src/sui/theme.config")),
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
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      devMiddleware: {
        publicPath: "/readthedocsext/theme",
        index: true,
      },
      static: {
        directory: path.join("readthedocsext/theme"),
        serveIndex: true,
      },
      allowedHosts: "all",
      watchFiles: ["readthedocsext/theme/**/*.html"],
      client: {
        overlay: false,
      },
    },
  };
};
