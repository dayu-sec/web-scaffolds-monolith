import type { ShellRootScopeStyle } from '../types/layout';

const SHELL_ROOT_ID = 'app-root';
const SHELL_ROOT_WRAPPER_CLASS = 'dy-sec-shell-wrapper';
const SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS = 'dy-sec-container-theme-scope';
const SHELL_ROOT_SELECTOR = `#${SHELL_ROOT_ID}.${SHELL_ROOT_WRAPPER_CLASS}.${SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS}`;

/** 返回 Shell 变量的唯一 root scope 选择器。 */
export function getShellRootScopeSelector(): string {
  return SHELL_ROOT_SELECTOR;
}

/** 将 Shell CSS 变量序列化为 root scope 下的样式规则。 */
export function createShellRootScopeCssText(selector: string, style: ShellRootScopeStyle): string {
  const declarations = Object.entries(style).map(([key, value]) => `  ${key}: ${String(value)};`);

  return [`${selector} {`, ...declarations, '}'].join('\n');
}
