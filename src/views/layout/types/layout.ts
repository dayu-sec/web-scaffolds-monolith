import type { ReactNode } from 'react';
import type { z } from 'zod';

import type { NavigationItem, NavigationMatch, NavigationSourceStatus } from '@/types/navigation';

import type { layoutSettingsSchema } from '../schemas/layout-settings';

/** 经运行时 Schema 验证后的完整布局设置。 */
export type LayoutSettings = z.output<typeof layoutSettingsSchema>;

/** Shell 支持的布局模式。 */
export type ShellLayoutMode = LayoutSettings['layout'];

/** 面包屑在 Header 或主内容区中的可配置位置。 */
export type BreadcrumbPlacement = LayoutSettings['breadcrumbPlacement'];

/** 布局设置 Context 向组件公开的稳定状态与操作。 */
export interface LayoutContextValue {
  hasStoredSettings: boolean;
  settings: LayoutSettings;
  updateSettings: (patch: Partial<LayoutSettings>) => void;
  resetSettings: () => void;
}

/** 四种布局共享的渲染输入，具体模式只改变区域编排。 */
export interface ShellLayoutProps {
  /** 品牌 Logo 地址。 */
  logo: string;
  /** 品牌或项目标题。 */
  title: string;
  /** 导航来源状态。 */
  navigationStatus: NavigationSourceStatus;
  /** 规范化后的导航树。 */
  navigationItems: NavigationItem[];
  /** 当前路径匹配结果。 */
  navigationMatch: NavigationMatch;
  /** 菜单点击后的导航回调。 */
  onNavigate: (item: NavigationItem) => void;
  /** mix 模式下顶部一级菜单是否居中。 */
  centerTopMenu?: boolean;
  /** 是否在 Header start 区域展示 aside 展开/折叠按钮。 */
  showHeaderAsideCollapseButton?: boolean;
  /** 当前主应用页面。 */
  children: ReactNode;
  /** 可选底部区域内容。 */
  footerContent?: ReactNode | false;
  /** Header start/end 的稳定扩展内容。 */
  headerStartContent?: ReactNode;
  headerEndContent?: ReactNode;
  /** 通知入口接入后提供回调和未读数。 */
  notificationCount?: number;
  onNotificationsClick?: () => void;
  /** 用户操作接入点。 */
  onUserAction?: () => void;
}

/** 不同布局模式对顶部和侧边导航的稳定投影结果。 */
export interface ShellNavigationProjection {
  hasAside: boolean;
  topItems: NavigationItem[];
  topMatch: NavigationMatch;
  asideItems: NavigationItem[];
  asideMatch: NavigationMatch;
}

/** 顶部导航在 Header 中的挂载位置。 */
export type ShellTopNavigationPlacement = 'center' | 'hidden' | 'start';

/** 注入 Shell root scope 的 CSS 变量集合。 */
export type ShellRootScopeStyle = React.CSSProperties & Record<`--dy-sec-shell-${string}`, string>;
