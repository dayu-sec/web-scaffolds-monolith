import { useNavigate } from 'react-router';

import IncidentCenterView from '@/views/components/MssWorkspace/IncidentCenterView';

/** 将事件处置中的跨团队协作请求适配到服务工单路由。 */
export default function IncidentCenterRoute() {
  const navigate = useNavigate();

  return <IncidentCenterView onOpenServiceCases={() => void navigate('/cases')} />;
}
