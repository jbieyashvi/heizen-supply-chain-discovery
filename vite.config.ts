import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// GitHub Pages serves this project from a repository subpath.
const BASE = "/heizen-supply-chain-discovery/";

/**
 * SPA fallback for GitHub Pages: copy the built index.html to 404.html.
 * Pages serves 404.html for any unknown path while preserving the URL, so the
 * SPA boots and React Router resolves the deep link. Keeps clean BrowserRouter
 * URLs working on hard refresh / shared deep links.
 */
function spa404Fallback(): Plugin {
  return {
    name: "spa-404-fallback",
    apply: "build",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      const index = resolve(dist, "index.html");
      if (existsSync(index)) {
        copyFileSync(index, resolve(dist, "404.html"));
      }
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), spa404Fallback()],
  server: {
    port: 5173,
    host: true,
  },
});
