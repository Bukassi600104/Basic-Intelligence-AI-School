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
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Strategic code-splitting to reduce bundle size
        manualChunks(id) {
          // Split vendor libraries into separate chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('radix-ui') || id.includes('lucide')) {
              return 'vendor-ui';
            }
            return 'vendor-common';
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
