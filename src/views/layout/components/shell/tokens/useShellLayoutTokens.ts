import { getDySecTheme } from '@lrd/dy-sec-bizcom-theme';
import { theme } from 'antd';
import { type CSSProperties, useMemo } from 'react';

import { useLayoutSettings } from '@/hooks/useLayoutSettings';

type ShellLayoutTokenStyle = CSSProperties & Record<`--dy-sec-shell-${string}`, string>;

/**
 * 将 Ant Design 数值 Token 转为 CSS 长度。
 */
function toPx(value: number): string {
  return `${String(value)}px`;
}

export interface ShellLayoutTokens {
  /**
   * 左侧导航展开宽度。
   */
  asideWidth: number;
  /**
   * 左侧导航折叠宽度。
   */
  asideCollapsedWidth: number;
  /**
   * 注入到 Shell root scope 的 CSS 变量。
   */
  style: ShellLayoutTokenStyle;
}

/**
 * 基于 Ant Design Token 派生 Shell 布局变量。
 */
export default function useShellLayoutTokens(): ShellLayoutTokens {
  const { token } = theme.useToken();
  const { settings } = useLayoutSettings();

  return useMemo(() => {
    const menuIconSize = 16;
    const logoSize = 20;
    const asideCollapsedWidth = 54;
    const asideWidth = 240;
    const headerHeight = token.controlHeightLG + token.paddingXS * 2;
    const collapsedIconCenter = (asideCollapsedWidth - token.lineWidth) / 2;
    const brandFirstIconInlineStart = collapsedIconCenter - logoSize / 2;
    const dySecTheme = getDySecTheme(settings.theme);
    const { colors, components, shape, spacing, typography } = dySecTheme;

    return {
      asideWidth,
      asideCollapsedWidth,
      style: {
        '--dy-sec-shell-header-height': toPx(headerHeight),
        '--dy-sec-shell-aside-width': toPx(asideWidth),
        '--dy-sec-shell-aside-collapsed-width': toPx(asideCollapsedWidth),
        '--dy-sec-shell-line-width': toPx(token.lineWidth),
        '--dy-sec-shell-border-color': colors.border.weak,
        '--dy-sec-shell-bg': colors.background.canvas,
        '--dy-sec-shell-surface': colors.background.primary,
        '--dy-sec-shell-aside-surface': colors.background.primary,
        '--dy-sec-shell-aside-sub-surface': colors.background.elevated,
        '--dy-sec-shell-aside-hover-surface': colors.action.hover,
        '--dy-sec-shell-menu-connector-color': colors.border.strong,
        '--dy-sec-shell-menu-item-color': colors.text.secondary,
        '--dy-sec-shell-menu-item-selected-color': colors.text.primary,
        '--dy-sec-shell-menu-active-marker-color': colors.accent.main,
        '--dy-sec-shell-link-color': colors.text.link,
        '--dy-sec-shell-link-hover-color': colors.text.linkHover,
        '--dy-sec-shell-link-active-color': colors.text.maxContrast,
        '--dy-sec-shell-button-primary-bg': settings.primaryColor,
        '--dy-sec-shell-button-primary-bg-hover': colors.primary.hover,
        '--dy-sec-shell-button-primary-bg-active': colors.primary.active,
        '--dy-sec-shell-button-primary-color': colors.primary.contrastText,
        '--dy-sec-shell-button-default-bg': colors.secondary.main,
        '--dy-sec-shell-button-default-bg-hover': colors.secondary.hover,
        '--dy-sec-shell-button-default-border': colors.secondary.border,
        '--dy-sec-shell-button-default-border-hover': colors.border.strong,
        '--dy-sec-shell-button-default-color': colors.secondary.text,
        '--dy-sec-shell-button-default-hover-color': colors.secondary.text,
        '--dy-sec-shell-brand-padding-inline': '15px',
        '--dy-sec-shell-brand-collapsed-padding-inline': toPx(token.paddingXS - token.lineWidth * 2),
        '--dy-sec-shell-brand-first-icon-inline-start': toPx(brandFirstIconInlineStart),
        '--dy-sec-shell-logo-size': toPx(logoSize),
        '--dy-sec-shell-title-color': colors.text.primary,
        '--dy-sec-shell-title-font-size': typography.size.md,
        '--dy-sec-shell-title-font-weight': String(typography.fontWeightMedium),
        '--dy-sec-shell-menu-padding': '4px 8px 8px',
        '--dy-sec-shell-menu-state-margin-block': '16px',
        '--dy-sec-shell-menu-item-height': toPx(components.menu.itemHeight),
        '--dy-sec-shell-menu-item-radius': shape.radius.default,
        '--dy-sec-shell-menu-item-margin-block-end': '4px',
        '--dy-sec-shell-menu-active-marker-width': toPx(components.menu.activeMarkerWidth),
        '--dy-sec-shell-menu-active-marker-height': '24px',
        '--dy-sec-shell-menu-active-marker-left': '-4px',
        '--dy-sec-shell-menu-icon-size': toPx(menuIconSize),
        '--dy-sec-shell-menu-icon-gap': '8px',
        '--dy-sec-shell-menu-top-level-icon-inline-start': '8px',
        '--dy-sec-shell-collapse-padding': toPx(token.paddingXS),
        '--dy-sec-shell-collapse-button-color': colors.text.secondary,
        '--dy-sec-shell-collapse-button-hover-color': colors.text.primary,
        '--dy-sec-shell-collapse-button-active-color': colors.text.primary,
        '--dy-sec-shell-action-icon-size': toPx(menuIconSize),
        '--dy-sec-shell-action-button-size': toPx(components.height.md),
        '--dy-sec-shell-action-button-color': colors.text.secondary,
        '--dy-sec-shell-action-button-hover-color': colors.text.primary,
        '--dy-sec-shell-header-padding-inline': spacing.x2,
        '--dy-sec-shell-header-avatar-color': colors.text.secondary,
        '--dy-sec-shell-breadcrumb-padding-block-start': spacing.x1,
        '--dy-sec-shell-content-padding-block': spacing.x1,
        '--dy-sec-shell-content-padding-inline': spacing.x2,
        '--dy-sec-shell-footer-padding-block-start': toPx(token.paddingXS),
        '--dy-sec-shell-footer-padding-block-end': toPx(token.paddingSM),
        '--dy-sec-shell-footer-padding-inline': spacing.x2,
      },
    };
  }, [settings.primaryColor, settings.theme, token]);
}
