import { useContext } from 'react';

import { LayoutContext } from '../contexts/layout-context';
import type { LayoutContextValue } from '../types/layout';

/** 读取布局设置；未挂载 Provider 时抛出明确的开发错误。 */
export function useLayoutSettings(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutSettings must be used within LayoutProvider');
  }
  return context;
}
