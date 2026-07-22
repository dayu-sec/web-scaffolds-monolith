/** 主应用内部语言变更事件。 */
export interface LocaleChangeEventData {
  oldLocale?: string;
  newLocale: string;
  source?: 'external' | 'main-app';
}

/** 平台用户登录事件契约，供后续认证模块接入。 */
export interface UserLoginEventData {
  userId: string;
  username: string;
  timestamp: number;
}

/** 单体应用就绪事件契约。 */
export interface AppReadyEventData {
  appName: string;
  version: string;
}
