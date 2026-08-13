import { Button } from '@workspace/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { Moon, Sun } from 'lucide-react';

import { useLayoutSettings } from '../../hooks/useLayoutSettings';

/** 渲染主应用浅色/深色主题切换入口，并复用布局设置的本地持久化。 */
export default function ShellHeaderThemeAction() {
  const { settings, updateSettings } = useLayoutSettings();
  const isDark = settings.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const label = isDark ? '切换为浅色主题' : '切换为深色主题';

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        onClick={() => {
          updateSettings({ theme: nextTheme });
        }}
        render={<Button className="dy-sec-shell-action-button" size="icon" variant="ghost" />}
      >
        {isDark ? <Moon data-icon="inline-start" /> : <Sun data-icon="inline-start" />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
