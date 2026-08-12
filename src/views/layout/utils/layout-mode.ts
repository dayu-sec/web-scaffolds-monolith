import { SHELL_LAYOUT_MODES } from '../constants/layout';
import type { ShellLayoutMode } from '../types/layout';

/** 判断未知值是否为 Shell 支持的布局模式。 */
export function isShellLayoutMode(value: unknown): value is ShellLayoutMode {
  return typeof value === 'string' && SHELL_LAYOUT_MODES.some((layoutMode) => layoutMode === value);
}
