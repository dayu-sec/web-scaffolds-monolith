/** Shell 支持的稳定布局模式，供运行时校验和类型推导共同复用。 */
export const SHELL_LAYOUT_MODES = ['mix', 'side', 'side-compact', 'top'] as const;

/** 面包屑允许挂载的 Shell 区域。 */
export const SHELL_BREADCRUMB_PLACEMENTS = ['content', 'header'] as const;

/** Shell 支持的主题模式。 */
export const SHELL_THEME_MODES = ['light', 'dark'] as const;

/** 主应用侧边导航默认断点，覆盖常见后台分屏和窄屏笔记本场景。 */
export const SHELL_ASIDE_BREAKPOINT = 'lg';
