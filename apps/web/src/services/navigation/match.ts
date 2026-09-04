import { matchPath, type RouteObject } from 'react-router';
import type { BreadcrumbEntry, NavigationItem, NavigationMatch } from '@/types/navigation';
import { resolveMenuRoutePattern } from '../menu/routeCoverage';

interface CandidateMatch {
  item: NavigationItem;
  ancestors: NavigationItem[];
  score: number;
}

function trimTrailingSlash(path: string): string {
  return path === '/' ? path : path.replace(/\/+$/, '');
}

function matchesPath(pathname: string, itemPath: string, routes: RouteObject[]): boolean {
  const current = trimTrailingSlash(pathname);
  const target = trimTrailingSlash(itemPath);
  if (current === target || (target !== '/' && current.startsWith(`${target}/`))) return true;
  const routePattern = resolveMenuRoutePattern(itemPath, routes);
  return routePattern ? matchPath({ path: routePattern, end: true }, current) !== null : false;
}

function collectMatches(
  items: NavigationItem[],
  pathname: string,
  routes: RouteObject[],
  ancestors: NavigationItem[] = []
): CandidateMatch[] {
  return items.flatMap((item) => {
    const childMatches = collectMatches(item.children ?? [], pathname, routes, [...ancestors, item]);
    if (!item.path || !matchesPath(pathname, item.path, routes)) return childMatches;
    return [...childMatches, { item, ancestors, score: trimTrailingSlash(item.path).length }];
  });
}

function createBreadcrumb(items: NavigationItem[]): BreadcrumbEntry[] {
  return items.map((item) => ({ key: item.key, label: item.label, path: item.path }));
}

/** 最长路径优先推导选中态、展开态和面包屑，兼容动态文件路由。 */
export function matchNavigation(
  items: NavigationItem[],
  pathname: string,
  routes: RouteObject[] = []
): NavigationMatch {
  const match = collectMatches(items, pathname, routes)
    .sort((left, right) => right.score - left.score)
    .at(0);
  if (!match) {
    return {
      activeItem: null,
      breadcrumb: {
        activePath: pathname,
        items: pathname === '/' ? [] : [{ key: pathname, label: pathname }],
        source: 'fallback',
      },
      openKeys: [],
      selectedKeys: [],
    };
  }
  const path = [...match.ancestors, match.item];
  return {
    activeItem: match.item,
    breadcrumb: {
      activePath: pathname,
      items: createBreadcrumb(path),
      source: path.some((item) => item.sitemapNodeKey) ? 'sitemap' : 'menu',
    },
    openKeys: match.ancestors.map((item) => item.key),
    selectedKeys: [match.item.key],
  };
}
