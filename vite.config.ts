import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Reduce render-blocking CSS by preloading the stylesheet
    // and switching rel after it finishes loading.
    {
      name: "async-stylesheet-links",
      apply: "build",
      transformIndexHtml(html) {
        return html.replace(
          /<link\s+rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*?)>/g,
          (_m, preAttrs: string, href: string, postAttrs: string) =>
            [
              `<link rel="preload" as="style"${preAttrs}href="${href}"${postAttrs} onload="this.onload=null;this.rel='stylesheet'">`,
              `<noscript><link rel="stylesheet"${preAttrs}href="${href}"${postAttrs}></noscript>`,
            ].join("")
        );
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
  },
}));
