import { Flex } from 'antd';
import type { ReactNode } from 'react';

import ShellAsideCollapseButton from '../Aside/ShellAsideCollapseButton';
import ShellActionSlot from '../Slots/ShellActionSlot';
import ShellHeaderLanguageAction from './ShellHeaderLanguageAction';
import ShellHeaderNotificationAction from './ShellHeaderNotificationAction';
import ShellHeaderThemeAction from './ShellHeaderThemeAction';
import ShellHeaderUserAction from './ShellHeaderUserAction';

interface ShellHeaderProps {
  /**
   * side 系列布局放入 Header 中间列的面包屑；top/mix 的中间区域继续由横向菜单占用。
   */
  breadcrumb?: ReactNode;
  /**
   * 左侧菜单是否处于折叠状态。
   */
  collapsed: boolean;
  /**
   * 自定义 Header 中间区域，通常用于 top 横向菜单。
   */
  center?: ReactNode;
  /**
   * 左侧菜单折叠状态变更回调。
   */
  onCollapse: (collapsed: boolean) => void;
  /**
   * 是否在 Header 左侧展示左侧菜单展开/折叠按钮。
   */
  showAsideCollapseButton: boolean;
  /**
   * 自定义 Header 左侧区域，mix/top 布局用于放置品牌区。
   */
  start?: ReactNode;
  /**
   * Header 左侧主区域的附加内容，适合承载非居中的 mix 顶部导航。
   */
  startExtra?: ReactNode;
  /** 稳定 start/end 插槽中的外部扩展内容。 */
  startContent?: ReactNode;
  endContent?: ReactNode;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onUserAction?: () => void;
}

function ShellHeaderStart({ collapsed, onCollapse, showAsideCollapseButton, start, startExtra }: ShellHeaderProps) {
  return (
    <ShellActionSlot slotName="header-start" className="dy-sec-shell-header__start">
      {start}
      {showAsideCollapseButton && <ShellAsideCollapseButton collapsed={collapsed} onCollapse={onCollapse} />}
      {startExtra}
    </ShellActionSlot>
  );
}

function ShellHeaderEnd({ endContent, notificationCount, onNotificationsClick, onUserAction }: ShellHeaderProps) {
  return (
    <ShellActionSlot slotName="header-end" className="dy-sec-shell-header__end">
      {endContent}
      <ShellHeaderNotificationAction count={notificationCount} onClick={onNotificationsClick} />
      <ShellHeaderThemeAction />
      <ShellHeaderLanguageAction />
      <ShellHeaderUserAction onClick={onUserAction} />
    </ShellActionSlot>
  );
}

/**
 * 组合 Header 左、中、右区域，不直接绑定某一种 Shell 布局。
 */
export default function ShellHeader({
  breadcrumb,
  center,
  collapsed,
  onCollapse,
  showAsideCollapseButton,
  start,
  startContent,
  startExtra,
  endContent,
  notificationCount,
  onNotificationsClick,
  onUserAction,
}: ShellHeaderProps) {
  return (
    <Flex className="dy-sec-shell-header" component="header" align="center" justify="space-between">
      <ShellHeaderStart
        collapsed={collapsed}
        onCollapse={onCollapse}
        showAsideCollapseButton={showAsideCollapseButton}
        start={start}
        startExtra={
          <>
            {startContent}
            {startExtra}
          </>
        }
      />
      {center && <div className="dy-sec-shell-header__center">{center}</div>}
      {breadcrumb && <div className="dy-sec-shell-header__breadcrumb">{breadcrumb}</div>}
      <ShellHeaderEnd
        collapsed={collapsed}
        endContent={endContent}
        notificationCount={notificationCount}
        onCollapse={onCollapse}
        onNotificationsClick={onNotificationsClick}
        onUserAction={onUserAction}
        showAsideCollapseButton={showAsideCollapseButton}
      />
    </Flex>
  );
}
