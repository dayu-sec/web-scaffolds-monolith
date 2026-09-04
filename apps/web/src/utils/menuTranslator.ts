import type { TFunction } from 'i18next';
import type { MenuConfig, MenuNode } from '@/services/menu/schema';

/** 递归翻译菜单标题，缺失翻译时保留运行时 JSON 中的 title。 */
export function translateMenuConfig(menuConfig: MenuConfig, t: TFunction): MenuConfig {
  return menuConfig.map((item): MenuNode => ({
    ...item,
    title: t(`project-menu:${item.key}`, item.title),
    children: item.children ? translateMenuConfig(item.children, t) : undefined,
  }));
}
