import type { ShellLayoutMode } from '../types/layout';

interface HeaderAsideCollapseButtonOptions {
  /**
   * 是否显式开启 Header 中的 aside 展开/折叠按钮。
   */
  enabled?: boolean;
  /**
   * 当前布局是否实际渲染 aside。
   */
  hasAside: boolean;
  /**
   * 当前 Shell 布局模式。
   */
  layoutMode: ShellLayoutMode;
}

/**
 * Header 折叠按钮默认关闭；只有项目显式开启且当前布局存在 aside 时才展示。
 */
export function shouldShowHeaderAsideCollapseButton({
  enabled = false,
  hasAside,
  layoutMode,
}: HeaderAsideCollapseButtonOptions): boolean {
  return enabled && hasAside && layoutMode !== 'top';
}
