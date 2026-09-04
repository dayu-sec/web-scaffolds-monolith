# AGENTS.md

本文件记录当前 pnpm Monorepo 单体 Web 脚手架的项目事实、核心工程约束、真实入口和协作边界。无论是否安装外部 Skill，当前项目都以本文件、配置和源码为准。

本脚手架面向**外部客户与终端用户**的客户端产品，不面向内部运营后台或高密度管理控制台。设计、实现或评审任何界面前，必须先阅读 [客户端产品 UI 基线](docs/client-facing-ui-baseline.md)。

## Agent 上下文与 Skills

- 本文件是本项目 AI 协作约束的唯一来源。根目录的 `CLAUDE.md`、`GEMINI.md` 等厂商入口文件，以及 `.github/`、`.clinerules/`、`.kiro/`、`.roo/` 等厂商目录下的入口文件，只负责把对应工具引导到本文件与 Skill 目录，不承载项目规则。修改协作约束只改本文件，不要复制或同步到那些入口文件；各文件对应哪个工具见 [AI 工具上下文入口](docs/ai-agent-entrypoints.md)。
- 本项目不要求安装外部 Skill 才能开发或验证。
- 安装外部 Skill 后，可按当前任务选择已安装且适用的能力补充项目发现、架构边界、源码结构或专用工作流；不因安装某个 Skill 改变本项目的技术栈、所有权或验证要求。若 Skill 指引与本项目事实不一致，始终以本文件、配置和源码为准。
- 已安装的 Skill 位于 `.agents/skills/<name>/SKILL.md`；先按 frontmatter `description` 匹配当前任务，再读取正文与 `references/`，不要凭名称猜测适用范围。

## 技术与命令

- Node.js `>=24`，包管理器 `pnpm@11`。
- 构建使用 Vite 8.1、React 19.2、TypeScript 6 严格模式；UI 基础层使用 Tailwind CSS 4、shadcn/ui `base-nova`、Base UI 与 Lucide。
- 表单默认使用 React Hook Form、Zod 与 `@hookform/resolvers`；shadcn `Field` 负责字段结构、错误状态和可访问性。
- `pnpm dev` 启动开发服务，默认不加载 Mock；`pnpm dev:mock` 显式开启 Mock 服务；`pnpm preview` 预览生产制品。
- `pnpm check` 运行 TypeScript 检查；`pnpm lint`、`pnpm format-check`、`pnpm test` 运行代码规范、格式和测试。
- 代码规范与格式由 oxlint 与 oxfmt 单一拥有：规则只写在 `.oxlintrc.json`，格式只写在 `.oxfmtrc.json`。项目不安装 ESLint、Prettier 及其插件，也不新增第二套规范配置。
- 导入排序与 Tailwind class 排序属于格式，由 oxfmt 的 `sortImports`、`sortTailwindcss` 负责，不由 lint 规则表达；类型感知规则由 `oxlint-tsgolint` 提供，`.oxlintrc.json` 的 `options.typeAware` 是唯一开关。
- `packages/ui/src/components/**` 与 `packages/ui/src/hooks/**` 作为只读物料，在 `.oxlintrc.json` 的 overrides 中豁免；关闭任何其他规则都要在配置里写明原因。
- `pnpm build` 从根目录构建唯一应用并输出到根 `dist/`。
- 应用路径别名：`@/* -> apps/web/src/*`、`#/* -> apps/web/mock/*`；UI 公共入口为 `@workspace/ui/*`。

## 真实入口与所有权

- `apps/web` 是唯一部署和运行单元；`packages/ui` 是随项目维护的私有源码 workspace，不发布为共享 npm 组件库。
- `apps/web/src/main.tsx` 创建应用根并装配全局 Provider；`apps/web/src/App.tsx` 组合应用级主题与路由上下文。
- `apps/web/src/routes/index.tsx` 创建 Browser Router，`fileRoutes.ts` 接入 `vite-plugin-pages` 生成的页面入口。
- `apps/web/src/views/layout/index.ts` 是布局子系统的唯一外部入口；`components/MainLayout.tsx` 连接 Router 与 Shell，`components/ShellLayoutRoot.tsx` 保持 Shell 组件树稳定。
- `apps/web/src/views/pages/` 为文件路由入口；`apps/web/src/views/fallback/` 保存显式降级页面。
- `apps/web/src/services/request.ts` 拥有默认请求实例，`configs/request.ts` 保存运行配置；`theme/index.ts` 为主题入口。
- `apps/web/components.json` 与 `packages/ui/components.json` 共同定义 shadcn CLI 契约；`packages/ui/src/components/` 中引入的社区组件视为只读物料，不改源码、不补兼容 Props、不包装成另一套本地组件库，`packages/ui/src/lib/utils.ts` 提供唯一 `cn()`。
- Shell 与布局不承载具体业务页面、业务表单或业务 Service；业务内容只通过稳定的路由出口进入内容区。

