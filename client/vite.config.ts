import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const useHttps = mode === "development" && process.env.VITE_DEV_HTTPS === "true";
  const httpsConfig = useHttps
    ? {
        key: fs.readFileSync("./cert/key.pem"),
        cert: fs.readFileSync("./cert/cert.pem"),
      }
    : undefined;

  return {
  clearScreen: false,
  server: {
    https: httpsConfig,
    host: "::",
    port: 8080,
    strictPort: true,
    allowedHosts: [
      "86a28b8a-1703-4911-ac0d-b2499663ab17.lovableproject.com",
      "all",
    ],

    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: [
    "VITE_",
    "TAURI_PLATFORM",
    "TAURI_ARCH",
    "TAURI_FAMILY",
    "TAURI_PLATFORM_VERSION",
    "TAURI_PLATFORM_TYPE",
    "TAURI_DEBUG",
  ],
  plugins: [tailwindcss(), react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  };
});
