// Minimal CRACO configuration to avoid previous complex plugin errors
const path = require('path');
const webpack = require('webpack');

module.exports = {
  eslint: { enable: false },
  webpack: {
    configure: (config) => {
      console.log('🔧 CRACO: Configuring webpack...');
      
      // Disable minification in production to ease debugging
      if (config.mode === 'production') {
        config.optimization.minimize = false;
      }
      
      // CRITICAL: Remove CRA's ModuleScopePlugin to allow monorepo imports
      if (config.resolve && config.resolve.plugins) {
        config.resolve.plugins = config.resolve.plugins.filter(
          plugin => plugin.constructor.name !== 'ModuleScopePlugin'
        );
        console.log('✅ Removed ModuleScopePlugin');
      }
      
      // Also remove ESLint and TypeScript checker plugins
      if (config.plugins) {
        config.plugins = config.plugins.filter(p => {
          const name = p.constructor?.name;
          return name !== 'ESLintWebpackPlugin' 
            && name !== 'ForkTsCheckerWebpackPlugin';
        });
      }

      // Monorepo package aliases - ONLY for @globul-cars/* packages
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
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
        })
      );

      console.log('✅ CRACO: Webpack configuration complete');
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
