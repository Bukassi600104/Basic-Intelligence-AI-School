import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for the application
  base: process.env.VITE_BASE_PATH || "/",
  
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
  
  plugins: [tsconfigPaths(), react(), tagger()],
  
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: true,
    // Removed restrictive allowedHosts to fix Vercel deployment MIME type errors
  },
});
