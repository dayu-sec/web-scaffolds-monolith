import { getRequestInstance, type HttpRequest, initializeRequest } from '@dayu-sec/bizlib-request';
import { QueryClient } from '@tanstack/react-query';
import { API_REQUEST_INSTANCE_NAME, requestConfig as apiRequestConfig } from '@/configs/request';
import { getCurrentLocale } from '@/locales';

let apiRequest: HttpRequest;

/** 在 React 首次渲染前注册并缓存当前应用共享的 API 请求实例。 */
export function configureRequest(): void {
  initializeRequest({
    instances: [apiRequestConfig],
    getLocale: getCurrentLocale,
  });
  apiRequest = getRequestInstance(API_REQUEST_INSTANCE_NAME);
}

export { apiRequest };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
