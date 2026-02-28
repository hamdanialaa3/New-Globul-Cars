import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import compression from 'vite-plugin-compression';

// CRA → Vite Migration (TASK-15)
// Migrated from craco.config.js (288 lines)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['babel-plugin-styled-components', {
              displayName: process.env.NODE_ENV !== 'production',
              fileName: false,
              pure: true,
            }],
          ],
        },
      }),
      nodePolyfills({
        // Node polyfills for browser (from craco config)
        globals: {
          Buffer: true,
          process: true,
        },
        protocolImports: true,
      }),
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
        '@globul-cars/profile': path.resolve(__dirname, '../packages/profile/src'),
        '@globul-cars/messaging': path.resolve(__dirname, '../packages/messaging/src'),
        '@globul-cars/social': path.resolve(__dirname, '../packages/social/src'),
        '@globul-cars/admin': path.resolve(__dirname, '../packages/admin/src'),
        '@globul-cars/payments': path.resolve(__dirname, '../packages/payments/src'),
        '@globul-cars/iot': path.resolve(__dirname, '../packages/iot/src'),
        '@globul-cars/services': path.resolve(__dirname, '../packages/services/src'),

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
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
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
      target: 'es2020', // Modern target - smaller output
      minify: 'esbuild', // Fast, modern minification

      // Code splitting: granular chunks for better caching & smaller initial load
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Firebase vendor bundle (1MB+, clearly independent)
            if (id.includes('node_modules/@firebase') ||
              id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }

            // React core - rarely changes, cache separately
            if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-is') ||
              id.includes('node_modules/scheduler')) {
              return 'vendor-react';
            }

            // Router - loaded on every page
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }

            // Styled-components - used everywhere
            if (id.includes('node_modules/styled-components') ||
              id.includes('node_modules/stylis')) {
              return 'vendor-styled';
            }

            // Framer Motion - animation library (large)
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-framer';
            }

            // MUI (Material UI) - large, used selectively
            if (id.includes('node_modules/@mui') ||
              id.includes('node_modules/@emotion')) {
              return 'vendor-mui';
            }

            // Algolia search
            if (id.includes('node_modules/algoliasearch') ||
              id.includes('node_modules/@algolia')) {
              return 'vendor-algolia';
            }

            // Sentry error tracking
            if (id.includes('node_modules/@sentry')) {
              return 'vendor-sentry';
            }

            // Stripe payments
            if (id.includes('node_modules/@stripe')) {
              return 'vendor-stripe';
            }

            // Charts (recharts + d3) — kept in vendor bundle to avoid
            // d3 ESM circular-dep / init-order crash in separate chunks:
            // "Uncaught TypeError: undefined is not a function" vendor-charts.js

            // Maps (leaflet) — only used on map pages
            if (id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet')) {
              return 'vendor-maps';
            }

            // Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }

            // All other node_modules in one bundle
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },

          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
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
        'react', 'react-dom', 'react-is',
        'firebase/app', 'firebase/auth', 'firebase/firestore',
        'framer-motion',
        // recharts 3.x uses ESM d3 modules; pre-bundle to avoid
        // "undefined is not a function" in production chunks
        'recharts',
        'd3-scale', 'd3-shape', 'd3-path', 'd3-color',
        'd3-interpolate', 'd3-time', 'd3-time-format', 'd3-array',
        'd3-format', 'd3-ease',
      ],
      esbuildOptions: {
        target: 'es2020', // Modern browsers - smaller output, no legacy transforms
      },
    },

    // Modern target for smaller output
    esbuild: {
      target: 'es2020',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});