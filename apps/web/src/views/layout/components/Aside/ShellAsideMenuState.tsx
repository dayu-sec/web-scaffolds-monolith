import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { AlertTriangle, Compass } from 'lucide-react';

import type { NavigationSourceStatus } from '@/types/navigation';

interface ShellAsideMenuStateProps {
  status: NavigationSourceStatus;
}

/** 渲染左侧导航菜单的非成功状态。 */
export default function ShellAsideMenuState({ status }: ShellAsideMenuStateProps) {
  if (status === 'loading') {
    return (
      <div className="dy-sec-shell-aside__state flex flex-col gap-2" aria-label="导航加载中">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <Empty className="dy-sec-shell-aside__state border-0 p-3">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass />
          </EmptyMedia>
          <EmptyTitle>暂无导航</EmptyTitle>
          <EmptyDescription>当前项目没有可用菜单。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (status === 'error') {
    return (
      <Alert className="dy-sec-shell-aside__state" variant="destructive">
        <AlertTriangle />
        <AlertTitle>导航加载失败</AlertTitle>
        <AlertDescription>请稍后刷新重试。</AlertDescription>
      </Alert>
    );
  }

  return null;
}
