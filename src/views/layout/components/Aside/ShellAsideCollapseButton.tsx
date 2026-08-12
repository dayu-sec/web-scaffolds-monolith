import { Button } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShellAsideCollapseButtonProps {
  /**
   * 是否处于折叠状态。
   */
  collapsed: boolean;
  /**
   * 折叠状态变更回调。
   */
  onCollapse: (collapsed: boolean) => void;
}

/** 渲染左侧导航折叠按钮。 */
export default function ShellAsideCollapseButton({ collapsed, onCollapse }: ShellAsideCollapseButtonProps) {
  return (
    <Button
      aria-label={collapsed ? '展开菜单' : '折叠菜单'}
      className="dy-sec-shell-collapse-button"
      type="text"
      size="small"
      icon={
        collapsed ? (
          <ChevronRight className="dy-sec-shell-action-icon" color="currentColor" size="1em" />
        ) : (
          <ChevronLeft className="dy-sec-shell-action-icon" color="currentColor" size="1em" />
        )
      }
      onClick={() => {
        onCollapse(!collapsed);
      }}
    />
  );
}
