/* global process */
// @ts-check
import { readFileSync } from 'node:fs';
import pico from 'picocolors';

const msgPath = process.argv[2];

if (!msgPath) {
  console.error('缺少 commit-msg Hook 提供的提交信息文件路径。');
  process.exit(1);
}

// 只校验提交标题；后续正文不计入 50 字符限制。
const subject = readFileSync(msgPath, 'utf-8').split(/\r?\n/, 1)[0]?.trim() ?? '';

const commitRE =
  /^(revert: )?(feat|fix|docs|style|refactor|test|workflow|build|ci|chore|types|wip|release)(\([^)]+\))?: .{1,50}$/;

if (!commitRE.test(subject)) {
  console.log();
  console.error(
    `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red('invalid commit message format.')}\n\n` +
      pico.red('  提交日志需要遵循如下格式：\n\n') +
      pico.yellow('  1. 可选的 "revert: " 前缀\n') +
      pico.yellow('  2. 类型 "feat|fix|docs|style|refactor|test|workflow|build|ci|chore|types|wip|release"\n') +
      pico.yellow('  3. 可选的作用域 (xxx)\n') +
      pico.yellow('  4. 英文冒号和空格\n') +
      pico.yellow('  5. 1~50 字符的简要描述\n\n') +
      pico.red('  示例：\n\n') +
      `    ${pico.green("feat(compiler): add 'comments' option")}\n` +
      `    ${pico.green('fix(v-model): handle events on blur (#28)')}\n\n` +
      pico.red('  详细规范见：https://www.conventionalcommits.org/zh-hans/\n')
  );
  process.exit(1);
}
