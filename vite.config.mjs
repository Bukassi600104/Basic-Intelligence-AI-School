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
    rollupOptions: {
      output: {
        // ⚠️ CRITICAL FIX: Minimal code-splitting
        // 
        // PROBLEM: Any node_modules split separately try to import React before it loads
        // SOLUTION: Only split page/feature chunks, keep all dependencies with main entry
        //
        // This ensures: React + all its dependencies load first, then route chunks load
        
        manualChunks(id) {
          // ONLY split page/feature routes - NOT libraries
          // All libraries stay bundled with main entry to guarantee React availability
          
          // Split admin pages
          if (id.includes('src/pages/admin-')) {
            const match = id.match(/admin-([a-z-]+)/);
            if (match) {
              return `admin-${match[1]}`;
            }
            return 'admin-pages';
          }
          
          // Split student pages
          if (id.includes('src/pages/student-dashboard')) {
            return 'student-pages';
          }
          
          // Split auth pages
          if (id.includes('src/pages/auth')) {
            return 'auth-pages';
          }
          
          // Split services - but they also need React from main entry
          if (id.includes('src/services')) {
            return 'services';
          }
          
          // Split contexts
          if (id.includes('src/contexts')) {
            return 'contexts';
          }
          
          // ALL node_modules (React, Radix, Supabase, Charts, etc.) stay in main entry
          // This is the KEY FIX - no separate vendor chunks
          // Return undefined = stay in main entry
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

