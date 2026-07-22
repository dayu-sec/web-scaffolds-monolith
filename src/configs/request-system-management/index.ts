import { normalizeError } from '@lrd/dy-sec-bizlib-request';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { handleAuthOrPermissionError } from '@/auth/handle-auth-error';

export const INSTANCE_NAME = 'container-shell';

/** 主应用平台请求契约；业务响应结构由各业务模块按接口契约解析。 */
export const requestConfig = {
  instanceName: INSTANCE_NAME,
  baseURL: `${import.meta.env.BASE_URL}api/v1`,
  timeout: 10_000,
  errorConfig: {},
  interceptors: {
    request: {
      onConfig: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => config,
      onError: (error: unknown): Promise<never> => normalizeError(error),
    },
    response: {
      onConfig: (response: AxiosResponse): AxiosResponse => response,
      onError: (error: unknown): Promise<never> => {
        handleAuthOrPermissionError(error);
        return normalizeError(error);
      },
    },
  },
};
