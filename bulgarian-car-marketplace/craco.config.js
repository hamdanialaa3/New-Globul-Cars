// ⚡ SIMPLIFIED CRACO Configuration (for debugging)
const webpack = require('webpack');

module.exports = {
  eslint: {
    enable: false, // Disabled for faster builds
  },
  webpack: {
    configure: (webpackConfig) => {
      // ⚡ Disable minification to fix Terser errors
      if (webpackConfig.mode === 'production') {
        webpackConfig.optimization.minimize = false;
      }

      // ⚡ Remove ESLint plugin for faster builds
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );

      // ⚡ Remove TypeScript type checker
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

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
        'process/browser': require.resolve('process/browser'),
        process: require.resolve('process/browser'),
      };

      // Provide globals for process and Buffer
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
