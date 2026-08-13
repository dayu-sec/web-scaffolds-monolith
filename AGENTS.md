# AGENTS.md

本文件记录当前单体 Web 脚手架的项目事实、核心工程约束、真实入口和协作边界。无论是否安装外部 Skill，当前项目都以本文件、配置和源码为准。

## Agent Skills

- 本项目不要求安装外部 Skill 才能开发或验证。
- 安装 DayuSec Web Skills 可补充 Web 项目发现、单体架构和工作流；若 Skill 指引与本项目事实不一致，始终以本文件及源码为准。

## 技术与命令

- Node.js `>=22.12.0`，包管理器 `pnpm@11.13.0`。
- 构建使用 Vite 8.1、React 19.2、TypeScript 6 严格模式；UI 基础层使用 Tailwind CSS 4、shadcn/ui `base-nova`、Base UI 与 Lucide。
- 表单默认使用 React Hook Form、Zod 与 `@hookform/resolvers`；shadcn `Field` 负责字段结构、错误状态和可访问性。
- `pnpm dev` 启动开发服务；`pnpm preview` 预览生产制品。
- `pnpm check` 运行 TypeScript 检查；`pnpm lint`、`pnpm format-check`、`pnpm test` 运行代码规范、格式和测试。
- `pnpm build` 执行 `tsc -b && vite build`。
- 路径别名：`@/* -> src/*`、`#/* -> mock/*`。

## 真实入口与所有权

- `src/main.tsx` 创建应用根并装配全局 Provider；`src/App.tsx` 组合应用级主题与路由上下文。
- `src/routes/index.tsx` 创建 Browser Router，`src/routes/fileRoutes.ts` 接入 `vite-plugin-pages` 生成的页面入口。
- `src/views/layout/index.ts` 是布局子系统的唯一外部入口；`components/MainLayout.tsx` 连接 Router 与 Shell，`components/ShellLayoutRoot.tsx` 保持 Shell 组件树稳定。
- `src/views/pages/` 为文件路由入口；`src/views/fallback/` 保存显式降级页面。
- `src/services/request.ts` 拥有默认请求实例，`src/configs/request.ts` 保存运行配置；`src/theme/index.ts` 为主题入口。
- `components.json` 是 shadcn CLI 契约；`src/components/ui/` 保存由当前项目拥有并可本地修改的基础组件源码，`src/lib/utils.ts` 提供统一 `cn()`。
- Shell 与布局不承载具体业务页面、业务表单或业务 Service；业务内容只通过稳定的路由出口进入内容区。

## 核心源码与命名约定

- `types`、`constants`、`configs`、`services` 和 `utils` 分别承载领域类型与契约、稳定字面量、运行配置组装、业务服务或外部数据边界、通用工具。
- `src/views/pages/` 只承载 URL 结构、参数适配、redirect、guard、loader、layout 和导航契约；请求、表单、状态、组件及样式等业务实现存放在 `src/views/components/` 等视图层。
- `src/views/layout/` 自治拥有 Shell 组件、布局 Context/Provider、Hooks、常量、运行时 Schema、类型、纯函数、样式和测试，并按对应源码职责分目录。
- 布局外部源码只从 `@/views/layout` 导入公开组件、Hook 和类型；内部路径不是公共契约，布局内部使用相对路径访问自身模块。
- 公共和跨文件布局类型集中在 `views/layout/types/`，组件私有 Props 与局部状态类型就近声明；`types/` 不包含运行时代码。
- 菜单配置读取、导航标准化与匹配服务、通用导航类型及 Shell 鉴权/恢复事件继续由现有公共层拥有，布局只消费这些契约。
- 基础组件优先消费 `background`、`foreground`、`primary`、`muted`、`border`、`ring`、`sidebar-*` 等语义 Token；业务代码不维护平行色板。
- 新增或更新 shadcn 组件前先检查 `components.json` 和已有源码；更新已修改组件时先运行 CLI dry-run/diff，不直接覆盖本地实现。
- 表单 Schema 是运行时校验与值类型的单一来源；使用 `z.infer` 推导类型，并同时设置字段的 `data-invalid` 与控件的 `aria-invalid`。
- **命名规范**：
  - React 组件目录、主文件 `.tsx` 及同名附属文件使用 PascalCase（例如 `<ComponentName>.tsx`、`<ComponentName>.module.css`）。
  - Hook 文件与导出统一使用 `useXxx`（例如 `useFeatureState.ts`）；非 Hook 模块不得使用 `use` 前缀。
  - Service、契约、类型、常量、配置、工具及一般模块使用小写 kebab-case。
  - 仅约束新建路径或明确重构，不批量重命名已有存量文件。
- 常规任务收敛在当前单体应用内，不预留微前端兼容分支。

## TypeScript 与实现基线

- 保持 TypeScript 严格模式，不降低严格度或批量禁用规则。
- 禁用 `any`；外部输入与未知错误由 `unknown` 起步，类型收窄后使用。
- 不新增 `enum` 或 `const enum`；仅需要类型集合时使用字面量联合，同时需要运行时值时使用 `as const` 对象并从值推导类型。
- 禁用双重断言、非空断言及 `@ts-ignore`；Promise 必须被等待、返回或明确处理。
- 复用已定义的类型契约与 SDK 类型，不在多处复制近似类型。

## 协作与安全

- 保留工作树中无关修改；不提交真实域名、私有地址、Token、密钥或个人敏感信息。
- 未经明确许可，不执行 Git commit/push、发布、部署或版本递增。

## 验证

- 源码与配置变更运行针对性检查命令（如 `pnpm check`）。
- 路由、Shell、全局 Provider、构建配置变更须运行 `pnpm build` 并验证 URL 直达、刷新与历史导航。
