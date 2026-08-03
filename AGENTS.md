# AGENTS.md

本文件记录单体应用内可长期复用的协作规则，不记录具体项目、业务、环境或人员信息。

## 职责边界

- 单体应用在同一应用内承载用户体验、页面路由、业务功能、数据访问和局部状态。
- 常规任务应收敛在当前应用内；需要引入外部系统、跨应用协作或部署变更时，先确认需求和责任边界。
- 修改配置、路由、数据契约、构建或运行时行为前，先识别其影响范围和现有约定。

## Web 源码基础结构

```text
src/
├── types/
├── constants/
├── configs/
├── services/
├── utils/
└── views/
    ├── pages/
    └── components/
```

- 源码先按 `types`、`constants`、`configs`、`services`、`utils`、`views` 等技术职责分类，再在职责目录下按领域、子领域或功能细分。
- `src/types/` 保存领域模型和跨模块类型契约，不混入运行时代码；`src/constants/` 保存稳定常量、字面量集合和 `as const` 对象；`src/configs/` 保存需要组装或影响运行行为的配置。
- 有 OpenAPI TypeScript SDK 时，直接消费 SDK NPM 包提供的类型和服务函数，不重复声明接口、复制生成代码或机械包装本地 Service。没有 SDK，或确有跨页面复用的服务能力时，在 `src/services/` 下按明确领域或子领域创建服务文件。
- `src/utils/` 只保存不依赖页面状态、尽量纯粹且可复用的工具函数；接口调用、业务流程和外部状态不放入工具目录。
- `src/views/pages/` 只承载文件式路由入口、参数适配、路由级 guard、layout 和 error boundary；请求、表单、业务状态、图表配置、样式和复杂交互放在 `src/views/components/` 的明确领域或功能目录中。
- 不在 `types`、`constants`、`configs`、`services`、`utils` 等职责目录中新增无边界的 `index.ts` 聚合或转发文件；文件名应直接表达领域、子领域或职责。文件式路由需要的 `pages/**/index.tsx` 不受此限制。

## TypeScript 基线

- 所有 TypeScript 配置必须启用严格模式；不降低严格度，也不通过批量禁用规则绕过问题。
- 不使用 `any`。外部输入和未知错误从 `unknown` 开始，经 Schema、类型守卫或明确判断收窄后再使用。
- 不使用双重断言、非空断言、宽泛环境声明或 `@ts-ignore` 伪造类型安全。
- 不新增 `enum` 或 `const enum`；仅需要类型集合时使用字面量联合，同时需要运行时值时使用 `as const` 对象并从值推导类型。
- 互斥状态使用判别联合并通过 `never` 做穷尽检查；明确区分 `null`、`undefined`、属性缺失和空集合。
- Promise 必须被等待、返回、处理或明确忽略；`catch` 中的错误按 `unknown` 收窄。
- 类型先于实现定义，并在服务、组件和页面间复用；不要在多个实现文件中复制近似类型。

## Shell 层结构

```text
src/views/layout/
├── MainLayout.tsx
├── ShellLayoutRoot.tsx
├── <layout-mode>/
└── components/shell/<region>/
```

- `MainLayout.tsx` 连接文件路由与 Shell，将稳定的页面出口接入内容区；`ShellLayoutRoot.tsx` 保持 Shell 组件树稳定并负责区域组合与布局模式选择。
- `<layout-mode>/` 只编排不同布局模式，不复制 Header、Aside、Content 等区域组件；`components/shell/` 按壳层区域保存平台级组件。
- Shell 的类型、状态、Hook 和样式分别放在 `src/types/`、`src/contexts/`、`src/hooks/` 和 `src/styles/` 的明确职责文件中；布局计算和导航投影留在 `src/views/layout/` 的明确命名文件中。
- Shell 层承载应用框架和页面出口，不承载具体业务页面、业务表单或业务服务；布局模式切换不应无故重建页面内容。

## 工作方式

- 先阅读当前仓库的清单、配置、脚本、源码和测试，再选择实现方式与验证命令。
- 尊重现有工作树中的他人改动；不回滚、覆盖或顺带整理与任务无关的内容。
- 不提交账号、令牌、私有地址、证书、真实业务数据或其他敏感信息。
- 未经用户明确要求，不执行提交、发布、部署、版本递增或其他外部状态变更。

## 质量与验证

- 按变更性质运行当前仓库已有的针对性检查；不要凭空添加质量门禁或替换既有工具链。
- 涉及可见交互、路由、样式或运行时行为时，使用与影响范围相符的真实运行验证。
- 交付时说明实际改动、已执行验证及任何未验证边界。
