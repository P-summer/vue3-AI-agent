# vue3-ai-agent

基于 Vue3 + TypeScript + Element Plus 构建的 AI 对话前端项目，主要对接后端接口实现 AI 对话交互、会话管理、用户鉴权等核心能力，整体前端逻辑轻量化，聚焦于与后端的交互和用户交互体验。

## 核心特性

### 🔐 用户鉴权

- 支持用户注册、登录、退出登录等基础鉴权功能
- 基于后端接口完成身份验证与状态管理

### 🤖 AI 对话能力

- 支持选择不同 AI 模型进行对话
- 对话内容实时渲染，对接后端完成消息收发

### 📋 会话管理

- 新增/删除会话窗口，支持修改会话窗口名称
- 会话排序：最后一次交互的会话窗口自动置顶
- 智能命名：根据首次对话的内容自动生成会话窗口名称（后端驱动）

## 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0（需满足 `package.json` 中 engines 约束）
- **包管理器**: pnpm（推荐，也可兼容 npm/yarn）

## 安装与运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发环境

```bash
pnpm dev
```

启动后默认会在本地启动开发服务器（通常为 `http://localhost:5173`），可直接访问预览。

### 3. 构建生产包

```bash
pnpm build
```

构建产物输出到 `dist` 目录，可部署至静态服务器。

### 4. 预览构建产物

```bash
pnpm preview
```

本地预览构建后的生产包效果。

### 5. 代码格式化

```bash
pnpm format
```

使用 `oxfmt` 格式化 `src` 目录下的代码，保持代码风格统一。

### 6. 类型检查

```bash
pnpm type-check
```

通过 `vue-tsc` 检查 TypeScript 类型错误，避免类型问题。

## 脚本说明

| 脚本名       | 功能说明                                  |
| ------------ | ----------------------------------------- |
| `dev`        | 启动 Vite 开发服务器，支持热更新          |
| `build`      | 先执行类型检查，再执行生产构建            |
| `preview`    | 预览生产构建后的产物                      |
| `build-only` | 仅执行 Vite 生产构建（不先做类型检查）    |
| `type-check` | 使用 vue-tsc 进行项目 TypeScript 类型校验 |
| `format`     | 使用 oxfmt 格式化 src 目录下的代码        |

## 技术栈

### 核心框架

- Vue 3.5+（组合式 API、Script Setup）
- TypeScript ~5.9.3（类型安全）
- Vite（构建工具，beta 版本）

### UI 组件

- Element Plus 2.13+（组件库）
- @element-plus/icons-vue（图标库）

### 状态管理 & 路由

- Pinia 3.0+（轻量状态管理）
- Vue Router 5.0+（路由管理）

### 工具类

- Axios 1.13+（HTTP 请求库，对接后端接口）
- marked 17.0+（Markdown 渲染，用于 AI 对话内容展示）
- uuid 13.0+（生成唯一标识，用于会话管理）

### 开发工具

- vue-tsc（Vue + TS 类型检查）
- oxfmt（代码格式化）
- npm-run-all2（多脚本并行执行）
- vite-plugin-vue-devtools（Vue 开发者工具增强）

## 注意事项

- 项目核心逻辑（如会话命名、模型切换、会话排序等）依赖后端接口实现，需确保后端服务正常运行并配置正确的接口地址
- 需严格遵守 Node.js 版本约束，避免因版本不一致导致依赖安装或运行异常
- 开发环境下可通过 Vite 开发者工具（vite-plugin-vue-devtools）调试项目
