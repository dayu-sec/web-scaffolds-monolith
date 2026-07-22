import { matchRoutes, type RouteMatch, type RouteObject } from 'react-router';

import { MenuConfigError } from './error';
import type { MenuConfig } from './schema';

function collectInternalPaths(config: MenuConfig): string[] {
  return config.flatMap((node) => {
    const ownPath = node.selectRule && 'path' in node.selectRule ? [node.selectRule.path] : [];
    return [...ownPath, ...collectInternalPaths(node.children ?? [])];
  });
}

function joinRoutePattern(matches: RouteMatch[]): string {
  let pattern = '';

  for (const match of matches) {
    const segment = match.route.path;
    if (!segment) {
      continue;
    }
    pattern = segment.startsWith('/') ? segment : `${pattern.replace(/\/$/, '')}/${segment}`;
  }

  return pattern || '/';
}

/** 将菜单中的具体入口还原为对应的文件路由模式，例如 demo -> :id。 */
export function resolveMenuRoutePattern(path: string, routes: RouteObject[]): string | null {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  const matches = matchRoutes(routes, pathname);
  return matches ? joinRoutePattern(matches) : null;
}

/** 确保每个菜单内部链接都能命中文件路由；外链不参与此校验。 */
export function validateMenuRouteCoverage(config: MenuConfig, routes: RouteObject[]): void {
  const unmatched = collectInternalPaths(config).filter((path) => {
    return resolveMenuRoutePattern(path, routes) === null;
  });

  if (unmatched.length > 0) {
    throw new MenuConfigError('route', `菜单路径没有对应文件路由: ${unmatched.join(', ')}`);
  }
}
