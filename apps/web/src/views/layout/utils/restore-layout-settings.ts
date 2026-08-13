import { layoutSettingsSchema } from '../schemas/layout-settings';
import type { LayoutSettings } from '../types/layout';

/**
 * 将持久化设置合并到当前默认值；缺少字段沿用默认值，非法对象交由 Provider 完整回退。
 */
export function restoreLayoutSettings(defaultSettings: LayoutSettings, storedSettings: unknown): LayoutSettings | null {
  if (typeof storedSettings !== 'object' || storedSettings === null || Array.isArray(storedSettings)) {
    return null;
  }

  const result = layoutSettingsSchema.safeParse({ ...defaultSettings, ...storedSettings });
  return result.success ? result.data : null;
}
