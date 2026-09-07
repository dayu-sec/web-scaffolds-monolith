/* global process */
// @ts-check
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import pico from 'picocolors';

/**
 * 兜底解析提交信息文件：Hook 未传路径时问 git 要。
 *
 * 不用 `.git/COMMIT_EDITMSG` 拼路径，linked worktree 和子模块里 `.git` 是文件而非目录，
 * cwd 也不保证在仓库根。`git rev-parse --git-path` 这几种情况都能给出正确位置。
 */
function resolveDefaultMessagePath() {
  try {
    return execFileSync('git', ['rev-parse', '--git-path', 'COMMIT_EDITMSG'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

// 优先使用 Hook 传入的文件路径，缺失时兜底到 git 给出的 COMMIT_EDITMSG。
const msgPath = process.argv[2] || resolveDefaultMessagePath();

if (!existsSync(msgPath)) {
  console.error('缺少 commit-msg Hook 提供的提交信息文件路径。');
  process.exit(1);
}

// 只校验提交标题；后续正文不计入长度限制。
const subject = readFileSync(msgPath, 'utf-8').split(/\r?\n/, 1)[0]?.trim() ?? '';

// 与 @commitlint/config-conventional 的 header-max-length 对齐：限制整行标题，而非仅描述部分。
const MAX_LENGTH = 100;

const commitRE =
  /^(revert: )?(feat|fix|docs|style|refactor|test|workflow|build|ci|chore|types|wip|release)(\([^)]+\))?!?: .+$/;

const tooLong = subject.length > MAX_LENGTH;

if (!commitRE.test(subject) || tooLong) {
  console.log();
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red('invalid commit message format.')}\n\n` +
      (tooLong ? pico.red(`  标题超出长度：当前 ${subject.length} 字符，上限 ${MAX_LENGTH} 字符。\n\n`) : '') +
      pico.red('  提交日志需要遵循如下格式：\n\n') +
      pico.yellow('  1. 可选的 "revert: " 前缀\n') +
      pico.yellow('  2. 类型 "feat|fix|docs|style|refactor|test|workflow|build|ci|chore|types|wip|release"\n') +
      pico.yellow('  3. 可选的作用域 (xxx)\n') +
      pico.yellow('  4. 可选的 "!"（破坏性变更，紧贴冒号之前）\n') +
      pico.yellow('  5. 英文冒号和空格\n') +
      pico.yellow('  6. 非空的简要描述\n') +
      pico.yellow(`  7. 标题整行不超过 ${MAX_LENGTH} 字符\n\n`) +
      pico.red('  示例：\n\n') +
      `    ${pico.green("feat(compiler): add 'comments' option")}\n` +
      `    ${pico.green('fix(v-model): handle events on blur (#28)')}\n` +
      `    ${pico.green('refactor(api)!: drop legacy endpoint')}\n\n` +
      pico.red('  详细规范见：https://www.conventionalcommits.org/zh-hans/\n')
  );
  process.exit(1);
}
