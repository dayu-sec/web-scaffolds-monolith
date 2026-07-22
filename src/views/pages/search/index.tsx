import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import LogSearchView from '@/views/components/LogSearch/LogSearchView';

/** 将日志检索文件路由的动态详情导航适配为业务视图回调。 */
export default function LogSearchRoute() {
  const navigate = useNavigate();
  const handleOpenTrace = useCallback(
    (traceId: string) => {
      void navigate(`/search/${encodeURIComponent(traceId)}`);
    },
    [navigate]
  );

  return <LogSearchView onOpenTrace={handleOpenTrace} />;
}
