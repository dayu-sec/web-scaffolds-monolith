import { Empty, Result, Skeleton } from 'antd';

import type { NavigationSourceStatus } from '@/types/navigation';

interface ShellAsideMenuStateProps {
  /**
   * 导航加载状态。
   */
  status: NavigationSourceStatus;
}

/** 渲染左侧导航菜单的非成功状态。 */
export default function ShellAsideMenuState({ status }: ShellAsideMenuStateProps) {
  if (status === 'loading') {
    return <Skeleton className="dy-sec-shell-aside__state" active paragraph={{ rows: 6 }} title={false} />;
  }

  if (status === 'empty') {
    return <Empty className="dy-sec-shell-aside__state" image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无导航" />;
  }

  if (status === 'error') {
    return (
      <Result className="dy-sec-shell-aside__state" status="warning" title="导航加载失败" subTitle="请稍后刷新重试" />
    );
  }

  return null;
}
