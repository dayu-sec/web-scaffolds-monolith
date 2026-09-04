# web-project

> 大部分情况下，推荐通过 AI 探索和解决问题。

面向**外部客户与终端用户**的客户端产品脚手架（客户门户、面向客户的 SaaS 界面、消费级应用）。基础布局为顶栏 + 左侧菜单 + 右侧内容工作区，工作区占据剩余空间且不设最大宽度；14px 正文、舒适控件档位与克制科技蓝。

## 目录

- `apps/web`：唯一可部署的 Vite 单体应用。
- `packages/ui`：项目私有的 shadcn/ui 源码、主题和基础 Hook，不发布 npm。
- `AGENTS.md`：项目入口、所有权、UI 使用和验证约束。
- `docs/client-facing-ui-baseline.md`：产品定位、令牌所有权、视觉基线和可访问性门槛。
- `docs/ai-agent-entrypoints.md`：各 AI 工具的上下文入口与维护约定。

## 登录 CNB NPM 源

_只需要执行一次，认证信息会记录在 `~/.npmrc` 中。_

当有安装 `@lrd` 业务域私有依赖，请在终端中完成 CNB NPM 源认证。

- `Username` 就是 `cnb`，不是其它字符！
- `Password` 需要在 CNB [创建 Token](https://cnb.cool/profile/token/create) (建议保存在 Bitwarden)，必须选 **Artifact Registry**

```bash
npm login --registry https://npm.cnb.cool/dy-sec/npm/-/packages/
# Username: cnb
# Password: <TOKEN>
```

## 开发服务配置

本地开发只需要一份配置。基于模板创建 Git 忽略的 `apps/web/proxy.local.jsonc`，
按 `apps/web/proxy.schema.json` 声明开发端口、Mock 开关、共享 Token 和多服务代理：

```bash
cp apps/web/proxy.local.jsonc.example apps/web/proxy.local.jsonc
```

配置文件改动后 Vite 自动重启；字段名或类型写错会直接报错终止启动，不会静默回落到默认值。

## 开发环境

通过 [mise](https://mise.jdx.dev/) 管理开发环境。

终端进入项目目录执行 `mise trust` 信任这个目录下的配置文件。

## 安装依赖

通过 PNPM 管理依赖。

```bash
# 项目初始时，或在变更依赖项后，执行安装依赖
pnpm install

# 启动唯一 Web 应用（默认直连真实 API / 本地代理，不加载 Mock）
pnpm dev

# 需要本地 Mock 时显式启动；单个端点用自己 defineMock 记录的 enabled 控制
pnpm dev:mock

# 代码规范与格式（oxlint / oxfmt）
pnpm lint
pnpm lint:fix
pnpm format
pnpm format-check

# 类型、测试与生产构建
pnpm check
pnpm test
pnpm build
```

代码规范由 `.oxlintrc.json` 单一拥有，格式由 `.oxfmtrc.json` 单一拥有；两者都不再经过 ESLint 或 Prettier。
导入排序与 Tailwind class 排序由 oxfmt 负责，类型感知规则由 `oxlint-tsgolint` 提供，随 `pnpm lint` 一并执行。

## AI 工具支持

本项目的 AI 协作上下文只有两个来源：

- [AGENTS.md](./AGENTS.md)：项目事实、架构、命令、所有权与验证约束。
- `.agents/skills/<name>/SKILL.md`：按需加载的任务工作流与领域规范，由下方安装命令写入。

Claude Code、Codex、Gemini CLI、Cursor、Copilot、Kiro、Cline、Qwen Code、TRAE、CodeBuddy、iFlow 等工具均已接入：原生读取 `AGENTS.md` 的工具直接生效，其余工具在各自支持的位置放了一个薄指针。完整对照表与维护约定见 [docs/ai-agent-entrypoints.md](./docs/ai-agent-entrypoints.md)。

修改协作约束时只改 `AGENTS.md`，不需要同步任何厂商文件。

### 安装 Skill

```bash
curl -fsSL "https://raw.githubusercontent.com/dayu-sec/web-scaffolds-bootstrap/main/setup-web-skills.sh" | bash -s -- -f
```

安装完成后重新启动 Agent 会话。Windows 用户需启用 `git config --global core.symlinks true`，否则 Claude Code 使用的 `.claude/skills` 符号链接不会生效。
