import { createContext } from 'react';
import type { LayoutContextValue } from '../types/layout';

/** 布局子系统内部 Context；外部消费者通过公共 Hook 读取。 */
export const LayoutContext = createContext<LayoutContextValue | null>(null);
