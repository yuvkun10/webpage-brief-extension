import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: "popup.html"
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
