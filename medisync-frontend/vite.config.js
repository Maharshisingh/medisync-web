// medisync-frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // This tells Vite to forward any request starting with /api to your backend
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? process.env.VITE_API_URL : 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));