import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  changeLanguagePreference,
  getLanguagePreference,
  i18n,
  type LanguagePreference,
  SUPPORTED_LANGUAGES,
} from '@/locales';

/**
 * 语言配置页面组件 (LanguageSettingsPage)
 *
 * 职责与边界：
 * 1. 仅提供基础下拉选择组件供手动切换系统语言偏好；
 * 2. 页面不在主导航菜单中显示，供用户直接通过 URL (/settings/language) 访问；
 * 3. 语言切换后即时持久化到本地存储并广播通知全局事件通道。
 */
export default function LanguageSettingsPage() {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<LanguagePreference>(getLanguagePreference());

  // 监听外部全局语言变化，保持组件内选中态同步
  useEffect(() => {
    const handleChange = () => {
      setCurrentLang(getLanguagePreference());
    };
    i18n.on('languageChanged', handleChange);
    return () => {
      i18n.off('languageChanged', handleChange);
    };
  }, []);

  // 处理下拉选择变更
  const handleLanguageChange = (value: string | null) => {
    if (!value || value === currentLang) return;

    const nextPreference = value as LanguagePreference;
    const previousLanguage = i18n.resolvedLanguage;

    void (async () => {
      const resolvedLanguage = await changeLanguagePreference(nextPreference);
      setCurrentLang(nextPreference);
      window.dy?.eventChannel?.emit('locale-changed', {
        oldLocale: previousLanguage,
        newLocale: resolvedLanguage,
        source: __APP_NAME__,
      });
      const successMessage = i18n.t('languageSettings.savedSuccess', {
        lng: resolvedLanguage,
        defaultValue:
          resolvedLanguage === 'en-US'
            ? 'Language preference saved and applied'
            : resolvedLanguage === 'zh-HK'
              ? '語言偏好已儲存並生效'
              : '语言偏好已保存并生效',
      });
      toast.success(successMessage);
    })();
  };

  return (
    <div className="w-full max-w-xl py-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('languageSettings.title', '语言配置')}</CardTitle>
          <CardDescription>
            {t('languageSettings.preferenceCardDescription', '选择系统显示语言，偏好将保存在当前浏览器中')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <label htmlFor="language-select" className="text-sm font-medium text-foreground">
              {t('languageSettings.preferenceCardTitle', '界面语言')}
            </label>
            <Select id="language-select" value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t('actions.select', '请选择语言')}>
                  {SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLang)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
