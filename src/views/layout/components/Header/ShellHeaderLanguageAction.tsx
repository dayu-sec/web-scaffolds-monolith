import { Button, Dropdown, type MenuProps } from 'antd';
import { Languages } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  changeLanguagePreference,
  getLanguagePreference,
  i18n,
  type LanguagePreference,
  SUPPORTED_LANGUAGES,
} from '@/locales';

/** 渲染语言切换操作。 */
export default function ShellHeaderLanguageAction() {
  const [currentLang, setCurrentLang] = useState<LanguagePreference>(getLanguagePreference());

  useEffect(() => {
    /**
     * 同步 i18next 当前语言到按钮选中态。
     */
    function handleChange() {
      setCurrentLang(getLanguagePreference());
    }

    i18n.on('languageChanged', handleChange);
    return () => {
      i18n.off('languageChanged', handleChange);
    };
  }, []);

  const items: MenuProps['items'] = useMemo(() => {
    return SUPPORTED_LANGUAGES.map((lang) => ({
      key: lang.code,
      label: lang.label,
    }));
  }, []);

  /**
   * 处理用户选择语言后的主应用语言切换和跨应用事件发布。
   */
  const onClick: MenuProps['onClick'] = (info) => {
    if (!info.key || info.key === currentLang) return;

    const nextPreference = info.key as LanguagePreference;
    const previousLanguage = i18n.resolvedLanguage;
    void changeLanguagePreference(nextPreference).then((resolvedLanguage) => {
      setCurrentLang(nextPreference);
      window.dy?.eventChannel?.emit('locale-changed', {
        oldLocale: previousLanguage,
        newLocale: resolvedLanguage,
        source: 'main-app',
      });
    });
  };

  return (
    <Dropdown trigger={['click']} placement="bottomRight" menu={{ items, onClick, selectedKeys: [currentLang] }}>
      <Button
        aria-label="language switcher"
        className="dy-sec-shell-action-button"
        role="button"
        icon={<Languages className="dy-sec-shell-action-icon" size="1em" />}
        type="text"
        size="small"
      />
    </Dropdown>
  );
}
