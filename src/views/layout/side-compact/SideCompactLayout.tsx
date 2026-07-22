import ShellLayoutRoot from '../ShellLayoutRoot';
import type { ShellLayoutProps } from '../types';

/**
 * 左侧全量导航紧凑布局：品牌和全量菜单都放在左侧 aside。
 */
export default function SideCompactLayout(props: ShellLayoutProps) {
  return <ShellLayoutRoot layoutMode="side-compact" {...props} />;
}
