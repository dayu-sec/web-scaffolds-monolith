import type { ProxyOptions } from 'vite';

import { API_BASE_PATH } from './src/constants/api';

/**
 * 创建团队内部 API 的本地开发代理。
 * 仅在显式配置目标时启用，目标和鉴权值只由 Vite 进程读取，不会进入客户端环境变量。
 */
export function getProxyConfig(env: Partial<Record<string, string>>): Record<string, ProxyOptions> {
  const apiToken = env.DEV_API_TOKEN?.trim();
  const apiUrl = env.DEV_API_URL?.trim();

  if (!apiUrl) return {};

  const proxy: ProxyOptions = {
    target: apiUrl,
    changeOrigin: true,
    secure: false,
  };

  if (apiToken) {
    proxy.headers = {
      Authorization: `Bearer ${apiToken}`,
    };
  }

  return {
    [`${API_BASE_PATH}/`]: proxy,
  };
}
