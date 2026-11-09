import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import postcssFomanticDark from "postcss-fomanticui-dark";

// Use export as a function to inspect `--mode` and to use multiple entrypoints
// with dependencies.
export default (env, argv) => {
  const promiseSite = new Promise((resolve, reject) => {
    let config = getCommonConfig(env, argv);
    Object.assign(config, {
      name: "site",
      entry: {
        site: ["./src/css/site.less", "./src/js/site.js"],
      },
      // Only define one dev server configuration, you can't specify this in
      // both entry points.
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
    });
    resolve(config);
  });
  const promiseDark = new Promise((resolve, reject) => {
    let config = getCommonConfig(env, argv);
    Object.assign(config, {
      name: "dark",
      entry: {
        dark: ["./src/css/dark.less", "./src/js/dark.js"],
      },
      // Depends on the CSS output of `site`, require this is built first
      dependencies: ["site"],
    });

    // Don't use split chunks on this entry as it overwrites the site vendor
    // bundle.
    delete config.optimization.splitChunks;

    resolve(config);
  });

  return Promise.all([promiseSite, promiseDark]);
};

// Common because it's duplicated across the two configs.
const lessLoaderOptions = {
  lessLogAsWarnOrErr: true,
  lessOptions: {
    paths: [
      path.resolve(path.join(".")),
      path.resolve(path.join("src/sui/")),
      path.resolve(path.join("node_modules/@readthedocs/sui-common-theme/")),
      path.resolve(path.join("node_modules/fomantic-ui-less/")),
      path.resolve(
        path.join(
          "readthedocsext",
          "theme",
          "static",
          "readthedocsext",
          "theme",
          "css",
        ),
      ),
    ],
  },
};

/**
 * Common configuration shared by both the site and dark entrypoints.
 *
 * This is two separate configurations instead of just two separate entrypoints
 * because the dark entrypoint compiles `dark.less` through
 * `postcss-fomanticui-dark` to produce a standalone dark-theme overlay
 * (`css/dark.css`). The dark entry also depends on the site entry being built
 * first (via `dependencies: ["site"]`).
 */
function getCommonConfig(env, argv) {
  const isProduction = argv.mode == "production";

  return {
    externals: {
      moment: "moment",
    },
    output: {
      filename: "js/[name].js?[contenthash]",
      chunkFilename: "js/vendors~[name].js?[contenthash]",
      publicPath: "auto",
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
      runtimeChunk: "multiple",
      minimize: isProduction,
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
      type: isProduction ? "memory" : "filesystem",
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
          resource: /src[/\\]css[/\\]site\.less$/,
          oneOf: [
            {
              // The loader used to produce the minified site.css file
              use: [
                {
                  loader: MiniCssExtractPlugin.loader,
                },
                {
                  loader: "css-loader",
                },
                {
                  loader: "less-loader",
                  options: lessLoaderOptions,
                },
              ],
            },
          ],
        },
        {
          resource: /src[/\\]css[/\\]dark\.less$/,
          oneOf: [
            {
              // The loader used to produce the minified dark.css file
              use: [
                {
                  loader: MiniCssExtractPlugin.loader,
                },
                {
                  loader: "css-loader",
                },
                {
                  loader: "postcss-loader",
                  options: {
                    postcssOptions: {
                      plugins: [postcssFomanticDark()],
                    },
                  },
                },
                {
                  loader: "less-loader",
                  options: lessLoaderOptions,
                },
              ],
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
        DEBUG_MODE: !isProduction,
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
        "site.css": path.resolve(
          path.join(
            "readthedocsext",
            "theme",
            "static",
            "readthedocsext",
            "theme",
            "css",
          ),
        ),
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
    devtool: "source-map",
  };
}
