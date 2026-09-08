import LanguageSettingsPage from '@/views/components/settings/LanguageSettingsPage';

/** 语言配置路由入口：不在菜单中呈现，供用户手动输入 URL (/settings/language) 访问和配置系统语言。 */
export default function LanguageRoute() {
  return <LanguageSettingsPage />;
}
