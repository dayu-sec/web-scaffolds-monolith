import { Layout } from 'antd';

import type { NavigationItem, NavigationMatch, NavigationSourceStatus } from '@/types/navigation';

import { SHELL_ASIDE_BREAKPOINT } from '../../constants/layout';
import { useLayoutSettings } from '../../hooks/useLayoutSettings';
import ShellBrand from '../Brand/ShellBrand';
import ShellAsideCollapseButton from './ShellAsideCollapseButton';
import ShellAsideMenu from './ShellAsideMenu';

interface ShellAsideProps {
  /**
   * 是否处于折叠状态。
   */
  collapsed: boolean;
  /**
   * 折叠状态变更回调。
   */
  onCollapse: (collapsed: boolean) => void;
  /**
   * 左侧导航展开宽度。
   */
  width: number;
  /**
   * 左侧导航折叠宽度。
   */
  collapsedWidth: number;
  /**
   * 品牌 Logo 地址。
   */
  logo: string;
  /**
   * 品牌或项目标题。
   */
  title: string;
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
  /**
   * 是否在左侧导航底部展示展开/折叠按钮。
   */
  showCollapseButton: boolean;
  /**
   * 是否在侧边栏顶部展示品牌区。
   */
  showBrand?: boolean;
}

/**
 * 组合左侧 aside 区域，内部保留 AntD 侧栏组件的响应式折叠能力。
 */
export default function ShellAside({
  collapsed,
  onCollapse,
  width,
  collapsedWidth,
  logo,
  title,
  status,
  items,
  match,
  onNavigate,
  showCollapseButton,
  showBrand = true,
}: ShellAsideProps) {
  const { settings } = useLayoutSettings();

  return (
    <Layout.Sider
      breakpoint={SHELL_ASIDE_BREAKPOINT}
      className="dy-sec-shell-aside"
      collapsed={collapsed}
      collapsedWidth={collapsedWidth}
      collapsible
      onCollapse={(nextCollapsed) => {
        onCollapse(nextCollapsed);
      }}
      trigger={null}
      theme={settings.theme}
      width={width}
    >
      {showBrand && <ShellBrand collapsed={collapsed} logo={logo} placement="aside" title={title} />}
      <ShellAsideMenu collapsed={collapsed} status={status} items={items} match={match} onNavigate={onNavigate} />
      {showCollapseButton && (
        <div className="dy-sec-shell-aside__collapse">
          <ShellAsideCollapseButton collapsed={collapsed} onCollapse={onCollapse} />
        </div>
      )}
    </Layout.Sider>
  );
}
