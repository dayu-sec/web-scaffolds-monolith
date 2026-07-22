import type { NavigationSourceResult, ProjectMenuNavigationInput } from '@/types/navigation';

/** 将唯一运行时菜单配置包装成统一导航来源。 */
export function createProjectMenuNavigationSource(menuConfig: ProjectMenuNavigationInput): NavigationSourceResult {
  if (!menuConfig) return { sourceType: 'project-menu', status: 'loading', items: [] };
  if (menuConfig.length === 0) return { sourceType: 'project-menu', status: 'empty', items: [] };
  return { sourceType: 'project-menu', status: 'success', items: menuConfig };
}

/** 保留主应用原有的服务菜单接入边界。 */
export function createServiceMenuNavigationSource(
  items: NavigationSourceResult['items'],
  error?: unknown
): NavigationSourceResult {
  if (error) return { sourceType: 'service-menu', status: 'error', items: [], error };
  return { sourceType: 'service-menu', status: items.length > 0 ? 'success' : 'empty', items };
}
