import '../styles/shell-layout.css';

import { Layout } from 'antd';
import { type CSSProperties, useMemo, useState } from 'react';

import { useLayoutSettings } from '../hooks/useLayoutSettings';
import useShellLayoutTokens from '../hooks/useShellLayoutTokens';
import useShellRootScope from '../hooks/useShellRootScope';
import type { ShellLayoutMode, ShellLayoutProps } from '../types/layout';
import { createShellAsideLayoutStyle } from '../utils/aside-layout';
import { resolveShellBreadcrumbPlacement } from '../utils/breadcrumb-placement';
import { shouldShowHeaderAsideCollapseButton } from '../utils/header-aside-collapse';
import { getShellTopNavigationPlacement } from '../utils/navigation-placement';
import { createShellNavigationProjection } from '../utils/navigation-projection';
import ShellAside from './Aside/ShellAside';
import ShellBrand from './Brand/ShellBrand';
import ShellBreadcrumb from './Breadcrumb/ShellBreadcrumb';
import ShellContent from './Content/ShellContent';
import ShellFooter from './Footer/ShellFooter';
import ShellHeader from './Header/ShellHeader';
import ShellNavigationMenu from './Menu/ShellNavigationMenu';

interface ShellLayoutRootProps extends ShellLayoutProps {
  /**
   * 当前 Shell 布局模式。运行时切换模式时保持同一个组件实例，避免卸载业务页面。
   */
  layoutMode: ShellLayoutMode;
}

type ShellLayoutRootStyle = CSSProperties & Record<`--dy-sec-shell-${string}`, string>;

/**
 * 渲染稳定的 Shell 根布局。不同布局模式只调整区域编排，不替换承载 Outlet 的组件树。
 */
export default function ShellLayoutRoot({
  layoutMode,
  logo,
  title,
  navigationStatus,
  navigationItems,
  navigationMatch,
  onNavigate,
  centerTopMenu = false,
  showHeaderAsideCollapseButton = false,
  children,
  footerContent,
  headerStartContent,
  headerEndContent,
  notificationCount,
  onNotificationsClick,
  onUserAction,
}: ShellLayoutRootProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { settings } = useLayoutSettings();
  const shellTokens = useShellLayoutTokens();
  const navigationProjection = useMemo(
    () => createShellNavigationProjection(layoutMode, navigationItems, navigationMatch, navigationStatus),
    [layoutMode, navigationItems, navigationMatch, navigationStatus]
  );
  const hasAside = navigationProjection.hasAside;
  const isSideCompactLayout = layoutMode === 'side-compact';
  const breadcrumbPlacement = resolveShellBreadcrumbPlacement(layoutMode, settings.breadcrumbPlacement);
  const topNavigationPlacement = getShellTopNavigationPlacement(layoutMode, centerTopMenu);
  const showHeaderCollapseButton = shouldShowHeaderAsideCollapseButton({
    enabled: showHeaderAsideCollapseButton,
    hasAside,
    layoutMode,
  });
  const hasTopNavigation = topNavigationPlacement !== 'hidden';
  const topNavigation =
    hasTopNavigation && navigationStatus === 'success' ? (
      <ShellNavigationMenu
        className="dy-sec-shell-menu dy-sec-shell-menu--horizontal"
        items={navigationProjection.topItems}
        match={navigationProjection.topMatch}
        mode="horizontal"
        onNavigate={onNavigate}
      />
    ) : null;
  const isMixTopMenuCentered = layoutMode === 'mix' && centerTopMenu;
  const shellClassName = [
    'dy-sec-shell',
    `dy-sec-shell--${layoutMode}`,
    layoutMode === 'mix' &&
      (isMixTopMenuCentered ? 'dy-sec-shell--mix-top-menu-centered' : 'dy-sec-shell--mix-top-menu-start'),
    breadcrumbPlacement === 'header' && 'dy-sec-shell--breadcrumb-header',
    settings.fixedHeader && 'dy-sec-shell--fixed-header',
    settings.fixedSidebar && hasAside && 'dy-sec-shell--fixed-sidebar',
  ]
    .filter(Boolean)
    .join(' ');
  const shellStyle = useMemo<ShellLayoutRootStyle>(
    () => ({
      ...shellTokens.style,
      ...createShellAsideLayoutStyle({
        collapsed,
        collapsedWidth: shellTokens.asideCollapsedWidth,
        hasAside,
        width: shellTokens.asideWidth,
      }),
    }),
    [collapsed, hasAside, shellTokens]
  );
  useShellRootScope({ layoutMode, style: shellStyle, theme: settings.theme });

  // 切换 top 布局会增删 aside，稳定 key 可避免 Main 因兄弟节点位移被 React 重建。
  return (
    <Layout className={shellClassName}>
      {hasAside && (
        <ShellAside
          key="aside"
          collapsed={collapsed}
          collapsedWidth={shellTokens.asideCollapsedWidth}
          logo={logo}
          title={title}
          status={navigationStatus}
          items={navigationProjection.asideItems}
          match={navigationProjection.asideMatch}
          onCollapse={setCollapsed}
          onNavigate={onNavigate}
          showBrand={isSideCompactLayout}
          showCollapseButton={hasAside}
          width={shellTokens.asideWidth}
        />
      )}
      <ShellHeader
        key="header"
        breadcrumb={
          breadcrumbPlacement === 'header' ? (
            <ShellBreadcrumb status={navigationStatus} trail={navigationMatch.breadcrumb} />
          ) : null
        }
        center={topNavigationPlacement === 'center' ? topNavigation : null}
        collapsed={collapsed}
        endContent={headerEndContent}
        notificationCount={notificationCount}
        onCollapse={setCollapsed}
        onNotificationsClick={onNotificationsClick}
        onUserAction={onUserAction}
        showAsideCollapseButton={showHeaderCollapseButton}
        start={
          !isSideCompactLayout ? (
            <ShellBrand collapsed={false} logo={logo} placement="header" title={title} />
          ) : undefined
        }
        startContent={headerStartContent}
        startExtra={topNavigationPlacement === 'start' ? topNavigation : null}
      />
      <Layout key="main" className="dy-sec-shell-main">
        {breadcrumbPlacement === 'content' ? (
          <ShellBreadcrumb status={navigationStatus} trail={navigationMatch.breadcrumb} />
        ) : null}
        <ShellContent>{children}</ShellContent>
        <ShellFooter footerContent={footerContent} />
      </Layout>
    </Layout>
  );
}