## API 请求迁移基线

- 实现或评审业务 Service、请求配置、请求初始化、OpenAPI SDK 适配、Vite 开发代理、API 环境变量或本地 Mock 前，必须先阅读 [API 请求迁移基线](docs/api-request-baseline.md)。该文档定义当前项目的请求所有权、迁移历史和验证边界。
- 请求实例、SDK/OpenAPI、错误与 Query 使用对应的前端请求与数据契约工作流；Mock 使用项目现有 Mock 工作流。不得只依据通用规则或遗留实现推断当前项目的 API 路径、代理、Mock 前缀或请求实例。
- 浏览器 API 根由 `apps/web/src/constants/api.ts` 的 `API_BASE_PATH` 唯一拥有；业务 Service 只声明 API 根之后的相对路径。本地联调路由只在 `apps/web/proxy.local.jsonc` 中配置，不得为使旧实现或旧测试继续通过而保留独立浏览器基址、业务专属环境变量或第二请求实例。
- `README.md` 及其他项目文档只描述机制、入口和唯一来源，不罗列具体服务名、端口、context path、网关命名空间等随项目演进漂移的事实。需要这些信息时读取 `apps/web/proxy.local.jsonc.example`、`proxy.schema.json`、`apps/web/src/constants/api.ts` 与业务源码——源码是真相。补充文档时同样遵守这条，不要把探索得到的具体值写回文档。

## 开发期网关与浏览器诊断

- 当前脚手架的应用从 `apps/web` 运行。本地开发 1~N 个服务时，基于 `apps/web/proxy.local.jsonc.example` 创建 Git 忽略的 `apps/web/proxy.local.jsonc`，它是开发者唯一的本地配置入口，也是源码唯一读取的文件，按 `proxy.schema.json` 声明 `"server.port"`、`"mock"`、`"server.proxy.token"` 和 `"server.proxy.api"`；格式固定为 JSONC，允许注释和尾随逗号。文件名的 `proxy.` 前缀是历史沿革，不限定它只配置代理。
- 本地配置只解析不校验：配置项由 `proxy.schema.json` 在编辑期约束，取值错误由下游自行抛出，解析层不做兼容也不兜底。新增字段同时更新 `proxy.ts` 的类型、`proxy.schema.json` 与示例文件。
- `"server.proxy.token"` 是共享 Bearer Token，默认发给全部代理规则；优先级为规则 `headers.Authorization` > 规则 `token` > 共享 Token > `DEV_API_TOKEN`，声明即终结，空白值表示显式关闭。启动摘要只标注 Authorization 来源，不输出 Token 值。
- `.env.development.local` 是弱化保留的官方兜底，日常开发不需要创建；`DEV_SERVER_PORT`、`DEV_API_URL`、`DEV_API_TOKEN`、`DEV_MOCK` 仅供 Vite 进程读取。取值类以本地配置文件为准，开关类的 Mock 是「或」语义——三个开关任一为开即开启。影响构建产物或进入浏览器的变量（如 `VITE_APP_BASE`）留在 `VITE_*` 机制。不得把真实地址、Token 或证书写入源码、示例文件、项目文档或提交物。
- 开发代理由 `apps/web/proxy.ts` 的 `getProxyConfig()` 统一管理：本地规则按路径 key 长度从长到短装配；没有本地 API 根规则时，才追加由 `${API_BASE_PATH}/` 派生的网关规则。大多数服务完整透传请求路径，只有目标服务不接收完整路径时才配置正则 rewrite。
- 本地代理文件变化后 Vite 自动重启。启动日志按实际匹配顺序列出全部 API 代理的路径 key 与脱敏 target origin，不区分本地、线上或兜底用途；没有任何代理规则时提示未配置 API 网关。
- 使用浏览器诊断时，若当前环境已登记独立 DevTools MCP，则以其自身配置决定可用浏览器、通道和连接方式。先确认目标页面，再检查 API 响应状态、内容类型、响应体及 `X-Dev-Proxy-Target`、`X-Dev-Proxy-Rule`；不得在交付内容、日志摘要或文档中泄露认证头、Token、Cookie 或其他会话数据。
- 完成代理配置或诊断后，重载目标页并验证关键 API 响应和控制台初始化状态符合当前项目契约；同时报告浏览器实证与静态/测试证据的边界。

## 核心源码与命名约定

