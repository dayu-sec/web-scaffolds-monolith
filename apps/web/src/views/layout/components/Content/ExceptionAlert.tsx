import { Alert, AlertAction, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/toast';
import { CircleAlert, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import {
  type ExceptionFeedbackView,
  shouldClearContentAlert,
  shouldRenderContentAlert,
  shouldRenderToast,
} from '@/configs/exception-feedback';
import { EXCEPTION_NOTIFICATION_EVENT } from '@/configs/exception-notification';

const EXCEPTION_TITLE = '服务异常';
const EXCEPTION_DESCRIPTION = '部分功能暂不可用，请稍后重试。';

/**
 * 在稳定 Shell 的内容区顶部呈现未被页面局部状态接住的全局异常。
 *
 * 它不替代模块级错误态或重试动作，并会在用户进入另一内容视图时清除。
 */
export default function ExceptionAlert() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const previousView = useRef<ExceptionFeedbackView>({
    hash: location.hash,
    pathname: location.pathname,
    search: location.search,
  });

  useEffect(() => {
    const show = () => {
      if (shouldRenderToast()) {
        toast.add({ title: EXCEPTION_TITLE, type: 'error' });
        return;
      }
      if (shouldRenderContentAlert()) setVisible(true);
    };

    window.addEventListener(EXCEPTION_NOTIFICATION_EVENT, show);
    return () => {
      window.removeEventListener(EXCEPTION_NOTIFICATION_EVENT, show);
    };
  }, []);

  useEffect(() => {
    // 服务异常属于当前内容视图，不得在新路由、筛选或详情锚点中残留。
    const nextView: ExceptionFeedbackView = {
      hash: location.hash,
      pathname: location.pathname,
      search: location.search,
    };
    if (shouldClearContentAlert(previousView.current, nextView)) setVisible(false);
    previousView.current = nextView;
  }, [location.hash, location.pathname, location.search]);

  if (!visible) return null;

  return (
    <Alert className="mb-4 border-destructive/40 border-l-4 border-l-destructive bg-destructive/5 dark:bg-destructive/10">
      <CircleAlert aria-hidden="true" className="!text-destructive" />
      <AlertTitle className="font-medium text-foreground">{EXCEPTION_TITLE}</AlertTitle>
      <AlertDescription className="text-[12px] text-muted-foreground">{EXCEPTION_DESCRIPTION}</AlertDescription>
      <AlertAction>
        <Button
          aria-label="关闭服务异常提示"
          className="text-destructive/80 hover:bg-destructive/15 hover:text-destructive focus-visible:ring-destructive/30"
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            setVisible(false);
          }}
        >
          <X aria-hidden="true" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
