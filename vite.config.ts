import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: ".",
  server: {
    open: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    target: "esnext"
  }
});
