import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    // port: 3002,
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  //   server: {
  //   port: 3002,
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:3001",
  //       changeOrigin: true,
  //     },
  //   },
  // },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
