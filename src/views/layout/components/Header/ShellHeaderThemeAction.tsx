import { Button, Tooltip } from 'antd';
import { Moon, Sun } from 'lucide-react';

import { useLayoutSettings } from '../../hooks/useLayoutSettings';

/**
 * 渲染主应用浅色/深色主题切换入口，并复用布局设置的本地持久化。
 */
export default function ShellHeaderThemeAction() {
  const { settings, updateSettings } = useLayoutSettings();
  const isDark = settings.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const label = isDark ? '切换为浅色主题' : '切换为深色主题';

  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        className="dy-sec-shell-action-button"
        icon={
          isDark ? (
            <Moon className="dy-sec-shell-action-icon" size="1em" />
          ) : (
            <Sun className="dy-sec-shell-action-icon" size="1em" />
          )
        }
        size="small"
        type="text"
        onClick={() => {
          updateSettings({ theme: nextTheme });
        }}
      />
    </Tooltip>
  );
}
