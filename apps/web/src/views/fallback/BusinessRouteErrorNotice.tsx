import { Alert, AlertAction, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { CircleAlert } from 'lucide-react';

import type { BusinessRouteErrorKind } from '@/routes/business-route-error';

interface BusinessRouteErrorNoticeProps {
  /** 当前业务内容区需要呈现的稳定错误类别。 */
  kind: BusinessRouteErrorKind;
  /** 重新执行当前路由加载过程。 */
  onRetry: () => void;
}

const noticeCopy: Record<BusinessRouteErrorKind, { description: string; title: string }> = {
  route: { description: '页面内容加载失败，请重新加载后重试。', title: '页面加载失败' },
  service: { description: '请稍后重新加载。', title: '服务异常' },
};

/** 在脚手架 Shell 内容区呈现路由错误，保留导航和内容出口结构。 */
export default function BusinessRouteErrorNotice({ kind, onRetry }: BusinessRouteErrorNoticeProps) {
  const copy = noticeCopy[kind];

  return (
    <Alert className="m-4" variant={kind === 'service' ? 'destructive' : 'default'}>
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{copy.description}</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" onClick={onRetry}>
          重新加载
        </Button>
      </AlertAction>
    </Alert>
  );
}
