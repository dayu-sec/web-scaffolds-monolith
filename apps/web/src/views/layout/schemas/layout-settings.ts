import { z } from 'zod';

import { SHELL_BREADCRUMB_PLACEMENTS, SHELL_LAYOUT_MODES, SHELL_THEME_MODES } from '../constants/layout';

/** 校验本地持久化和运行时更新进入布局子系统前的完整设置契约。 */
export const layoutSettingsSchema = z.strictObject({
  breadcrumbPlacement: z.enum(SHELL_BREADCRUMB_PLACEMENTS),
  layout: z.enum(SHELL_LAYOUT_MODES),
  centerTopMenu: z.boolean(),
  theme: z.enum(SHELL_THEME_MODES),
  primaryColor: z.string().trim().min(1),
  splitMenus: z.boolean(),
});
