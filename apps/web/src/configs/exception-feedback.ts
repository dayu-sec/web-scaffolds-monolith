/** 全局异常的反馈通道；默认使用内容区持久 Alert，而不是短暂 Toast。 */
export type ExceptionFeedbackMode = 'content-alert' | 'toast';

export interface ExceptionFeedbackView {
  readonly hash: string;
  readonly pathname: string;
  readonly search: string;
}

/** 默认模式需要保留故障事实，直到用户关闭或切换内容视图。 */
export const EXCEPTION_FEEDBACK_MODE: ExceptionFeedbackMode = 'content-alert';

export function shouldRenderContentAlert(mode: ExceptionFeedbackMode = EXCEPTION_FEEDBACK_MODE): boolean {
  return mode === 'content-alert';
}

export function shouldRenderToast(mode: ExceptionFeedbackMode = EXCEPTION_FEEDBACK_MODE): boolean {
  return mode === 'toast';
}

/** URL 的路径、查询或锚点变化都代表用户进入了新的内容上下文。 */
export function shouldClearContentAlert(previous: ExceptionFeedbackView, next: ExceptionFeedbackView): boolean {
  return previous.pathname !== next.pathname || previous.search !== next.search || previous.hash !== next.hash;
}
