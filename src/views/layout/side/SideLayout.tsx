import ShellLayoutRoot from '../ShellLayoutRoot';
import type { ShellLayoutProps } from '../types';

/**
 * 左侧全量导航布局：顶部展示品牌和操作区，下方左侧展示全量菜单，右侧展示内容。
 */
export default function SideLayout(props: ShellLayoutProps) {
  return <ShellLayoutRoot layoutMode="side" {...props} />;
}
