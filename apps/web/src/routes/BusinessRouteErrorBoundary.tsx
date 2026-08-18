import { useRouteError } from 'react-router';

import BusinessRouteErrorNotice from '@/views/fallback/BusinessRouteErrorNotice';

import { resolveBusinessRouteErrorKind } from './business-route-error';

/** 将脚手架业务路由的 loader 与渲染异常限制在已经建立的 Shell 内容区。 */
export default function BusinessRouteErrorBoundary() {
  const error = useRouteError();
  console.error('[route] business page failed', error);

  return (
    <BusinessRouteErrorNotice
      kind={resolveBusinessRouteErrorKind(error)}
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}
