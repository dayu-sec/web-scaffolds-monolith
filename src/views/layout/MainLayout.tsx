import { Outlet } from 'react-router';

import { appConfig } from '@/configs/app';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useMenu } from '@/hooks/useMenu';

import ShellLayoutRoot from './ShellLayoutRoot';
import { useShellNavigation } from './useShellNavigation';

/** 组装单体 Shell；文件路由页面只通过稳定 Outlet 进入内容区。 */
export default function MainLayout() {
  const { hasStoredSettings, settings } = useLayoutSettings();
  const { originalMenuConfig } = useMenu();
  const navigation = useShellNavigation(originalMenuConfig);

  return (
    <ShellLayoutRoot
      centerTopMenu={settings.centerTopMenu}
      layoutMode={import.meta.env.DEV && hasStoredSettings ? settings.layout : appConfig.defaultLayout}
      logo={appConfig.logo}
      navigationItems={navigation.navigationItems}
      navigationMatch={navigation.navigationMatch}
      navigationStatus={navigation.navigationSource.status}
      title={appConfig.name}
      onNavigate={navigation.handleNavigate}
    >
      <Outlet />
    </ShellLayoutRoot>
  );
}
