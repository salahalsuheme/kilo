import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const workspaceRoot = path.resolve(import.meta.dirname, "..", "..");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@workspace/api-client-react": path.resolve(
        workspaceRoot,
        "lib/api-client-react/src/index.ts",
      ),
      "@workspace/tenant-cache": path.resolve(
        workspaceRoot,
        "lib/tenant-cache/src/index.ts",
      ),
      "@workspace/customers-domain": path.resolve(
        workspaceRoot,
        "lib/customers-domain/src/index.ts",
      ),
      "@workspace/contracts-domain": path.resolve(
        workspaceRoot,
        "lib/contracts-domain/src/index.ts",
      ),
      "@workspace/notifications-domain": path.resolve(
        workspaceRoot,
        "lib/notifications-domain/src/index.ts",
      ),
      "@workspace/finance-domain": path.resolve(
        workspaceRoot,
        "lib/finance-domain/src/index.ts",
      ),
      "@workspace/invoices-domain": path.resolve(
        workspaceRoot,
        "lib/invoices-domain/src/index.ts",
      ),
      "@workspace/settings-domain": path.resolve(
        workspaceRoot,
        "lib/settings-domain/src/index.ts",
      ),
      "@workspace/vehicles-domain": path.resolve(
        workspaceRoot,
        "lib/vehicles-domain/src/index.ts",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5174,
    proxy: {
      "/api": { target: "http://localhost:8081", changeOrigin: true },
      "/uploads": { target: "http://localhost:8081", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
