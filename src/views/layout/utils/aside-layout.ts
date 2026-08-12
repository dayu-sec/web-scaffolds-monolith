import type { CSSProperties } from 'react';

type ShellAsideLayoutStyle = CSSProperties & Record<'--dy-sec-shell-current-aside-width', string>;

interface ShellAsideLayoutOptions {
  /**
   * 左侧导航是否处于折叠状态。
   */
  collapsed: boolean;
  /**
   * 左侧导航折叠后的宽度，单位为 px。
   */
  collapsedWidth: number;
  /**
   * 当前布局是否需要渲染左侧导航。
   */
  hasAside: boolean;
  /**
   * 左侧导航展开后的宽度，单位为 px。
   */
  width: number;
}

/**
 * 生成 Shell 当前 aside 宽度变量，供 grid 布局和 AntD 侧栏组件保持同一宽度来源。
 */
export function createShellAsideLayoutStyle({
  collapsed,
  collapsedWidth,
  hasAside,
  width,
}: ShellAsideLayoutOptions): ShellAsideLayoutStyle {
  const currentWidth = hasAside ? (collapsed ? collapsedWidth : width) : 0;

  return {
    '--dy-sec-shell-current-aside-width': `${String(currentWidth)}px`,
  };
}
