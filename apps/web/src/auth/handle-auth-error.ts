import { SHELL_AUTH_ERROR_EVENT, type ShellAuthErrorDetail } from '@/types/shell';
import { getAccessRecoveryUrl, isAccessRecoveryPath } from './routes';

type ErrorRecord = Record<string, unknown>;

const AUTH_ERROR_DEDUPE_MS = 1500;
let lastAuthErrorKey: string | null = null;
let lastAuthErrorTime = 0;

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === 'object' && value !== null;
}

/** 兼容 Axios response.status 与标准化错误自身的 status。 */
function getHttpStatus(error: unknown): number | null {
  if (!isRecord(error)) return null;
  const response = isRecord(error.response) ? error.response : null;
  const status = response?.status ?? error.status;
  return typeof status === 'number' ? status : null;
}

function shouldEmitAuthError(key: string): boolean {
  const now = Date.now();
  if (lastAuthErrorKey === key && now - lastAuthErrorTime < AUTH_ERROR_DEDUPE_MS) return false;
  lastAuthErrorKey = key;
  lastAuthErrorTime = now;
  return true;
}

/** 将平台请求的 401/403 转换为 Shell 可处理的访问恢复事件。 */
export function handleAuthOrPermissionError(error: unknown): boolean {
  const status = getHttpStatus(error);
  if (status !== 401 && status !== 403) return false;

  const kind: ShellAuthErrorDetail['kind'] = status === 401 ? 'auth-expired' : 'permission-denied';
  const recoveryUrl = status === 401 && !isAccessRecoveryPath() ? getAccessRecoveryUrl() : undefined;
  const dedupeKey = `${kind}:${recoveryUrl ?? window.location.pathname}`;
  if (!shouldEmitAuthError(dedupeKey)) return true;

  window.dispatchEvent(
    new CustomEvent<ShellAuthErrorDetail>(SHELL_AUTH_ERROR_EVENT, {
      detail: { kind, recoveryUrl, status },
    })
  );
  return true;
}
