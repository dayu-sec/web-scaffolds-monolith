import logger from '@seed-fe/logger';

import { scheduleResourceRefresh } from './refresh-controller';

let cleanupResourceMonitor: (() => void) | null = null;

function isStaticResourceTarget(target: EventTarget | null): target is HTMLScriptElement | HTMLLinkElement {
  return target instanceof HTMLScriptElement || target instanceof HTMLLinkElement;
}

function getResourceUrl(target: HTMLScriptElement | HTMLLinkElement): string {
  return target instanceof HTMLScriptElement ? target.src : target.href;
}

/** 捕获 script/link 加载失败并交给统一资源恢复控制器。 */
export function setupResourceErrorMonitor(): () => void {
  if (cleanupResourceMonitor) return cleanupResourceMonitor;

  const handleResourceError = (event: Event) => {
    if (!isStaticResourceTarget(event.target)) return;
    const resourceUrl = getResourceUrl(event.target);
    logger.warn('[app update] Static resource failed:', resourceUrl);
    scheduleResourceRefresh(resourceUrl || 'static-resource');
  };

  window.addEventListener('error', handleResourceError, true);
  cleanupResourceMonitor = () => {
    window.removeEventListener('error', handleResourceError, true);
    cleanupResourceMonitor = null;
  };
  return cleanupResourceMonitor;
}
