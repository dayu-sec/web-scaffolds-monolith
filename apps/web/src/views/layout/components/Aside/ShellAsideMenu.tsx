import type { NavigationItem, NavigationMatch, NavigationSourceStatus } from '@/types/navigation';
import ShellNavigationMenu from '../Menu/ShellNavigationMenu';
import ShellAsideMenuState from './ShellAsideMenuState';

interface ShellAsideMenuProps {
  /**
   * 是否处于折叠状态。
   */
  collapsed: boolean;
  /**
   * 导航加载状态。
   */
  status: NavigationSourceStatus;
  /**
   * 规范化后的导航树。
   */
  items: NavigationItem[];
  /**
   * 当前路径匹配结果。
   */
  match: NavigationMatch;
  /**
   * 触发导航的回调。
   */
  onNavigate: (item: NavigationItem) => void;
}

/**
 * 渲染左侧导航菜单。
 */
export default function ShellAsideMenu({ collapsed, status, items, match, onNavigate }: ShellAsideMenuProps) {
  if (status !== 'success') {
    return (
      <div className="dy-sec-shell-aside__menu">
        <ShellAsideMenuState status={status} />
      </div>
    );
  }

  return (
    <div className="dy-sec-shell-aside__menu">
      <ShellNavigationMenu
        className="dy-sec-shell-menu dy-sec-shell-menu--inline"
        collapsed={collapsed}
        items={items}
        match={match}
        mode="inline"
        onNavigate={onNavigate}
      />
    </div>
  );
}
