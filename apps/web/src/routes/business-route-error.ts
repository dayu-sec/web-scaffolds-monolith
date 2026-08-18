import { getErrorStatus } from '@/utils/error';

/** 业务路由异常仅按本地稳定类型分类，不读取任意错误对象的字段或文案。 */
export type BusinessRouteErrorKind = 'route' | 'service';

export function resolveBusinessRouteErrorKind(error: unknown): BusinessRouteErrorKind {
  return getErrorStatus(error) !== null ? 'service' : 'route';
}
