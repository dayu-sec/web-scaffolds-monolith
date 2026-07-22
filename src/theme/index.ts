import { createDySecTheme, getDySecAntdTheme, getDySecTheme } from '@lrd/dy-sec-bizcom-theme';
import { theme, type ThemeConfig } from 'antd';

import type { LayoutSettings } from '@/contexts/LayoutContext';

type ThemeMode = LayoutSettings['theme'];

/**
 * 将已发布的 DySec AntD 适配器接入主应用壳层。Layout 和 Popover 属于
 * 主应用自己的结构 token，因此只在这里补充，不复制主题包的基础 token。
 */
export function createAntdTheme(mode: ThemeMode, primaryColor?: string): ThemeConfig {
  const dySecTheme = primaryColor ? createDySecTheme({ mode, primaryColor }) : getDySecTheme(mode);
  const baseTheme = getDySecAntdTheme(dySecTheme);

  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: {
      ...baseTheme.components,
      Layout: {
        bodyBg: dySecTheme.colors.background.canvas,
        footerBg: dySecTheme.colors.background.canvas,
        headerBg: dySecTheme.colors.background.primary,
        siderBg: dySecTheme.colors.background.primary,
      },
      Popover: { colorBgElevated: dySecTheme.colors.background.elevated },
    },
    cssVar: { key: 'cssp' },
    token: {
      ...baseTheme.token,
      colorPrimary: dySecTheme.colors.primary.main,
    },
  };
}
