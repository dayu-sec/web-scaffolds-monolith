import { useNavigate } from 'react-router';

import ManagedServicesView from '@/views/components/MssWorkspace/ManagedServicesView';

/** 将托管服务联系入口适配到统一服务工单路由。 */
export default function ManagedServicesRoute() {
  const navigate = useNavigate();

  return <ManagedServicesView onOpenServiceCases={() => void navigate('/cases')} />;
}
