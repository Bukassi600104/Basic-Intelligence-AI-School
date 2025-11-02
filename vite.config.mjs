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
        // Strategic code-splitting to reduce bundle size
        manualChunks(id) {
          // ⚠️ CRITICAL: React MUST NOT be split into a separate chunk
          // If React is in a separate chunk, it won't load before the main entry
          // So keep React inline with the main entry bundle
          
          if (id.includes('node_modules')) {
            // Radix UI components depend on React
            if (id.includes('radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Charts depend on React
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Supabase
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            // Redux and utilities
            if (id.includes('redux') || id.includes('immer')) {
              return 'vendor-common';
            }
          }
          
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
          
          // Split services into their own chunk
          if (id.includes('src/services')) {
            return 'services';
          }
          
          // Split contexts
          if (id.includes('src/contexts')) {
            return 'contexts';
          }
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

