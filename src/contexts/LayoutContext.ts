import { createContext } from 'react';
import { z } from 'zod';

export const layoutSettingsSchema = z.strictObject({
  breadcrumbPlacement: z.enum(['content', 'header']),
  layout: z.enum(['mix', 'side', 'side-compact', 'top']),
  centerTopMenu: z.boolean(),
  theme: z.enum(['light', 'dark']),
  primaryColor: z.string().trim().min(1),
  fixedHeader: z.boolean(),
  fixedSidebar: z.boolean(),
  splitMenus: z.boolean(),
});

export type LayoutSettings = z.output<typeof layoutSettingsSchema>;
/** 面包屑在 Header 或主内容区中的可配置位置。 */
export type BreadcrumbPlacement = LayoutSettings['breadcrumbPlacement'];
export type LayoutType = LayoutSettings['layout'];

/**
 * 将已持久化的布局设置合并到当前默认值；旧设置缺少的新字段由默认值补齐，
 * 非对象或不符合当前 Schema 的内容交由调用方回退到完整默认设置。
 */
export function restoreLayoutSettings(defaultSettings: LayoutSettings, storedSettings: unknown): LayoutSettings | null {
  if (typeof storedSettings !== 'object' || storedSettings === null || Array.isArray(storedSettings)) {
    return null;
  }

  const result = layoutSettingsSchema.safeParse({ ...defaultSettings, ...storedSettings });
  return result.success ? result.data : null;
}

export function isLayoutType(value: unknown): value is LayoutType {
  return typeof value === 'string' && ['mix', 'side', 'side-compact', 'top'].includes(value);
}

export interface LayoutContextValue {
  hasStoredSettings: boolean;
  settings: LayoutSettings;
  updateSettings: (patch: Partial<LayoutSettings>) => void;
  resetSettings: () => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);
