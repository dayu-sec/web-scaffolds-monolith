import { ZodError } from 'zod';

import { MenuConfigError } from './error';
import { type MenuConfig, parseMenuConfig } from './schema';
import { withRuntimeConfigVersion } from './version';

const MENU_CONFIG_PATH = 'project/menu.config.json';

/** 请求并严格校验单个菜单地址；可注入 fetcher 以确定性覆盖网络失败测试。 */
export async function fetchMenuConfigFrom(
  url: string,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch
): Promise<MenuConfig> {
  let response: Response;

  try {
    response = await fetcher(url, {
      cache: 'no-cache',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new MenuConfigError('fetch', '菜单配置请求失败', error);
  }

  if (!response.ok) {
    throw new MenuConfigError('fetch', `菜单配置请求返回 ${String(response.status)}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new MenuConfigError('parse', '菜单配置不是有效 JSON', error);
  }

  try {
    return parseMenuConfig(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new MenuConfigError('contract', '菜单配置不符合契约', error);
    }
    throw error;
  }
}

/** 从当前 Vite base 下读取唯一的运行时菜单配置。 */
export function fetchMenuConfig(signal?: AbortSignal): Promise<MenuConfig> {
  return fetchMenuConfigFrom(withRuntimeConfigVersion(`${import.meta.env.BASE_URL}${MENU_CONFIG_PATH}`), signal);
}