- `types`、`constants`、`configs`、`services` 和 `utils` 分别承载领域类型与契约、稳定字面量、运行配置组装、业务服务或外部数据边界、通用工具。
- `apps/web/src/views/pages/` 只承载 URL 结构、参数适配、redirect、guard、loader、layout 和导航契约；请求、表单、状态、组件及样式等业务实现存放在 `apps/web/src/views/components/` 等视图层。
- `apps/web/src/views/layout/` 自治拥有 Shell 组件、布局 Context/Provider、Hooks、常量、运行时 Schema、类型、纯函数、样式和测试，并按对应源码职责分目录。
- 布局外部源码只从 `@/views/layout` 导入公开组件、Hook 和类型；内部路径不是公共契约，布局内部使用相对路径访问自身模块。
- 公共和跨文件布局类型集中在 `views/layout/types/`，组件私有 Props 与局部状态类型就近声明；`types/` 不包含运行时代码。
- 菜单配置读取、导航标准化与匹配服务、通用导航类型及 Shell 鉴权/恢复事件继续由现有公共层拥有，布局只消费这些契约。
- 基础组件优先消费 `background`、`foreground`、`primary`、`muted`、`border`、`ring`、`sidebar-*` 等语义 Token；业务代码不维护平行色板。
- 颜色、圆角、阴影与模糊令牌由 `packages/ui/src/styles/globals.css` 拥有；Shell 几何（顶栏高度、侧栏宽度、图标按钮点击框、菜单项高度与内容留白）由 `apps/web/src/views/layout/hooks/useShellLayoutTokens.ts` 拥有。内容工作区占据 Shell 剩余空间，不设内容最大宽度；页面不各自维护外层留白或平行色板，可在自身容器内限制长文本阅读宽度，但不得给整个工作区加最大宽度。具体取值与可访问性门槛见 [客户端产品 UI 基线](docs/client-facing-ui-baseline.md)。
- 基础组件按“确认交互语义 → 搜索 `@workspace/ui` 现有源码 → 使用组件与内置变体 → 组合现有组件 → 最后才新增项目组件”的顺序选择。
- 业务源码只从 `@workspace/ui/components/<component>`、`@workspace/ui/hooks/<hook>` 和 `@workspace/ui/lib/utils` 导入；不得直接导入 `@base-ui/react`，不得建立聚合 barrel 或重新包装整套组件。
- Alert、Empty、Badge、Separator、Skeleton、Spinner 等已有语义组件不得用带样式的普通元素重复实现。
- 当前使用经过评审的精选基础组件快照，不预装 Chart、Questionnaire 及 Message、MessageScroller、Bubble、Marker 会话组件组；应用图表沿用现有 ECharts，场景化组件只有真实需求成立且依赖边界经过评审后才按需添加。
- Attachment 作为通用附件展示组件保留，可表达文件、图片、状态和操作；文件选择、上传、进度、重试、持久化与权限仍由应用业务层和 Service 负责。
- 从根目录运行 `pnpm exec shadcn info --json -c apps/web` 获取项目上下文；新增或更新单个组件先运行带 `-c apps/web` 的 `--dry-run` 和 `--diff`，未经明确许可不使用 `--overwrite`。`add --all` 只用于观察 registry 全量变化，不是完整性验收，也不得用于恢复已排除组件。
- 表单 Schema 是运行时校验与值类型的单一来源；使用 `z.infer` 推导类型，并同时设置字段的 `data-invalid` 与控件的 `aria-invalid`。
- **命名规范**：
  - React 组件目录、主文件 `.tsx` 及同名附属文件使用 PascalCase（例如 `<ComponentName>.tsx`、`<ComponentName>.module.css`）。
  - Hook 文件与导出统一使用 `useXxx`（例如 `useFeatureState.ts`）；非 Hook 模块不得使用 `use` 前缀。
  - Service、契约、类型、常量、配置、工具及一般模块使用小写 kebab-case。
  - 仅约束新建路径或明确重构，不批量重命名已有存量文件。
- 常规任务收敛在 `apps/web` 单体应用内，不因仓库采用 Monorepo 就预留微前端兼容分支。

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
- 路由、Shell、全局 Provider、workspace 或构建配置变更须运行 `pnpm build`，确认根 `dist/` 生成，并验证 URL 直达、刷新与历史导航。
- UI 变更同时检查键盘、焦点、主题、窄屏、浮层和滚动归属；精选快照只定义可复用基础能力，不代表其中每个组件都应进入业务或生产 chunk。
- UI 变更还需在真实浏览器中实测对比度、点击框尺寸和焦点可见性，并覆盖浅色与深色、缩放、移动端视口与长内容；判定门槛见 [客户端产品 UI 基线](docs/client-facing-ui-baseline.md)。无法使用真实浏览器时只能报告静态与构建证据。
