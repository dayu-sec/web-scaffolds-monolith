import { createContext } from 'react';
import type { MenuConfig } from '@/services/menu/schema';

export interface MenuContextValue {
  originalMenuConfig: MenuConfig;
  translatedMenuConfig: MenuConfig | null;
}

export const MenuContext = createContext<MenuContextValue | undefined>(undefined);
