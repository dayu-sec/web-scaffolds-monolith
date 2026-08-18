import logger from '@seed-fe/logger';

import { notifyException } from '@/configs/exception-notification';
import { scheduleResourceRefresh } from '@/services/app-update/refresh-controller';

let cleanupGlobalErrorMonitor: (() => void) | null = null;

function getReasonMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  return typeof reason === 'string' ? reason : '';
}

function isResourceLoadFailure(reason: unknown): boolean {
  return /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i.test(
    getReasonMessage(reason)
  );
}

/**
 * 统一监听浏览器未处理的同步异常与 Promise rejection。
 *
 * 监听器只记录原始异常，并统一通知 Shell 展示一次通用反馈；不区分异常来源，不额外包装、
 * 解析。请求错误已经由 `normalizeError` 规范化，业务主动 catch 的异常不会进入这里。动态
 * 资源版本不一致是已知的自愈场景，继续交给刷新控制器恢复，不重复弹出反馈。
 */
export function setupGlobalErrorMonitor(): () => void {
  if (cleanupGlobalErrorMonitor) return cleanupGlobalErrorMonitor;

  const handleError = (event: ErrorEvent) => {
    logger.error('[shell] Unhandled error:', event.error);
    notifyException();
  };
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    logger.error('[shell] Unhandled promise rejection:', event.reason);
    if (isResourceLoadFailure(event.reason)) {
      scheduleResourceRefresh(getReasonMessage(event.reason) || 'dynamic-import');
      return;
    }
    notifyException();
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  cleanupGlobalErrorMonitor = () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    cleanupGlobalErrorMonitor = null;
  };
  return cleanupGlobalErrorMonitor;
}
