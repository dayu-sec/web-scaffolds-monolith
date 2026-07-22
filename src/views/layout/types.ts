import type { ReactNode } from 'react';

import type { NavigationItem, NavigationMatch, NavigationSourceStatus } from '@/types/navigation';

/** 主应用支持的四种稳定布局模式。 */
export type ShellLayoutMode = 'mix' | 'side' | 'side-compact' | 'top';

/**
 * 四种布局共享的渲染输入，具体布局只负责区域编排。
 */
export interface ShellLayoutProps {
  /**
   * 品牌 Logo 地址。
   */
  logo: string;
  /**
   * 品牌或项目标题。
   */
  title: string;
  /**
   * 导航来源状态。
   */
  navigationStatus: NavigationSourceStatus;
  /**
   * 规范化后的导航树。
   */
  navigationItems: NavigationItem[];
  /**
   * 当前路径匹配结果。
   */
  navigationMatch: NavigationMatch;
  /**
   * 菜单点击后的导航回调。
   */
  onNavigate: (item: NavigationItem) => void;
  /**
   * mix 模式下顶部一级菜单是否居中。
   */
  centerTopMenu?: boolean;
  /**
   * 是否在 Header start 区域展示 aside 展开/折叠按钮；默认由 aside 底部按钮承载。
   */
  showHeaderAsideCollapseButton?: boolean;
  /**
   * 主应用页面或微应用挂载内容。
   */
  children: ReactNode;
  /**
   * 可选底部区域内容。
   */
  footerContent?: ReactNode | false;
  /** 应用切换器异步数据入口；默认合法空态。 */
  /** Header start/end 的稳定扩展内容。 */
  headerStartContent?: ReactNode;
  headerEndContent?: ReactNode;
  /** 通知入口接入后提供回调和未读数；未提供时显示未配置状态。 */
  notificationCount?: number;
  onNotificationsClick?: () => void;
  /** 用户操作接入点；未提供时不展示无效退出动作。 */
  onUserAction?: () => void;
}

const SHELL_LAYOUT_MODES = new Set<ShellLayoutMode>(['mix', 'side', 'side-compact', 'top']);

/**
 * 判断未知值是否为主应用支持的 Shell 布局模式。
 */
export function isShellLayoutMode(value: unknown): value is ShellLayoutMode {
  return typeof value === 'string' && SHELL_LAYOUT_MODES.has(value as ShellLayoutMode);
}
