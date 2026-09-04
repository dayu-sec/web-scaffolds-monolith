import { lpad } from '@seed-fe/slashify';
import type { MenuNode, MenuSelectRule } from '@/services/menu/schema';
import type { NavigationItem, NavigationSourceResult } from '@/types/navigation';
import { normalizeLucideIconName } from './icons';

function normalizeSelectRule(selectRule: MenuSelectRule | undefined): Pick<NavigationItem, 'path' | 'href' | 'target'> {
  if (!selectRule) return {};
  if ('path' in selectRule) {
    // slashify 会把根路径规整为空串；Shell 必须显式保留 `/` 才能导航首页。
    return { path: selectRule.path === '/' ? '/' : lpad(selectRule.path), target: selectRule.target };
  }
  return { href: selectRule.href, target: selectRule.target };
}

function createNavigationItemKey(ancestry: string[], segment: string): string {
  return [...ancestry, segment].join('/');
}

/** 转换菜单节点并保留源主应用的稳定祖先 key 与 sitemap 元数据。 */
export function normalizeMenuNode(node: MenuNode, ancestry: string[] = [], index = 0): NavigationItem {
  const isTopLevel = ancestry.length === 0;
  const segment = `${node.key}:${String(index)}`;
  const children = node.children?.map((child, childIndex) =>
    normalizeMenuNode(child, [...ancestry, segment], childIndex)
  );

  return {
    key: createNavigationItemKey(ancestry, segment),
    label: node.title,
    icon: isTopLevel ? node.icon : undefined,
    iconName: isTopLevel ? normalizeLucideIconName(node.icon) : undefined,
    disabled: node.disabled,
    children,
    sitemapNodeKey: node.sitemapNodeKey,
    highlightSitemapNodeKeys: node.highlightSitemapNodeKeys,
    ...normalizeSelectRule(node.selectRule),
  };
}

export function normalizeNavigationItems(source: NavigationSourceResult): NavigationItem[] {
  if (source.status !== 'success') return [];
  return source.items.map((item, index) => normalizeMenuNode(item, [], index));
}
