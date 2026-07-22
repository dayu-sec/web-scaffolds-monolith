import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

/** 独立导出实例，避免全局 API、React 绑定和初始化配置互相循环依赖。 */
export const i18n = i18next.use(initReactI18next);
