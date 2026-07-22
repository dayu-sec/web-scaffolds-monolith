import { now } from 'lodash-es';

// 仅在构建版本不可用时生效；页面生命周期内保持稳定，刷新后自然失效旧缓存。
const FALLBACK_RUNTIME_CONFIG_VERSION = String(now());

/** 开发环境始终绕过缓存，生产环境优先使用随制品发布的应用版本。 */
export function getRuntimeConfigVersion(): string {
  if (import.meta.env.DEV) return `dev-${String(now())}`;
  return __APP_VERSION__.trim() || FALLBACK_RUNTIME_CONFIG_VERSION;
}

/** 为唯一外部运行时配置追加制品版本，避免部署后读取旧菜单缓存。 */
export function withRuntimeConfigVersion(path: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set('v', getRuntimeConfigVersion());
  return `${url.pathname}${url.search}`;
}
