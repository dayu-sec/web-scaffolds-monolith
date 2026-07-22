import logger from '@seed-fe/logger';
import type { InitOptions } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import type { LocaleChangeEventData } from '@/types/events';

import { setupDayjsLocale } from './dayjs';
import { initGlobalLocale } from './globalI18n';
import { i18n } from './i18n-instance';
import {
  type AppLanguage,
  getLanguagePreference,
  isAppLanguage,
  LANGUAGE_CODES,
  type LanguagePreference,
  resolveLanguagePreference,
  setLanguagePreference,
} from './languages';

export * from './antd';
export * from './globalI18n';
export { i18n } from './i18n-instance';
export * from './languages';
export * from './t';

let globalLocaleListenerInstalled = false;

export const i18nInitOptions: InitOptions = {
  backend: { loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json` },
  defaultNS: 'common',
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
  lng: resolveLanguagePreference(getLanguagePreference()),
  ns: ['common', 'home', 'project-menu'],
  supportedLngs: LANGUAGE_CODES,
  missingKeyHandler: (_languages, _namespace, translationKey) => {
    if (import.meta.env.DEV && translationKey !== '404') {
      logger.warn(`[i18n] Missing translation key '${translationKey}' in language '${i18n.language}'`);
    }
  },
};

/** 初始化主应用语言、Day.js 和全局语言事件同步。 */
export async function setupI18n(): Promise<void> {
  await i18n.use(Backend).use(LanguageDetector).init(i18nInitOptions);
  const language = getCurrentLanguage();
  document.documentElement.lang = language;
  setupDayjsLocale(language);
  initGlobalLocale(getLanguagePreference());

  i18n.on('languageChanged', (nextLanguage) => {
    if (!isAppLanguage(nextLanguage)) return;
    document.documentElement.lang = nextLanguage;
    setupDayjsLocale(nextLanguage);
  });

  if (!globalLocaleListenerInstalled && window.dy?.eventChannel) {
    const handleGlobalLocaleChange = (data: LocaleChangeEventData) => {
      if (!isAppLanguage(data.newLocale) || data.newLocale === i18n.resolvedLanguage) return;
      void i18n.changeLanguage(data.newLocale).catch((error: unknown) => {
        logger.error('[主应用 I18n] 同步全局语言失败:', error);
      });
    };
    window.dy.eventChannel.on('locale-changed', handleGlobalLocaleChange);
    globalLocaleListenerInstalled = true;
  }
}

export async function changeLanguagePreference(preference: LanguagePreference): Promise<AppLanguage> {
  setLanguagePreference(preference);
  initGlobalLocale(preference);
  const language = resolveLanguagePreference(preference);
  await i18n.changeLanguage(language);
  return language;
}

export function getCurrentLanguage(): AppLanguage {
  const resolvedLanguage = i18n.resolvedLanguage;
  return resolvedLanguage && isAppLanguage(resolvedLanguage) ? resolvedLanguage : 'zh-CN';
}

export function getCurrentLocale(): string {
  return i18n.language;
}

export function initialLanguage(): AppLanguage {
  return getCurrentLanguage();
}
