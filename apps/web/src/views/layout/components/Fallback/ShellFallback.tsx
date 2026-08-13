import './ShellFallback.module.css';

import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { AlertTriangle, FileQuestion, LockKeyhole, RefreshCw } from 'lucide-react';

import type { ShellFallbackKind, ShellFallbackState } from '@/types/shell';

interface ShellFallbackProps {
  state: ShellFallbackState;
  onRetry?: () => void;
}

const fallbackCopy: Record<ShellFallbackKind, { title: string; message: string }> = {
  loading: { title: '应用配置加载中', message: '正在准备主应用运行环境。' },
  'missing-menu': { title: '菜单配置不可用', message: '主应用无法读取或识别菜单配置。' },
  'not-found': { title: '页面不存在', message: '当前路径没有匹配的应用页面。' },
  'route-error': { title: '页面加载失败', message: '页面渲染出现异常，请重试或返回入口。' },
  'auth-expired': { title: '登录状态已失效', message: '请重新完成访问恢复后继续使用。' },
  'permission-denied': { title: '权限不足', message: '当前账号没有访问该资源的权限。' },
  'resource-recovery': { title: '资源恢复中', message: '检测到静态资源加载异常，正在尝试刷新恢复。' },
};

function FallbackIcon({ kind }: { kind: ShellFallbackKind }) {
  if (kind === 'not-found') return <FileQuestion aria-hidden="true" />;
  if (kind === 'auth-expired' || kind === 'permission-denied') return <LockKeyhole aria-hidden="true" />;
  if (kind === 'resource-recovery') return <RefreshCw aria-hidden="true" />;
  return <AlertTriangle aria-hidden="true" />;
}

/** 根据主应用降级状态渲染加载、错误、权限和恢复提示。 */
export default function ShellFallback({ state, onRetry }: ShellFallbackProps) {
  const copy = fallbackCopy[state.kind];
  const title = state.title ?? copy.title;
  const message = state.message ?? copy.message;
  const actionLabel = state.actionLabel ?? '重试';

  if (state.kind === 'loading') {
    return (
      <div className="dy-sec-shell-fallback dy-sec-shell-fallback--loading">
        <Spinner className="size-6" />
        <div className="dy-sec-shell-fallback__title">{title}</div>
        <div className="dy-sec-shell-fallback__message">{message}</div>
      </div>
    );
  }

  return (
    <div className="dy-sec-shell-fallback">
      <div className="dy-sec-shell-fallback__content">
        <div className="dy-sec-shell-fallback__icon">
          <FallbackIcon kind={state.kind} />
        </div>
        <div className="dy-sec-shell-fallback__title">{title}</div>
        <div className="dy-sec-shell-fallback__message">{message}</div>
        {onRetry ? (
          <div className="dy-sec-shell-fallback__action">
            <Button onClick={onRetry}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
