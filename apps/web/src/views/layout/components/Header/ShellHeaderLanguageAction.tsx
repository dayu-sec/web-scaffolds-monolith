import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Check, Languages } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    function handleChange() {
      setCurrentLang(getLanguagePreference());
    }

    i18n.on('languageChanged', handleChange);
    return () => {
      i18n.off('languageChanged', handleChange);
    };
  }, []);

  const handleLanguageChange = (nextPreference: LanguagePreference) => {
    if (nextPreference === currentLang) return;
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="切换语言"
        render={<Button className="dy-sec-shell-action-button" size="icon" variant="ghost" />}
      >
        <Languages data-icon="inline-start" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40" sideOffset={8}>
        <DropdownMenuGroup>
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => {
                handleLanguageChange(language.code);
              }}
            >
              <span className="flex-1">{language.label}</span>
              {language.code === currentLang ? <Check aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
