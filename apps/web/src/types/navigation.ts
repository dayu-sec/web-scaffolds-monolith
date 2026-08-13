import type { ReactNode } from 'react';

import type { MenuConfig, MenuNode, MenuTarget } from '@/services/menu/schema';
import type { MenuIconName } from '@/services/navigation/icons';

export type NavigationSourceType = 'project-menu' | 'service-menu';
export type NavigationSourceStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
export type NavigationSourceNode = MenuNode;
export type NavigationTarget = MenuTarget;

export interface NavigationSourceResult {
  sourceType: NavigationSourceType;
  status: NavigationSourceStatus;
  items: NavigationSourceNode[];
  error?: unknown;
}

export interface NavigationItem {
  /** 布局内部稳定 key，包含祖先链和同级序号。 */
  key: string;
  label: string;
  icon?: string;
  iconName?: MenuIconName;
  path?: string;
  href?: string;
  target?: NavigationTarget;
  disabled?: boolean;
  children?: NavigationItem[];
  sitemapNodeKey?: string;
  highlightSitemapNodeKeys?: string[];
}

export interface BreadcrumbEntry {
  key: string;
  label: string;
  path?: string;
}

export interface BreadcrumbTrail {
  activePath: string;
  source: 'sitemap' | 'menu' | 'fallback';
  items: BreadcrumbEntry[];
}

export interface NavigationMatch {
  selectedKeys: string[];
  openKeys: string[];
  activeItem: NavigationItem | null;
  breadcrumb: BreadcrumbTrail;
}

export type ShellSlotName = 'header-start' | 'header-end';

export interface ShellSlotContent {
  slotName: ShellSlotName;
  content?: ReactNode;
}

export type ProjectMenuNavigationInput = MenuConfig | null;
