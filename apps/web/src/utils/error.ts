type ErrorRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === 'object' && value !== null;
}

/** 兼容 Axios response.status 与标准化错误自身的 status。 */
export function getErrorStatus(error: unknown): number | null {
  if (!isRecord(error)) return null;
  const response = isRecord(error.response) ? error.response : null;
  const status = response?.status ?? error.status;
  return typeof status === 'number' ? status : null;
}
