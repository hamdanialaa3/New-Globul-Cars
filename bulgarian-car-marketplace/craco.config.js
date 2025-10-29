// ⚡ OPTIMIZED CRACO Configuration for Production Build
module.exports = {
  plugins: [
    {
      plugin: require('craco-esbuild'),
      options: {
        esbuildLoaderOptions: {
          target: 'es2017',
        },
        esbuildMinimizerOptions: {
          target: 'es2017',
          css: true,
        },
        skipEsbuildJest: false,
      },
    },
  ],
  eslint: {
    enable: false, // Disabled for faster builds
    mode: 'file',
  },
  babel: {
    plugins: [
      [
        'babel-plugin-styled-components',
        {
          displayName: process.env.NODE_ENV === 'development',  // ⚡ Only in dev
          fileName: false,
          ssr: false,  // ⚡ Not using SSR
          minify: true,
          transpileTemplateLiterals: true,
          pure: true,
        },
      ],
    ],
  },
  webpack: {
    configure: (webpackConfig) => {
      // ⚡ Remove ESLint plugin for faster builds
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );

      // ⚡ Remove TypeScript type checker to prevent OOM during production builds
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

      // ⚡ OPTIMIZED: Performance improvements
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        // Temporarily disable minification to avoid parser issues with modern ESM in dependencies
        minimize: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // ⚡ Ensure Terser can handle modern syntax from some dependencies
      const TerserPlugin = require('terser-webpack-plugin');
      if (webpackConfig.optimization && Array.isArray(webpackConfig.optimization.minimizer)) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map((minimizer) => {
          if (minimizer && minimizer.constructor && minimizer.constructor.name === 'TerserPlugin') {
            return new TerserPlugin({
              extractComments: false,
              terserOptions: {
                ecma: 2020,
                compress: {
                  comparisons: false,
                },
                mangle: true,
                format: {
                  comments: false,
                  ascii_only: true,
                },
              },
            });
          }
          return minimizer;
        });
      }

      // Ensure resolve exists
      webpackConfig.resolve = webpackConfig.resolve || {};

  // Fallbacks for Node.js core modules in the browser (Webpack 5)
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        util: require.resolve('util/'),
        zlib: require.resolve('browserify-zlib'),
        crypto: require.resolve('crypto-browserify'),
        http: false,
        https: false,
        fs: false,
        net: false,
        tls: false,
        os: false,
        path: false,
        querystring: false,
      };

      // Map `node:` scheme imports to browser-friendly shims
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        'node:url': require.resolve('url/'),
        'node:util': require.resolve('util/'),
        'node:buffer': require.resolve('buffer/'),
        'node:stream': require.resolve('stream-browserify'),
        'node:zlib': require.resolve('browserify-zlib'),
        'node:crypto': require.resolve('crypto-browserify'),
        'node:process': require.resolve('process/browser'),
        // Ensure ESM fully-specified requests like 'process/browser' resolve to file with extension
        'process/browser': require.resolve('process/browser'),
        process: require.resolve('process/browser'),
      };

      // Provide globals for process and Buffer
      const webpack = require('webpack');
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // 🔧 Remove or exclude source-map-loader to avoid ENOENT with algoliasearch
      const pruneSourceMapLoader = (rules) => {
        if (!Array.isArray(rules)) return;
        for (let i = rules.length - 1; i >= 0; i--) {
          const rule = rules[i];
          const hasLoader = rule && rule.loader && typeof rule.loader === 'string' && rule.loader.includes('source-map-loader');
          if (hasLoader) {
            rules.splice(i, 1);
            continue;
          }
          if (rule && Array.isArray(rule.use)) {
            rule.use = rule.use.filter((u) => {
              const name = typeof u === 'string' ? u : (u && u.loader) || '';
              return !name.includes('source-map-loader');
            });
          }
          if (rule && Array.isArray(rule.oneOf)) pruneSourceMapLoader(rule.oneOf);
          if (rule && Array.isArray(rule.rules)) pruneSourceMapLoader(rule.rules);
        }
      };
      if (webpackConfig.module && Array.isArray(webpackConfig.module.rules)) {
        pruneSourceMapLoader(webpackConfig.module.rules);
      }

      return webpackConfig;
    },
  },
};