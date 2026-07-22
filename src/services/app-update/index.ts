import { setupResourceErrorMonitor } from './resource-error-monitor';

let cleanupAppUpdateService: (() => void) | null = null;

/** 初始化静态资源恢复服务；重复调用保持幂等。 */
export function initAppUpdateService(): () => void {
  if (cleanupAppUpdateService) return cleanupAppUpdateService;
  const cleanupResourceMonitor = setupResourceErrorMonitor();
  cleanupAppUpdateService = () => {
    cleanupResourceMonitor();
    cleanupAppUpdateService = null;
  };
  return cleanupAppUpdateService;
}
