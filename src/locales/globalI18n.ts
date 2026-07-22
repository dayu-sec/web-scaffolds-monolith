import type { LanguagePreference } from './languages';
import { getLanguagePreference } from './languages';

export interface I18nAPI {
  getCurrentLocale: () => LanguagePreference;
  setCurrentLocale: (locale: LanguagePreference) => void;
}

class I18nManager {
  private currentLocale: LanguagePreference = getLanguagePreference();

  getCurrentLocale(): LanguagePreference {
    return this.currentLocale;
  }

  setCurrentLocale(locale: LanguagePreference): void {
    this.currentLocale = locale;
  }
}

const globalI18nManager = new I18nManager();

/** 暴露与源主应用一致的极简全局语言 API。 */
export function initGlobalI18nAPI(): I18nAPI {
  return {
    getCurrentLocale: () => globalI18nManager.getCurrentLocale(),
    setCurrentLocale: (locale) => {
      globalI18nManager.setCurrentLocale(locale);
    },
  };
}

export function initGlobalLocale(locale: LanguagePreference): void {
  globalI18nManager.setCurrentLocale(locale);
}
