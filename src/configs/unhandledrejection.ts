import logger from '@seed-fe/logger';

import { scheduleResourceRefresh } from '@/services/app-update/refresh-controller';

let cleanupUnhandledRejection: (() => void) | null = null;

function getReasonMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  return typeof reason === 'string' ? reason : '';
}

function isResourceLoadFailure(reason: unknown): boolean {
  return /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i.test(
    getReasonMessage(reason)
  );
}

/** 监控未处理 Promise 异常，并恢复动态模块资源版本不一致。 */
export function setupUnhandledRejectionMonitor(): () => void {
  if (cleanupUnhandledRejection) return cleanupUnhandledRejection;

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    logger.error('[shell] Unhandled promise rejection:', event.reason);
    if (isResourceLoadFailure(event.reason)) {
      scheduleResourceRefresh(getReasonMessage(event.reason) || 'dynamic-import');
    }
  };
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  cleanupUnhandledRejection = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    cleanupUnhandledRejection = null;
  };
  return cleanupUnhandledRejection;
}
