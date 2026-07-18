import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const labRoot = fileURLToPath(new URL(".", import.meta.url));
const dependencies = resolve(labRoot, "node_modules");

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@xyflow\/react$/, replacement: resolve(dependencies, "@xyflow/react/dist/esm/index.mjs") },
      { find: /^@xyflow\/react\/dist\/style\.css$/, replacement: resolve(dependencies, "@xyflow/react/dist/style.css") },
      { find: /^@nivo\/(.*)$/, replacement: resolve(dependencies, "@nivo/$1") },
      { find: /^dagre$/, replacement: resolve(dependencies, "dagre/index.js") },
      { find: /^framer-motion$/, replacement: resolve(dependencies, "framer-motion/dist/es/index.mjs") },
      { find: /^react$/, replacement: resolve(dependencies, "react/index.js") },
      { find: /^react-dom$/, replacement: resolve(dependencies, "react-dom/index.js") },
      { find: /^react-dom\/client$/, replacement: resolve(dependencies, "react-dom/client.js") }
    ],
    dedupe: ["react", "react-dom", "@xyflow/react"]
  },
  build: {
    outDir: resolve(labRoot, "../../assets/embeds/widget-foundry"),
    emptyOutDir: true,
    sourcemap: false
  }
});
