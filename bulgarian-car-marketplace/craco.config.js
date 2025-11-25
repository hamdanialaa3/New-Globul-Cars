// Minimal CRACO configuration to avoid previous complex plugin errors
const path = require('path');
const webpack = require('webpack');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  eslint: { enable: false },
  webpack: {
    configure: (config) => {
      // Disable minification in production to ease debugging
      if (config.mode === 'production') {
        config.optimization.minimize = false;
      }
      
      // CRITICAL: Remove CRA's default Workbox plugin to prevent conflict
      config.plugins = (config.plugins || []).filter(p => {
        const name = p.constructor?.name;
        return name !== 'ESLintWebpackPlugin' 
          && name !== 'ForkTsCheckerWebpackPlugin' 
          && name !== 'ModuleScopePlugin'
          && name !== 'GenerateSW'  // Remove CRA's default SW plugin
          && name !== 'InjectManifest'; // Remove any existing InjectManifest
      });

      // Basic aliases
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@': path.resolve(__dirname, 'src'),
        '@globul-cars/core': path.resolve(__dirname, '../packages/core/src'),
        '@globul-cars/core/*': path.resolve(__dirname, '../packages/core/src/*'),
        '@globul-cars/services': path.resolve(__dirname, '../packages/services/src'),
        '@globul-cars/services/*': path.resolve(__dirname, '../packages/services/src/*'),
        // Polyfills / shims needed for packages expecting Node globals
        'process/browser': require.resolve('process/browser'),
        process: require.resolve('process/browser')
      };
      // Add extensions
      config.resolve.extensions = [
        ...(config.resolve.extensions || []),
        '.ts', '.tsx', '.js', '.jsx'
      ];
      // Provide Node polyfills required by some libs
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
        zlib: require.resolve('browserify-zlib'),
        process: require.resolve('process/browser'),
        http: false,
        https: false,
        fs: false,
        net: false,
        tls: false,
        os: false,
        path: false,
        querystring: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Add our custom Workbox with runtime caching (production only)
      if (config.mode === 'production') {
        config.plugins.push(
          new InjectManifest({
            swSrc: path.resolve(__dirname, 'src/sw-custom.js'),
            swDest: 'service-worker.js',
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
          })
        );
      }

      return config;
    }
  }
};
