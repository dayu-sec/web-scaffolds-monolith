import './ShellFallback.module.css';

import { Button, Spin } from 'antd';

import type { ShellFallbackKind, ShellFallbackState } from '@/types/shell';

interface ShellFallbackProps {
  /**
   * 主应用当前需要展示的降级状态。
   */
  state: ShellFallbackState;
  /**
   * 可恢复场景下的重试或跳转动作。
   */
  onRetry?: () => void;
}

const fallbackCopy: Record<
  ShellFallbackKind,
  { status?: '403' | '404' | '500' | 'warning'; title: string; message: string }
> = {
  loading: {
    title: '应用配置加载中',
    message: '正在准备主应用运行环境。',
  },
  'missing-menu': {
    status: '500',
    title: '菜单配置不可用',
    message: '主应用无法读取或识别菜单配置。',
  },
  'not-found': {
    status: '404',
    title: '页面不存在',
    message: '当前路径没有匹配的应用页面。',
  },
  'route-error': {
    status: '500',
    title: '页面加载失败',
    message: '页面渲染出现异常，请重试或返回入口。',
  },
  'auth-expired': {
    status: '403',
    title: '登录状态已失效',
    message: '请重新完成访问恢复后继续使用。',
  },
  'permission-denied': {
    status: '403',
    title: '权限不足',
    message: '当前账号没有访问该资源的权限。',
  },
  'resource-recovery': {
    status: 'warning',
    title: '资源恢复中',
    message: '检测到静态资源加载异常，正在尝试刷新恢复。',
  },
};

/**
 * 根据主应用降级状态渲染加载、错误、权限和恢复提示（简易文字类型）。
 */
export default function ShellFallback({ state, onRetry }: ShellFallbackProps) {
  const copy = fallbackCopy[state.kind];
  const title = state.title ?? copy.title;
  const message = state.message ?? copy.message;
  const actionLabel = state.actionLabel ?? '重试';

  if (state.kind === 'loading') {
    return (
      <div className="dy-sec-shell-fallback dy-sec-shell-fallback--loading">
        <Spin size="large" />
        <div className="dy-sec-shell-fallback__title">{title}</div>
        <div className="dy-sec-shell-fallback__message">{message}</div>
      </div>
    );
  }

  return (
    <div className="dy-sec-shell-fallback">
      <div className="dy-sec-shell-fallback__content">
        <div className="dy-sec-shell-fallback__title">{title}</div>
        <div className="dy-sec-shell-fallback__message">{message}</div>
        {onRetry && (
          <div className="dy-sec-shell-fallback__action">
            <Button type="primary" onClick={onRetry}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
