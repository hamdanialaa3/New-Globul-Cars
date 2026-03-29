/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';

// CRA → Vite Migration (TASK-15)
// Migrated from craco.config.js (288 lines)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  return {
    // Inject Buffer and process globals directly — no vite-plugin-node-polyfills
    // needed (avoids elliptic transitive dep, GHSA-848j-6mx2-7j84).
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env': '{}',
    },

    plugins: [
      react(),
      // Gzip compression for production builds
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files > 1KB
      }),
      // Brotli compression for modern browsers
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),
    ],

    resolve: {
      alias: {
        // App src alias (from craco config)
        '@': path.resolve(__dirname, './src'),

        // Monorepo packages (from craco config)
        '@globul-cars/core': path.resolve(__dirname, '../packages/core/src'),
        '@globul-cars/ui': path.resolve(__dirname, '../packages/ui/src'),
        '@globul-cars/auth': path.resolve(__dirname, '../packages/auth/src'),
        '@globul-cars/cars': path.resolve(__dirname, '../packages/cars/src'),
        '@globul-cars/profile': path.resolve(
          __dirname,
          '../packages/profile/src'
        ),
        '@globul-cars/messaging': path.resolve(
          __dirname,
          '../packages/messaging/src'
        ),
        '@globul-cars/social': path.resolve(
          __dirname,
          '../packages/social/src'
        ),
        '@globul-cars/admin': path.resolve(__dirname, '../packages/admin/src'),
        '@globul-cars/payments': path.resolve(
          __dirname,
          '../packages/payments/src'
        ),
        '@globul-cars/iot': path.resolve(__dirname, '../packages/iot/src'),
        '@globul-cars/services': path.resolve(
          __dirname,
          '../packages/services/src'
        ),

        // Node polyfills (from craco config)
        'process/browser': 'process/browser',
        process: 'process/browser',
        buffer: 'buffer',
        stream: 'stream-browserify',
        util: 'util',
      },
    },

    server: {
      port: parseInt(env.PORT || '5173', 10),
      host: env.HOST || 'localhost',
      open: false,
      strictPort: false, // 🔧 جرب بورت آخر إذا كان المطلوب مشغول

      // Cache control headers (from craco config)
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        'Surrogate-Control': 'no-store',
        ...securityHeaders,
      },

      // HMR configuration
      hmr: {
        overlay: false,
      },

      // File watching (from craco config)
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/build/**',
          '**/logs/**',
          '**/docs/**',
          '**/ARCHIVE/**',
          '**/scripts/**',
        ],
      },
    },

    preview: {
      headers: {
        ...securityHeaders,
      },
    },

    build: {
      outDir: 'build', // Match CRA output directory
      sourcemap: false, // Disabled for production security (from craco config)

      // Code splitting: only separate Firebase (large & independent)
      // All other node_modules stay in one bundle to avoid circular deps
      rollupOptions: {
        output: {
          manualChunks: id => {
            // Firebase vendor bundle (1MB+, clearly independent)
            if (
              id.includes('node_modules/@firebase') ||
              id.includes('node_modules/firebase')
            ) {
              return 'vendor-firebase';
            }

            // Framer Motion (large animation library, ~150KB)
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-animations';
            }

            // Algolia search (loaded only on search pages)
            if (
              id.includes('node_modules/algoliasearch') ||
              id.includes('node_modules/@algolia') ||
              id.includes('node_modules/react-instantsearch')
            ) {
              return 'vendor-algolia';
            }

            // Stripe (loaded only on payment pages)
            if (id.includes('node_modules/@stripe')) {
              return 'vendor-stripe';
            }

            // PDF generation (loaded only when generating documents)
            if (
              id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas')
            ) {
              return 'vendor-pdf';
            }

            // Chart/visualization libs
            if (
              id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3')
            ) {
              return 'vendor-charts';
            }

            // All other node_modules in one bundle
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },

          // Add timestamp for cache busting (from craco config)
          chunkFileNames: `assets/[name].[hash].${Date.now().toString(36)}.js`,
          entryFileNames: `assets/[name].[hash].${Date.now().toString(36)}.js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },

      // Chunk size warnings (from craco config maxSize: 244000)
      chunkSizeWarningLimit: 244,
    },

    // Environment variable prefix (CRA uses REACT_APP_*, Vite uses VITE_*)
    envPrefix: 'VITE_',

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-is',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'framer-motion',
      ],
      esbuildOptions: {
        target: 'es2017', // Match craco config
      },
    },

    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [
        './src/vitest-setup.ts',
        './src/globalSetup.js',
        './src/setupTests.ts',
        './src/setupTestsAfterEnv.js',
      ],
      include: [
        'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
        'src/**/*.{spec,test}.{ts,tsx,js,jsx}',
      ],
      alias: {
        '@jest/globals': path.resolve(
          __dirname,
          'src/__mocks__/jest-globals-shim.ts'
        ),
      },
    },
  };
});
