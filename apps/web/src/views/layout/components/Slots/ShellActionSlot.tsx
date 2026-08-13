import type { ReactNode } from 'react';

import type { ShellSlotName } from '@/types/navigation';

interface ShellActionSlotProps {
  /**
   * 当前插槽名称，用于提供稳定的挂载锚点。
   */
  slotName: ShellSlotName;
  /**
   * 插槽中渲染的默认内容或外部插入内容。
   */
  children?: ReactNode;
  /**
   * 追加到插槽容器上的样式类名。
   */
  className?: string;
}

/** 渲染 Shell 中的稳定插槽锚点。 */
export default function ShellActionSlot({ slotName, children, className }: ShellActionSlotProps) {
  return (
    <div id={`dy-sec-shell-slot-${slotName}`} className={className}>
      {children}
    </div>
  );
}
