import type { ShellLayoutMode } from './types';

export type ShellTopNavigationPlacement = 'center' | 'hidden' | 'start';

/**
 * 推导顶部导航在 Header 中的挂载位置；只有 mix 模式允许在 start 和 center 之间切换。
 */
export function getShellTopNavigationPlacement(
  layoutMode: ShellLayoutMode,
  centerTopMenu: boolean
): ShellTopNavigationPlacement {
  if (layoutMode === 'top') {
    return 'center';
  }

  if (layoutMode === 'mix') {
    return centerTopMenu ? 'center' : 'start';
  }

  return 'hidden';
}
