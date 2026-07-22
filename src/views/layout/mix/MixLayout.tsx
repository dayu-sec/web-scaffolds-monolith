import ShellLayoutRoot from '../ShellLayoutRoot';
import type { ShellLayoutProps } from '../types';

/**
 * 混合导航布局：顶部展示一级菜单，下方左侧展示当前一级菜单的子菜单。
 */
export default function MixLayout(props: ShellLayoutProps) {
  return <ShellLayoutRoot layoutMode="mix" {...props} />;
}
