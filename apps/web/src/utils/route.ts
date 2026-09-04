import logger from '@seed-fe/logger';
import { isUndefined } from 'lodash-es';
import qs from 'qs';
import type { URLDescriptor } from '@/types/route';
import { isExternalUrl } from './url';

export function stringifyUrl(urlDescriptor: URLDescriptor): string {
  const { pathname, query } = urlDescriptor;
  return isUndefined(query) ? pathname : `${pathname}?${qs.stringify(query)}`;
}

export const Target = { Self: '_self', Blank: '_blank' } as const;
export type TargetType = (typeof Target)[keyof typeof Target];
export type Open = (url: string | URLDescriptor, target?: TargetType) => void;

function pushWithBrowserHistory(destUrl: string): void {
  window.history.pushState(null, '', destUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * 主应用统一导航入口，保留 URL 描述、查询序列化、
 * 外链与新窗口语义；同页导航由浏览器 History 驱动 React Router。
 */
export function open(url: string | URLDescriptor, target: TargetType = Target.Self): void {
  const destUrl = typeof url === 'string' ? url : stringifyUrl(url);
  if (target !== Target.Self) {
    window.open(destUrl, target, 'noopener,noreferrer');
    return;
  }
  if (isExternalUrl(destUrl)) {
    window.location.assign(destUrl);
    return;
  }
  try {
    pushWithBrowserHistory(destUrl);
  } catch (error) {
    logger.error('[navigation] Failed to update browser history:', error);
    window.location.assign(destUrl);
  }
}
