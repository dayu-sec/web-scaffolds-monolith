# web-project

> 大部分情况下，推荐通过 AI 探索和解决问题。

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

根据 `.env.development.local.example` 文件，创建 `.env.development.local` 文件，并配置相关环境变量。

```bash
cp .env.development.local.example .env.development.local
```

## 开发环境

通过 [mise](https://mise.jdx.dev/) 管理开发环境。

终端进入项目目录执行 `mise trust` 信任这个目录下的配置文件。

## 安装依赖

通过 PNPM 管理依赖。

```bash
# 项目初始时，或在变更依赖项后，执行安装依赖
pnpm install

# 启动本地开发服务
pnpm run dev
```

## AI Agent Skills

使用支持 Agent Skills 的 AI 编程工具时，安装 [DayuSec Web Skills](https://github.com/dayu-sec/web-skills)，补充 Web 项目发现、架构边界、源码结构和专用任务工作流。

```bash
curl -fsSL "https://raw.githubusercontent.com/dayu-sec/web-scaffolds-bootstrap/main/setup-web-skills.sh" | bash -s -- -f
```

安装完成后重新启动 Agent 会话。适用于当前单体 Web 架构的 Skill 组合见 [AGENTS.md](./AGENTS.md)。
