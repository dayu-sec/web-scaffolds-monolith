import type { BreadcrumbPlacement } from '@/contexts/LayoutContext';

import type { ShellLayoutMode } from './types';

/**
 * 解析面包屑的实际渲染位置。横向菜单占用 Header 的 mix/top 布局固定回退到内容区，
 * 避免导航、面包屑与全局操作在同一行互相挤压。
 */
export function resolveShellBreadcrumbPlacement(
  layoutMode: ShellLayoutMode,
  requestedPlacement: BreadcrumbPlacement
): BreadcrumbPlacement {
  if (requestedPlacement === 'content') {
    return 'content';
  }

  return layoutMode === 'side' || layoutMode === 'side-compact' ? 'header' : 'content';
}
