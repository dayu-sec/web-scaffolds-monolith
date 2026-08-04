import logger from '@seed-fe/logger';

const STORAGE_KEY = 'web-project-resource-refresh';
const REFRESH_GUARD_MS = 5 * 60 * 1000;
const REFRESH_DELAY_MS = 150;

interface RefreshMarker {
  reason: string;
  timestamp: number;
}

let memoryMarker: RefreshMarker | null = null;

function readMarker(): RefreshMarker | null {
  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedValue) return memoryMarker;
    const parsedValue = JSON.parse(storedValue) as Partial<RefreshMarker>;
    if (typeof parsedValue.reason === 'string' && typeof parsedValue.timestamp === 'number') {
      return parsedValue as RefreshMarker;
    }
  } catch (error) {
    logger.warn('[app update] Failed to read refresh marker:', error);
  }
  return memoryMarker;
}

function writeMarker(marker: RefreshMarker): void {
  memoryMarker = marker;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marker));
  } catch (error) {
    logger.warn('[app update] Failed to write refresh marker:', error);
  }
}

/** 防止同一失效资源在短时间内造成循环刷新。 */
export function canRefreshForResource(reason: string): boolean {
  const marker = readMarker();
  return marker?.reason !== reason || Date.now() - marker.timestamp > REFRESH_GUARD_MS;
}

/** 安排一次受循环保护的资源恢复刷新。 */
export function scheduleResourceRefresh(reason: string): boolean {
  if (!canRefreshForResource(reason)) {
    logger.warn('[app update] Resource refresh skipped by loop guard:', reason);
    return false;
  }
  writeMarker({ reason, timestamp: Date.now() });
  window.setTimeout(() => {
    window.location.reload();
  }, REFRESH_DELAY_MS);
  return true;
}
