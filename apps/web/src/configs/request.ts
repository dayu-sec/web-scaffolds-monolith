import { type CustomRequestConfig, normalizeError } from '@dayu-sec/bizlib-request';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { handleAuthOrPermissionError } from '@/auth/handle-auth-error';
import { API_BASE_PATH } from '@/constants/api';

/** 当前应用共享的 API 请求实例名，避免基础设施与具体业务服务绑定。 */
export const API_REQUEST_INSTANCE_NAME = `${__APP_NAME__}-api`;

/**
 * 当前应用共享的 API 请求契约。
 * 配置只负责统一基址、超时和错误管道，微服务名与端点路径由业务 Service 持有。
 */
export const requestConfig = {
  instanceName: API_REQUEST_INSTANCE_NAME,
  baseURL: API_BASE_PATH,
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
} satisfies CustomRequestConfig;
