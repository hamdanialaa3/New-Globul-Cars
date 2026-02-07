import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// CRA → Vite Migration (TASK-15)
// Migrated from craco.config.js (288 lines)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      nodePolyfills({
        // Node polyfills for browser (from craco config)
        globals: {
          Buffer: true,
          process: true,
        },
        protocolImports: true,
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
      port: parseInt(env.PORT || '3000', 10),
      host: env.HOST || 'localhost',
      open: false,
      
      // Cache control headers (from craco config)
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
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
    
    build: {
      outDir: 'build', // Match CRA output directory
      sourcemap: false, // Disabled for production security (from craco config)
      
      // Smart code splitting (from craco config splitChunks)
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React vendor bundle (including react-is to avoid circular deps with styled-components)
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom') ||
                id.includes('node_modules/react-is')) {
              return 'vendor-react';
            }
            
            // Firebase vendor bundle
            if (id.includes('node_modules/@firebase') || 
                id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            
            // UI libraries vendor bundle (styled-components imports react-is from vendor-react)
            if (id.includes('node_modules/@mui') ||
                id.includes('node_modules/styled-components') ||
                id.includes('node_modules/framer-motion') ||
                id.includes('node_modules/lucide-react')) {
              return 'vendor-ui';
            }
            
            // Other node_modules
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
      include: ['react', 'react-dom', 'react-is', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
      esbuildOptions: {
        target: 'es2017', // Match craco config
      },
    },
  };
});