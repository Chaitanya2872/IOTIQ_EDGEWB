import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    chunkSizeWarningLimit: 1200, // optional – increase to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Split large dependencies into separate chunks
          react: ["react", "react-dom", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          charts: ["recharts"],
          utils: ["axios", "dayjs"],
          others: ["xlsx", "papaparse"],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({ preset: "default" }),
      ],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "dayjs",
    ],
  },
});
