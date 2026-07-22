import type { Locale } from 'antd/es/locale';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import zhHK from 'antd/es/locale/zh_HK';

import type { AppLanguage } from './languages';

const localeMap: Record<AppLanguage, Locale> = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
};

export function getAntdLocale(language: AppLanguage): Locale {
  return localeMap[language];
}
