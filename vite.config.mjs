import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for the application
  base: process.env.VITE_BASE_PATH || "/",
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    // Disable Rollup's default code splitting to prevent vendor chunks
    // This is critical: vendor chunks loading before React causes "forwardRef is undefined" error
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        // ⚠️ CRITICAL FIX: Prevent React initialization race condition
        // 
        // PROBLEM: If any node_modules chunk loads BEFORE React, components fail with:
        //         "Cannot read properties of undefined (reading 'forwardRef')"
        // 
        // SOLUTION: Bundle EVERYTHING into main entry
        //          - React core stays in main
        //          - All node_modules stay in main
        //          - Only split page routes that depend on main loading first
        
        manualChunks(id) {
          // Never split node_modules - force into main entry
          if (id.includes('node_modules')) {
            return;  // undefined = main entry
          }
          
          // Only split our own code for page routes
          // Everything stays in main unless explicitly listed here
          if (id.includes('src/pages/admin-dashboard')) {
            return 'admin-dashboard';
          }
          if (id.includes('src/pages/admin-users')) {
            return 'admin-users';
          }
          if (id.includes('src/pages/admin-courses')) {
            return 'admin-courses';
          }
          if (id.includes('src/pages/admin-content')) {
            return 'admin-content';
          }
          if (id.includes('src/pages/admin-analytics')) {
            return 'admin-analytics';
          }
          if (id.includes('src/pages/admin-notifications')) {
            return 'admin-notifications';
          }
          if (id.includes('src/pages/admin-reviews')) {
            return 'admin-reviews';
          }
          if (id.includes('src/pages/admin-settings')) {
            return 'admin-settings';
          }
          if (id.includes('src/pages/admin-notification-wizard')) {
            return 'admin-notification-wizard';
          }
          if (id.includes('src/pages/student-dashboard')) {
            return 'student-pages';
          }
          if (id.includes('src/pages/auth')) {
            return 'auth-pages';
          }
          
          // Services and everything else stays in main
          // This is the KEY - no separate vendor chunks, everything loads with main
        },
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
      },
    },
  },
  
  plugins: [
    tsconfigPaths(), 
    react({
      // Enable automatic JSX runtime
      jsxRuntime: 'automatic',
      // Fast refresh for better DX
      fastRefresh: true,
    }), 
    tagger()
  ],
  
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
  
  preview: {
    cors: true,
  },
});

