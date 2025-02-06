import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      "@": "./src",
    },
  },
  html: {
    title: "视频编辑器",
  },
});
