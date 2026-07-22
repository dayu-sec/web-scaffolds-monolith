export type AppLanguage = 'zh-CN' | 'zh-HK' | 'en-US';
export type LanguagePreference = AppLanguage | 'auto';

export interface LanguageOption {
  code: LanguagePreference;
  labelKey: string;
  label: string;
  isAuto?: boolean;
  isDefault?: boolean;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'auto', label: '跟随浏览器语言', labelKey: 'language_auto', isAuto: true, isDefault: true },
  { code: 'zh-CN', label: '简体中文', labelKey: 'language_zh_cn' },
  { code: 'zh-HK', label: '繁體中文', labelKey: 'language_zh_hk' },
  { code: 'en-US', label: 'English', labelKey: 'language_en_us' },
];

/** 保留源主应用对公共组件暴露的语言列表名称。 */
export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS;
export const LANGUAGE_CODES: AppLanguage[] = ['zh-CN', 'zh-HK', 'en-US'];
export type LanguageType = LanguagePreference;

const LANGUAGE_PREFERENCE_KEY = 'cssp-language-preference';
const appLanguageSet = new Set<AppLanguage>(['zh-CN', 'zh-HK', 'en-US']);

export function isAppLanguage(value: string): value is AppLanguage {
  return appLanguageSet.has(value as AppLanguage);
}

/** 将浏览器区域语言收敛到应用实际提供资源的三种语言。 */
export function resolveBrowserLanguage(language = window.navigator.language): AppLanguage {
  if (language.startsWith('zh')) {
    return /(?:TW|HK|Hant)/i.test(language) ? 'zh-HK' : 'zh-CN';
  }
  return 'en-US';
}

export function getLanguagePreference(): LanguagePreference {
  const stored = window.localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  return stored === 'auto' || (stored && isAppLanguage(stored)) ? stored : 'auto';
}

export function setLanguagePreference(preference: LanguagePreference): void {
  window.localStorage.setItem(LANGUAGE_PREFERENCE_KEY, preference);
}

export function resolveLanguagePreference(preference: LanguagePreference): AppLanguage {
  return preference === 'auto' ? resolveBrowserLanguage() : preference;
}

export function getDefaultLanguage(): LanguageOption {
  return LANGUAGE_OPTIONS.find((language) => language.isDefault) ?? LANGUAGE_OPTIONS[0];
}

export function getBrowserLanguage(): AppLanguage {
  return resolveBrowserLanguage();
}
