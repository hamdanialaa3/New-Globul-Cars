// Minimal CRACO configuration to avoid previous complex plugin errors
const path = require('path');
const webpack = require('webpack');

module.exports = {
  eslint: { enable: false },
  style: {
    postcss: {
      mode: 'file',
    },
  },
  // Ensure dev server sends no-cache headers to avoid stale assets in browsers
  devServer: (devServerConfig) => {
    // Set port explicitly (default is 3000, but can be overridden by PORT env var)
    devServerConfig.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    devServerConfig.host = process.env.HOST || 'localhost';
    devServerConfig.allowedHosts = 'all';
    
    devServerConfig.headers = {
      ...(devServerConfig.headers || {}),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"`,
    };
    // Disable compression to make rebuilds more predictable in dev
    devServerConfig.compress = false;
    // Hot reload with aggressive cache invalidation
    devServerConfig.hot = true;
    devServerConfig.liveReload = true;
    // Ensure file watching remains active and responsive
    devServerConfig.watchFiles = {
      paths: ['src/**/*', 'public/**/*'],
      options: { usePolling: false, interval: 100, ignored: ['**/node_modules/**'] },
    };
    // Ensure publicPath matches the port
    devServerConfig.historyApiFallback = true;
    return devServerConfig;
  },
  webpack: {
    configure: (config) => {
      console.log('CRACO: Configuring webpack...');

      // Add cache busting in development
      if (config.mode === 'development') {
        // Disable webpack caching completely in development
        config.cache = false;
        
        // Ensure output files have unique names to prevent browser caching
        if (config.output) {
          // Use contenthash for cache busting
          const originalFilename = config.output.filename || 'static/js/[name].js';
          const originalChunkFilename = config.output.chunkFilename || 'static/js/[name].chunk.js';
          
          // Only add hash if not already present
          if (!originalFilename.includes('[contenthash]') && !originalFilename.includes('[hash]')) {
            config.output.filename = originalFilename.replace('[name]', '[name].[contenthash:8]');
          }
          if (!originalChunkFilename.includes('[contenthash]') && !originalChunkFilename.includes('[hash]')) {
            config.output.chunkFilename = originalChunkFilename.replace('[name]', '[name].[contenthash:8]');
          }
        }
      }

      // Disable minification in production to ease debugging
      if (config.mode === 'production') {
        config.optimization.minimize = false;
      }

      // CRITICAL: Remove CRA's ModuleScopePlugin to allow monorepo imports
      if (config.resolve && config.resolve.plugins) {
        config.resolve.plugins = config.resolve.plugins.filter(
          plugin => plugin.constructor.name !== 'ModuleScopePlugin'
        );
        console.log('CRACO: Removed ModuleScopePlugin');
      }

      // Also remove ESLint and TypeScript checker plugins
      if (config.plugins) {
        config.plugins = config.plugins.filter(p => {
          const name = p.constructor?.name;
          return name !== 'ESLintWebpackPlugin'
            && name !== 'ForkTsCheckerWebpackPlugin';
        });
      }

      // Aliases
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // App src alias to support imports like '@/services/...'
        '@': path.resolve(__dirname, 'src'),
        // DO NOT add '@' alias here - it conflicts with ts config baseUrl
        '@globul-cars/core': path.resolve(__dirname, '../packages/core/src'),
        '@globul-cars/ui': path.resolve(__dirname, '../packages/ui/src'),
        '@globul-cars/auth': path.resolve(__dirname, '../packages/auth/src'),
        '@globul-cars/cars': path.resolve(__dirname, '../packages/cars/src'),
        '@globul-cars/profile': path.resolve(__dirname, '../packages/profile/src'),
        '@globul-cars/messaging': path.resolve(__dirname, '../packages/messaging/src'),
        '@globul-cars/social': path.resolve(__dirname, '../packages/social/src'),
        '@globul-cars/admin': path.resolve(__dirname, '../packages/admin/src'),
        '@globul-cars/payments': path.resolve(__dirname, '../packages/payments/src'),
        '@globul-cars/iot': path.resolve(__dirname, '../packages/iot/src'),
        '@globul-cars/services': path.resolve(__dirname, '../packages/services/src'),
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
          util: 'util'
        })
      );

      console.log('CRACO: Webpack configuration complete');
      return config;
    }
  },
  // Professional Jest configuration override to ensure path aliases work
  jest: {
    configure: (jestConfig) => {
      // Ensure moduleNameMapper is properly configured
      jestConfig.moduleNameMapper = {
        // d3 mock FIRST to prevent ES module parsing
        '^d3$': '<rootDir>/src/__mocks__/d3Mock.js',

        // TypeScript path aliases (must match tsconfig.json)
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
        '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@/firebase/(.*)$': '<rootDir>/src/firebase/$1',
        '^@/data/(.*)$': '<rootDir>/src/data/$1',
        '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@/features/(.*)$': '<rootDir>/src/features/$1',
        '^@/assets/(.*)$': '<rootDir>/src/assets/$1',

        // Monorepo packages
        '^@globul-cars/core$': '<rootDir>/packages/core/src/index',
        '^@globul-cars/core/(.*)$': '<rootDir>/packages/core/src/$1',
        '^@globul-cars/services$': '<rootDir>/packages/services/src/index',
        '^@globul-cars/services/(.*)$': '<rootDir>/packages/services/src/$1',

        // Generic fallback (MUST be last among @/ patterns)
        '^@/(.*)$': '<rootDir>/src/$1',

        // Keep existing CRA patterns
        ...Object.fromEntries(
          Object.entries(jestConfig.moduleNameMapper || {}).filter(
            ([key]) => !key.startsWith('^@/')
          )
        ),
      };

      return jestConfig;
    }
  }
};
