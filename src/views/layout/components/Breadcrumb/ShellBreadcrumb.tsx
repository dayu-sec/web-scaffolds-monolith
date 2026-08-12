import { Breadcrumb, Skeleton, Typography } from 'antd';

import type { BreadcrumbTrail, NavigationSourceStatus } from '@/types/navigation';

interface ShellBreadcrumbProps {
  /**
   * 当前导航来源状态。
   */
  status: NavigationSourceStatus;
  /**
   * 当前路径对应的面包屑。
   */
  trail: BreadcrumbTrail;
}

/** 渲染从导航契约推导的面包屑。 */
export default function ShellBreadcrumb({ status, trail }: ShellBreadcrumbProps) {
  if (status === 'loading') {
    return (
      <div className="dy-sec-shell-breadcrumb">
        <Skeleton.Input active size="small" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="dy-sec-shell-breadcrumb">
        <Typography.Text type="secondary">导航信息暂不可用</Typography.Text>
      </div>
    );
  }

  if (trail.items.length === 0) {
    return null;
  }

  return (
    <div className="dy-sec-shell-breadcrumb">
      <Breadcrumb items={trail.items.map((item) => ({ key: item.key, title: item.label }))} />
    </div>
  );
}
