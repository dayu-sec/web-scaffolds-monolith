import { useNavigate } from 'react-router';

import AssetRiskView, { type AssetRiskSection } from '@/views/components/MssWorkspace/AssetRiskView';

/** 暴露面路由只负责子模块 URL 和服务工单导航适配。 */
export default function ExposureManagementRoute() {
  const navigate = useNavigate();

  function handleChangeSection(section: AssetRiskSection): void {
    void navigate(section === 'assets' ? '/assets' : '/exposure');
  }

  return (
    <AssetRiskView
      activeSection="exposure"
      onChangeSection={handleChangeSection}
      onOpenServiceCases={() => void navigate('/cases')}
    />
  );
}
