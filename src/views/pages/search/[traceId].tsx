import { useNavigate, useParams } from 'react-router';

import LogDetailView from '@/views/components/LogSearch/LogDetailView';

/** 将动态 Trace 参数和返回导航适配为日志详情业务视图的 props。 */
export default function LogDetailRoute() {
  const navigate = useNavigate();
  const { traceId = '' } = useParams<{ traceId: string }>();

  return <LogDetailView traceId={traceId} onBack={() => void navigate('/search')} />;
}
