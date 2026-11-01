import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { defineConfig } from "vite";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

const squeeze = () => ({
  name: "inkling-squeeze",
  async generateBundle(options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== "chunk") continue;
      const out = await transform(chunk.code, { minify: true, target: "es2020", legalComments: "none" });
      chunk.code = out.code;
    }
  },
});

export default defineConfig({
  root: here("./demo"),
  server: {
    port: 5799,
    strictPort: true,
    fs: { allow: [here(".")] },
  },
  plugins: [squeeze()],
  build: {
    outDir: here("./dist"),
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
    minify: "esbuild",
    lib: {
      entry: here("./src/index.js"),
      name: "Inkling",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "inkling.mjs" : "inkling.js"),
    },
  },
});
