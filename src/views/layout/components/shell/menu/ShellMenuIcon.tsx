import logger from '@seed-fe/logger';

import { menuIconMap, type MenuIconName } from '@/services/navigation/icons';

interface ShellMenuIconProps {
  /**
   * 产品配置中的原始 Lucide 组件名。
   */
  icon?: string;
  /**
   * 已规范化的 Lucide 动态图标名。
   */
  iconName?: MenuIconName;
}

const warnedIcons = new Set<string>();

/**
 * 渲染菜单配置指定的 Lucide 图标。
 */
export default function ShellMenuIcon({ icon, iconName }: ShellMenuIconProps) {
  if (import.meta.env.DEV && icon && !iconName && !warnedIcons.has(icon)) {
    warnedIcons.add(icon);
    logger.warn(`[shell menu] Unknown Lucide icon: ${icon}`);
  }

  if (!iconName) {
    return null;
  }

  const Icon = menuIconMap[iconName];

  return (
    <span className="ant-menu-item-icon dy-sec-shell-menu-icon">
      <Icon size="1em" strokeWidth={1.8} />
    </span>
  );
}
