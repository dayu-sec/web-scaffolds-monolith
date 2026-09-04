import { type CSSProperties, useMemo } from 'react';
import { useLayoutSettings } from './useLayoutSettings';

type ShellLayoutTokenStyle = CSSProperties & Record<`--dy-sec-shell-${string}`, string>;

function toPx(value: number): string {
  return `${String(value)}px`;
}

export interface ShellLayoutTokens {
  asideWidth: number;
  asideCollapsedWidth: number;
  style: ShellLayoutTokenStyle;
}

/**
 * 将 DayuSec 蓝色语义令牌映射到稳定的 Shell 几何变量。
 *
 * 几何取舒适档：交互目标不低于 36px、留白宽松、正文可读性优先。
 * 内容工作区占据 Shell 剩余空间，不在此声明内容最大宽度。
 */
export default function useShellLayoutTokens(): ShellLayoutTokens {
  const { settings } = useLayoutSettings();

  return useMemo(() => {
    const asideCollapsedWidth = 72;
    const asideWidth = 240;

    return {
      asideWidth,
      asideCollapsedWidth,
      style: {
        '--dy-sec-shell-header-height': '64px',
        '--dy-sec-shell-aside-width': toPx(asideWidth),
        '--dy-sec-shell-aside-collapsed-width': toPx(asideCollapsedWidth),
        '--dy-sec-shell-line-width': '1px',
        '--dy-sec-shell-border-color': 'var(--border)',
        '--dy-sec-shell-bg': 'var(--background)',
        '--dy-sec-shell-surface': 'var(--shell-header)',
        // 侧栏不铺实色，透出 Shell 画布与背景光晕，靠 1px 弱边界与内容区分隔。
        '--dy-sec-shell-aside-surface': 'transparent',
        '--dy-sec-shell-aside-sub-surface': 'color-mix(in srgb, var(--card) 65%, transparent)',
        '--dy-sec-shell-aside-hover-surface': 'var(--sidebar-accent)',
        '--dy-sec-shell-menu-connector-color': 'var(--sidebar-border)',
        '--dy-sec-shell-menu-item-color': 'var(--muted-foreground)',
        '--dy-sec-shell-menu-item-selected-color': 'var(--primary)',
        '--dy-sec-shell-menu-active-marker-color': settings.primaryColor,
        '--dy-sec-shell-link-color': 'var(--primary)',
        '--dy-sec-shell-link-hover-color': 'color-mix(in srgb, var(--primary) 82%, var(--foreground))',
        '--dy-sec-shell-link-active-color': 'var(--foreground)',
        '--dy-sec-shell-button-primary-bg': settings.primaryColor,
        '--dy-sec-shell-button-primary-bg-hover': `color-mix(in srgb, ${settings.primaryColor} 84%, black)`,
        '--dy-sec-shell-button-primary-bg-active': `color-mix(in srgb, ${settings.primaryColor} 74%, black)`,
        '--dy-sec-shell-button-primary-color': 'var(--primary-foreground)',
        '--dy-sec-shell-button-default-bg': 'var(--card)',
        '--dy-sec-shell-button-default-bg-hover': 'var(--muted)',
        '--dy-sec-shell-button-default-border': 'var(--border)',
        '--dy-sec-shell-button-default-border-hover': 'var(--ring)',
        '--dy-sec-shell-button-default-color': 'var(--foreground)',
        '--dy-sec-shell-button-default-hover-color': 'var(--foreground)',
        '--dy-sec-shell-brand-padding-inline': '16px',
        '--dy-sec-shell-brand-collapsed-padding-inline': '12px',
        '--dy-sec-shell-brand-first-icon-inline-start': '16px',
        '--dy-sec-shell-logo-size': '32px',
        '--dy-sec-shell-title-color': 'var(--foreground)',
        '--dy-sec-shell-title-font-size': '18px',
        '--dy-sec-shell-title-font-weight': '600',
        '--dy-sec-shell-menu-padding': '12px',
        '--dy-sec-shell-menu-state-margin-block': '20px',
        '--dy-sec-shell-menu-item-height': '44px',
        '--dy-sec-shell-menu-item-radius': 'var(--radius-lg)',
        '--dy-sec-shell-menu-item-margin-block-end': '4px',
        '--dy-sec-shell-menu-item-font-size': '14px',
        '--dy-sec-shell-menu-item-font-weight': '500',
        '--dy-sec-shell-menu-item-selected-font-weight': '600',
        '--dy-sec-shell-menu-item-selected-surface': 'var(--card)',
        '--dy-sec-shell-menu-active-marker-width': '3px',
        '--dy-sec-shell-menu-active-marker-height': '24px',
        // 标记贴在菜单项内部左缘；菜单项 overflow 为 hidden，负偏移会被整条裁掉。
        '--dy-sec-shell-menu-active-marker-left': '0px',
        '--dy-sec-shell-menu-active-marker-radius': '3px',
        '--dy-sec-shell-menu-icon-size': '18px',
        '--dy-sec-shell-menu-icon-gap': '8px',
        '--dy-sec-shell-menu-top-level-icon-inline-start': '12px',
        '--dy-sec-shell-collapse-padding': '12px',
        '--dy-sec-shell-collapse-button-color': 'var(--muted-foreground)',
        '--dy-sec-shell-collapse-button-hover-color': 'var(--foreground)',
        '--dy-sec-shell-collapse-button-active-color': 'var(--foreground)',
        '--dy-sec-shell-action-icon-size': '20px',
        '--dy-sec-shell-action-button-size': '40px',
        '--dy-sec-shell-action-button-color': 'var(--muted-foreground)',
        '--dy-sec-shell-action-button-hover-color': 'var(--foreground)',
        '--dy-sec-shell-header-padding-inline': '24px',
        '--dy-sec-shell-header-avatar-color': 'var(--muted-foreground)',
        '--dy-sec-shell-breadcrumb-padding-block-start': '16px',
        '--dy-sec-shell-content-padding-block': '32px',
        '--dy-sec-shell-content-padding-inline': '32px',
        '--dy-sec-shell-footer-padding-block-start': '16px',
        '--dy-sec-shell-footer-padding-block-end': '24px',
        '--dy-sec-shell-footer-padding-inline': '32px',
      },
    };
  }, [settings.primaryColor]);
}
