import ShellLayoutRoot from '../ShellLayoutRoot';
import type { ShellLayoutProps } from '../types';

/**
 * 顶部导航布局：品牌、主菜单和全局操作都在 Header，内容区占据剩余空间。
 */
export default function TopLayout(props: ShellLayoutProps) {
  return <ShellLayoutRoot layoutMode="top" {...props} />;
}
