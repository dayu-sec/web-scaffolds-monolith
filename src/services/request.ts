import { getRequestInstance, type HttpRequest, initializeRequest } from '@dayu-sec/bizlib-request';
import { QueryClient } from '@tanstack/react-query';

import {
  INSTANCE_NAME as SYSTEM_MANAGEMENT_INSTANCE_NAME,
  requestConfig as systemManagementRequestConfig,
} from '@/configs/request-system-management';
import { getCurrentLocale } from '@/locales';

let systemManagementRequest: HttpRequest;

/** 在 React 首次渲染前注册并缓存主应用平台请求实例。 */
export function configureRequest(): void {
  initializeRequest({
    instances: [systemManagementRequestConfig],
    getLocale: getCurrentLocale,
  });
  systemManagementRequest = getRequestInstance(SYSTEM_MANAGEMENT_INSTANCE_NAME);
}

export { systemManagementRequest };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
