const ACCESS_RECOVERY_PATH = '/login';

/** 读取当前路径作为登录恢复后的回跳地址。 */
export function getCurrentRelativeUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** 避免在登录恢复入口上继续递归拼接 redirect。 */
export function isAccessRecoveryPath(pathname = window.location.pathname): boolean {
  return pathname === ACCESS_RECOVERY_PATH || pathname.startsWith(`${ACCESS_RECOVERY_PATH}/`);
}

/** 生成带 redirect 参数的访问恢复地址。 */
export function getAccessRecoveryUrl(redirectUrl = getCurrentRelativeUrl()): string {
  const url = new URL(ACCESS_RECOVERY_PATH, window.location.origin);
  url.searchParams.set('redirect', redirectUrl);
  return `${url.pathname}${url.search}`;
}
