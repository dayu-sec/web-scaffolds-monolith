# web-project

> 大部分情况下，推荐通过 AI 探索和解决问题。

面向**外部客户与终端用户**的客户端产品脚手架（客户门户、面向客户的 SaaS 界面、消费级应用）。基础布局为顶栏 + 左侧菜单 + 右侧内容工作区，工作区占据剩余空间且不设最大宽度；14px 正文、舒适控件档位与克制科技蓝。

## 目录

- `apps/web`：唯一可部署的 Vite 单体应用。
- `packages/ui`：项目私有的 shadcn/ui 源码、主题和基础 Hook，不发布 npm。
- `AGENTS.md`：项目入口、所有权、UI 使用和验证约束。
- `docs/client-facing-ui-baseline.md`：产品定位、令牌所有权、视觉基线和可访问性门槛。

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

根据应用内的环境变量示例创建本地配置：

```bash
cp apps/web/.env.development.local.example apps/web/.env.development.local
```

## 开发环境

通过 [mise](https://mise.jdx.dev/) 管理开发环境。

终端进入项目目录执行 `mise trust` 信任这个目录下的配置文件。

## 安装依赖

通过 PNPM 管理依赖。

```bash
# 项目初始时，或在变更依赖项后，执行安装依赖
pnpm install

# 启动唯一 Web 应用
pnpm dev

# 类型、测试与生产构建
pnpm check
pnpm test
pnpm build
```

## AI Agent Skills

使用支持 Agent Skills 的 AI 编程工具时，安装 [DayuSec Web Skills](https://github.com/dayu-sec/web-skills)，补充 Web 项目发现、架构边界、源码结构和专用任务工作流。

```bash
curl -fsSL "https://raw.githubusercontent.com/dayu-sec/web-scaffolds-bootstrap/main/setup-web-skills.sh" | bash -s -- -f
```

安装完成后重新启动 Agent 会话。根据当前任务选择已安装且适用的 Skill；实际项目契约始终以 [AGENTS.md](./AGENTS.md)、配置和源码为准。
