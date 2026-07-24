import { getDySecTheme } from '@dayu-sec/bizcom-theme';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { appConfig } from '@/config/app';

import {
  LayoutContext,
  type LayoutSettings,
  layoutSettingsSchema,
  type LayoutType,
  restoreLayoutSettings,
} from './LayoutContext';

const STORAGE_KEY = 'layout-settings';

interface LayoutProviderState {
  hasStoredSettings: boolean;
  settings: LayoutSettings;
}

interface LayoutProviderProps {
  defaultLayout?: LayoutType;
  defaultCenterTopMenu?: boolean;
  children: ReactNode;
}

function createDefaultSettings(defaultLayout: LayoutType, defaultCenterTopMenu: boolean): LayoutSettings {
  return {
    breadcrumbPlacement: 'header',
    centerTopMenu: defaultCenterTopMenu,
    fixedHeader: false,
    fixedSidebar: true,
    layout: defaultLayout,
    primaryColor: getDySecTheme('light').colors.primary.main,
    splitMenus: false,
    theme: 'light',
  };
}

/** 提供源主应用完整布局设置，并对旧或非法持久化值做确定性回退。 */
export function LayoutProvider({
  children,
  defaultCenterTopMenu = appConfig.centerTopMenu,
  defaultLayout = appConfig.defaultLayout,
}: LayoutProviderProps) {
  const defaultSettings = useMemo(
    () => createDefaultSettings(defaultLayout, defaultCenterTopMenu),
    [defaultCenterTopMenu, defaultLayout]
  );

  const getInitialState = (): LayoutProviderState => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return { hasStoredSettings: false, settings: defaultSettings };
      const parsed: unknown = JSON.parse(saved);
      const restoredSettings = restoreLayoutSettings(defaultSettings, parsed);
      if (!restoredSettings) return { hasStoredSettings: false, settings: defaultSettings };
      return { hasStoredSettings: true, settings: restoredSettings };
    } catch {
      return { hasStoredSettings: false, settings: defaultSettings };
    }
  };

  const [{ hasStoredSettings, settings }, setState] = useState<LayoutProviderState>(getInitialState);

  const updateSettings = useCallback((patch: Partial<LayoutSettings>) => {
    setState((current) => {
      const result = layoutSettingsSchema.safeParse({ ...current.settings, ...patch });
      if (!result.success) return current;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      } catch (error) {
        console.warn('[layout] Failed to persist settings:', error);
      }
      return { hasStoredSettings: true, settings: result.data };
    });
  }, []);

  const resetSettings = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[layout] Failed to clear settings:', error);
    }
    setState({ hasStoredSettings: false, settings: defaultSettings });
  }, [defaultSettings]);

  const value = useMemo(
    () => ({ hasStoredSettings, resetSettings, settings, updateSettings }),
    [hasStoredSettings, resetSettings, settings, updateSettings]
  );
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
