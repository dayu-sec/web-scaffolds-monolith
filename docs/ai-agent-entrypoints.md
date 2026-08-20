# AI 工具上下文入口

本项目的 AI 协作上下文只有两个来源，任何工具都不应持有它们的副本：

| 层                | 唯一来源                         | 内容                                             |
| ----------------- | -------------------------------- | ------------------------------------------------ |
| 项目 Instructions | `AGENTS.md`                      | 项目事实、架构、命令、所有权、编码规范与验证约束 |
| 按需能力          | `.agents/skills/<name>/SKILL.md` | 任务级工作流与领域规范                           |

各 AI 工具的厂商文件只负责把该工具**引导到**这两处，不承载任何项目规则。修改协作约束时只改 `AGENTS.md`，不需要同步任何厂商文件。

## 厂商入口文件

以下工具默认读不到 `AGENTS.md`，因此各有一个薄指针：

| 文件                              | 服务的工具                                             |
| --------------------------------- | ------------------------------------------------------ |
| `CLAUDE.md`                       | Claude Code                                            |
| `GEMINI.md`                       | Gemini CLI、Google Antigravity                         |
| `QWEN.md`                         | Qwen Code                                              |
| `CODEBUDDY.md`                    | Tencent CodeBuddy Code                                 |
| `IFLOW.md`                        | iFlow CLI                                              |
| `.github/copilot-instructions.md` | GitHub Copilot                                         |
| `.kiro/steering/agents-entry.md`  | Kiro                                                   |
| `.clinerules/agents-entry.md`     | Cline                                                  |
| `.roo/rules/agents-entry.md`      | Roo Code（其 `AGENTS.md` 读取需手动启用）              |
| `.trae/rules/agents-entry.md`     | TRAE / TraeCode                                        |
| `.continue/rules/agents-entry.md` | Continue                                               |
| `.amazonq/rules/agents-entry.md`  | Amazon Q Developer                                     |
| `.comate/rules/agents-entry.mdr`  | 百度 Comate / Zulu                                     |
| `.aider.conf.yml`                 | Aider（无 Skill 体系，用 `read` 常驻加载 `AGENTS.md`） |

## 没有厂商文件的工具

以下工具**原生读取 `AGENTS.md`**，`AGENTS.md` 中已写明 Skill 路径，因此不需要也不应该为它们新增文件：

Codex、Cursor、Devin（Desktop / CLI）、OpenCode、Qoder、Grok Build、DeepSeek Harness、JetBrains Junie。

其中 Codex、Cursor、Devin、OpenCode、DeepSeek Harness 同时原生扫描 `.agents/skills/`；Qoder、Grok Build 使用自身 Skill 目录，靠 `AGENTS.md` 里的路径说明按需读取。

Kimi Code 原生扫描 `.agents/skills/`，技能侧无缺口。

## Skill 目录接入方式

`.agents/skills/` 是唯一副本。Claude Code 原生扫描 `.claude/skills/`，因此建立了相对符号链接：

```text
.claude/skills -> ../.agents/skills
```

`.agents/skills/` 由安装脚本创建。尚未安装 Skill 时该链接处于悬空状态，属正常现象，安装后自动生效，无需重建。检查是否已生效用 `[ -e .claude/skills ]`，不要用 `ls .claude/skills`——后者对悬空链接会打印链接名并返回 0，看不出问题。

Windows 用户若未启用 `core.symlinks`，该链接会检出为普通文本文件；此时按 `CLAUDE.md` 的说明直接读取 `.agents/skills/`。启用方式：

```bash
git config --global core.symlinks true
```

## 维护约定

- 新增工具前先确认其官方文档给出的稳定路径，不推测目录。
- 厂商文件保持 6 行以内，只指路；一旦发现某个文件开始承载规则，说明内容放错了位置，应回到 `AGENTS.md`。
- `.agents/skills/` 由 `setup-web-skills.sh` 安装并可能被 `-f` 覆盖，不要在其中手写内容。
- MCP 配置位置在各产品间尚未标准化，本项目不自造统一 MCP 配置文件。
