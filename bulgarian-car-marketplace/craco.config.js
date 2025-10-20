// ⚡ OPTIMIZED CRACO Configuration for Production Build
module.exports = {
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

      // ⚡ OPTIMIZED: Performance improvements
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
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

      return webpackConfig;
    },
  },
};