import type { ReactNode } from 'react';

import type { MenuConfig } from '@/services/menu/schema';

import { MenuContext } from './MenuContext';

export interface MenuProviderProps {
  originalMenuConfig: MenuConfig;
  translatedMenuConfig: MenuConfig | null;
  children: ReactNode;
}

/** 保留源主应用“翻译菜单通过 Context 更新、Router 不重建”的数据流。 */
export function MenuProvider({ children, originalMenuConfig, translatedMenuConfig }: MenuProviderProps) {
  return <MenuContext.Provider value={{ originalMenuConfig, translatedMenuConfig }}>{children}</MenuContext.Provider>;
}
