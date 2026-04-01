import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // server: {
  //   proxy: {
  //     // 匹配以 /api/ai 开头的请求，转发到目标接口
  //     "/api/ai": {
  //       target: "https://ark.cn-beijing.volces.com/api/v3",
  //       changeOrigin: true, // 关键：修改请求头的 Origin 为目标域名
  //       rewrite: (path) => path.replace(/^\/api\/ai/, "/responses"), // 重写路径
  //       headers: {
  //         // 可选：如果需要传递额外头
  //         "Access-Control-Allow-Origin": "*",
  //       },
  //     },
  //   },
  // },
});
