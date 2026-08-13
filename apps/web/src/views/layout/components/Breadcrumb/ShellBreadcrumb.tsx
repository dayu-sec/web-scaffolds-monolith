import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Fragment } from 'react';

import type { BreadcrumbTrail, NavigationSourceStatus } from '@/types/navigation';

interface ShellBreadcrumbProps {
  status: NavigationSourceStatus;
  trail: BreadcrumbTrail;
}

/** 渲染从导航契约推导的面包屑。 */
export default function ShellBreadcrumb({ status, trail }: ShellBreadcrumbProps) {
  if (status === 'loading') {
    return (
      <div className="dy-sec-shell-breadcrumb">
        <Skeleton className="h-5 w-40" />
      </div>
    );
  }

  if (status === 'error') {
    return <div className="dy-sec-shell-breadcrumb text-muted-foreground">导航信息暂不可用</div>;
  }

  if (trail.items.length === 0) return null;

  return (
    <div className="dy-sec-shell-breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          {trail.items.map((item, index) => (
            <Fragment key={item.key}>
              <BreadcrumbItem>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
              {index < trail.items.length - 1 ? <BreadcrumbSeparator /> : null}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
