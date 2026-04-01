/// <reference types="vite/client" />

// 声明 Vue 单文件组件的类型，让 TS 识别 .vue 文件
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
  // 如果需要导出自定义类型（如 Message），无需额外声明，TS 会自动解析
}
