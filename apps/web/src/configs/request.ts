import { type CustomRequestConfig, normalizeError } from '@dayu-sec/bizlib-request';
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
  interceptors: {
    // 对象形式拦截器要求显式 onConfig；当前不需要改写请求/响应，原样透传。
    request: {
      onConfig: (config) => config,
      onError: normalizeError,
    },
    response: {
      onConfig: (response) => response,
      // 401/403 额外触发 Shell 访问恢复事件；错误本身仍然只交给 normalizeError 规范化。
      onError: (error) => {
        handleAuthOrPermissionError(error);
        return normalizeError(error);
      },
    },
  },
} satisfies CustomRequestConfig;
