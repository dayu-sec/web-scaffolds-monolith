import { kebabCase } from 'change-case';
import {
  Activity,
  Bell,
  BookOpen,
  Boxes,
  Bug,
  CircleAlert,
  ClipboardList,
  Database,
  FileSearch,
  FileText,
  Gauge,
  House,
  LayoutDashboard,
  LockKeyhole,
  type LucideIcon,
  Monitor,
  Network,
  Route,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';

/**
 * 运行时菜单允许使用的 Lucide 子集。保持配置名规范化逻辑，同时避免动态入口
 * 将整套图标拆成上千个生产 chunk。
 */
export const menuIconMap = {
  activity: Activity,
  bell: Bell,
  'book-open': BookOpen,
  boxes: Boxes,
  bug: Bug,
  'circle-alert': CircleAlert,
  'clipboard-list': ClipboardList,
  database: Database,
  'file-search': FileSearch,
  'file-text': FileText,
  gauge: Gauge,
  house: House,
  'layout-dashboard': LayoutDashboard,
  'lock-keyhole': LockKeyhole,
  monitor: Monitor,
  network: Network,
  route: Route,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  'shield-check': ShieldCheck,
  users: Users,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type MenuIconName = keyof typeof menuIconMap;

export function isLucideIconName(iconName: string): iconName is MenuIconName {
  return Object.hasOwn(menuIconMap, iconName);
}

/** 将产品配置中的 PascalCase 图标组件名转换为受控 kebab-case 名称。 */
export function normalizeLucideIconName(icon?: string): MenuIconName | undefined {
  if (!icon) return undefined;
  const dynamicIconName = kebabCase(icon);
  return isLucideIconName(dynamicIconName) ? dynamicIconName : undefined;
}
