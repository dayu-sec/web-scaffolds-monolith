/**
 * 全局异常通知事件；不携带原始异常、错误码或远端文案。
 *
 * 请求错误已经由 `@dayu-sec/bizlib-request` 的 `normalizeError` 规范化并继续沿 Promise
 * 传播；业务侧按约定自行 catch 处理的异常不会走到这里。真正未被处理的异常（无论来自请求还是
 * 其他运行时错误）由 `configs/global-error.ts` 统一捕获后调用本函数，通知 Shell 展示一次
 * 通用反馈，不做来源区分，不额外包装、解析。
 */
export const EXCEPTION_NOTIFICATION_EVENT = 'shell:exception-notification';

export function notifyException(): void {
  window.dispatchEvent(new Event(EXCEPTION_NOTIFICATION_EVENT));
}
