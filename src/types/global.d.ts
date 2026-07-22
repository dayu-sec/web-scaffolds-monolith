import type { EventChannel } from '@seed-fe/event-channel';

import type { LanguagePreference } from '@/locales/languages';
import type { Open } from '@/utils/route';

interface I18nAPI {
  getCurrentLocale: () => LanguagePreference;
  setCurrentLocale: (locale: LanguagePreference) => void;
}

declare global {
  /** 由 Vite 从 package.json 注入，供应用制品标识和运行时配置缓存键使用。 */
  const __APP_VERSION__: string;
  const __APP_NAME__: string;

  interface Window {
    dy?: {
      eventChannel?: EventChannel;
      i18n?: I18nAPI;
      shared?: {
        open: Open;
      };
    };
  }
}

export {};
