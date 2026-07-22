import { useNavigate } from 'react-router';

import SecurityOverviewView from '@/views/components/MssWorkspace/SecurityOverviewView';

/** 将首页快捷入口适配为 CSSP 业务视图的显式导航回调。 */
export default function SecurityOverviewRoute() {
  const navigate = useNavigate();

  return (
    <SecurityOverviewView
      onOpenExposure={() => void navigate('/exposure')}
      onOpenIncidents={() => void navigate('/incidents')}
      onOpenReports={() => void navigate('/reports')}
    />
  );
}
