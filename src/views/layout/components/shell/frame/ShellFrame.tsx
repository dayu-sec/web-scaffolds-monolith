import SideCompactLayout from '@/views/layout/side-compact/SideCompactLayout';
import type { ShellLayoutProps } from '@/views/layout/types';

/**
 * 兼容旧调用点的 ShellFrame。新布局模式直接使用 src/views/layout 下的具体 Layout。
 */
export default function ShellFrame(props: ShellLayoutProps) {
  return <SideCompactLayout {...props} />;
}
