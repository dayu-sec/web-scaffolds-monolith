import { useRouteError } from 'react-router';
import { ShellFallback } from '@/views/layout';

/** 将未知路由渲染异常收敛到通用失败，不从未知错误对象猜业务文案。 */
export default function PageErrorBoundary() {
  const error = useRouteError();
  console.error('[route] page rendering failed', error);
  return (
    <ShellFallback
      state={{ kind: 'route-error', actionLabel: '重新加载' }}
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}
