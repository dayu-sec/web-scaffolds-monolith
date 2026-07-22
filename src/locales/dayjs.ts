import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

import dayjs from 'dayjs';

import type { AppLanguage } from './languages';

const dayjsLocaleMap: Record<AppLanguage, string> = {
  'en-US': 'en',
  'zh-CN': 'zh-cn',
  'zh-HK': 'zh-tw',
};

export function setupDayjsLocale(language: AppLanguage): void {
  dayjs.locale(dayjsLocaleMap[language]);
}
