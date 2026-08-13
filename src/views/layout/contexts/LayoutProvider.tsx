import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { DEFAULT_PRIMARY_COLOR } from '@/theme';

import { layoutSettingsSchema } from '../schemas/layout-settings';
import type { LayoutSettings, ShellLayoutMode } from '../types/layout';
import { restoreLayoutSettings } from '../utils/restore-layout-settings';
import { LayoutContext } from './layout-context';

const STORAGE_KEY = 'layout-settings';

interface LayoutProviderState {
  hasStoredSettings: boolean;
  settings: LayoutSettings;
}

interface LayoutProviderProps {
  /** 应用配置声明的默认布局。 */
  defaultLayout: ShellLayoutMode;
  /** 应用配置声明的 mix 顶部菜单默认位置。 */
  defaultCenterTopMenu: boolean;
  children: ReactNode;
}

/** 根据应用显式传入的默认值创建完整布局设置。 */
function createDefaultSettings(defaultLayout: ShellLayoutMode, defaultCenterTopMenu: boolean): LayoutSettings {
  return {
    breadcrumbPlacement: 'header',
    centerTopMenu: defaultCenterTopMenu,
    fixedHeader: false,
    fixedSidebar: true,
    layout: defaultLayout,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    splitMenus: false,
    theme: 'light',
  };
}

/** 提供应用级布局设置，并对旧或非法持久化值做确定性回退。 */
export function LayoutProvider({ children, defaultCenterTopMenu, defaultLayout }: LayoutProviderProps) {
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
