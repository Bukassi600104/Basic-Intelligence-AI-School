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
        // Simpler chunking strategy - let Vite handle it automatically
        manualChunks: undefined,
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
