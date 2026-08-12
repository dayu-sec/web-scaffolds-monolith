import type { NavigationItem, NavigationMatch, NavigationSourceStatus } from '@/types/navigation';

import type { ShellLayoutMode, ShellNavigationProjection } from '../types/layout';

/**
 * 解析菜单节点真正要跳转的目标；内部一级菜单带 children 时优先进入第一个可访问子菜单。
 */
export function resolveNavigationIntent(item: NavigationItem): NavigationItem | null {
  if (item.disabled) {
    return null;
  }

  if (item.href) {
    return item;
  }

  for (const child of item.children ?? []) {
    const childIntent = resolveNavigationIntent(child);

    if (childIntent) {
      return childIntent;
    }
  }

  return item.path ? item : null;
}

/**
 * 将 mix 模式顶部菜单限制为一级节点，并把点击目标改写为该一级节点的导航意图。
 */
function createMixTopItems(items: NavigationItem[]): NavigationItem[] {
  return items.map((item) => {
    const intent = resolveNavigationIntent(item);

    return {
      ...item,
      children: undefined,
      disabled: item.disabled === true || !intent,
      href: intent?.href,
      path: intent?.path,
      target: intent?.target,
    };
  });
}

/**
 * 收集子树内所有 key，用于把全量匹配结果裁剪成局部菜单可消费的状态。
 */
function collectNavigationKeys(items: NavigationItem[], keySet = new Set<string>()): Set<string> {
  for (const item of items) {
    keySet.add(item.key);
    collectNavigationKeys(item.children ?? [], keySet);
  }

  return keySet;
}

/**
 * 判断候选一级节点是否包含当前路由命中的菜单项。
 */
function containsMatchedKey(item: NavigationItem, matchedKeys: Set<string>): boolean {
  if (matchedKeys.has(item.key)) {
    return true;
  }

  return (item.children ?? []).some((child) => containsMatchedKey(child, matchedKeys));
}

/**
 * 根据当前匹配结果找到 mix 模式顶部应该高亮的一级菜单。
 */
function findActiveTopItem(items: NavigationItem[], match: NavigationMatch): NavigationItem | null {
  const matchedKeys = new Set([...match.openKeys, ...match.selectedKeys]);

  if (match.activeItem) {
    matchedKeys.add(match.activeItem.key);
  }

  return items.find((item) => containsMatchedKey(item, matchedKeys)) ?? null;
}

/**
 * 生成顶部一级菜单的选中态；顶部菜单只关心当前业务域，不展开子菜单。
 */
function createTopMatch(match: NavigationMatch, activeTopItem: NavigationItem | null): NavigationMatch {
  return {
    ...match,
    activeItem: activeTopItem,
    openKeys: [],
    selectedKeys: activeTopItem ? [activeTopItem.key] : [],
  };
}

/**
 * 生成侧边局部菜单的匹配状态，避免把已经不在局部菜单中的一级 key 传给 AntD Menu。
 */
function createAsideMatch(match: NavigationMatch, asideItems: NavigationItem[]): NavigationMatch {
  const asideKeys = collectNavigationKeys(asideItems);
  const activeItem = match.activeItem && asideKeys.has(match.activeItem.key) ? match.activeItem : null;

  return {
    ...match,
    activeItem,
    openKeys: match.openKeys.filter((key) => asideKeys.has(key)),
    selectedKeys: match.selectedKeys.filter((key) => asideKeys.has(key)),
  };
}

/**
 * 为不同 Shell 布局生成 Header 与左侧 aside 各自需要的导航树和菜单状态。
 */
export function createShellNavigationProjection(
  layoutMode: ShellLayoutMode,
  navigationItems: NavigationItem[],
  navigationMatch: NavigationMatch,
  navigationStatus: NavigationSourceStatus
): ShellNavigationProjection {
  if (layoutMode === 'top') {
    return {
      hasAside: false,
      topItems: navigationItems,
      topMatch: navigationMatch,
      asideItems: [],
      asideMatch: navigationMatch,
    };
  }

  if (layoutMode !== 'mix') {
    return {
      hasAside: true,
      topItems: [],
      topMatch: navigationMatch,
      asideItems: navigationItems,
      asideMatch: navigationMatch,
    };
  }

  const activeTopItem = findActiveTopItem(navigationItems, navigationMatch);
  const asideItems = activeTopItem?.children ?? [];
  const hasAside = navigationStatus !== 'success' || asideItems.length > 0;

  return {
    hasAside,
    topItems: createMixTopItems(navigationItems),
    topMatch: createTopMatch(navigationMatch, activeTopItem),
    asideItems,
    asideMatch: createAsideMatch(navigationMatch, asideItems),
  };
}
