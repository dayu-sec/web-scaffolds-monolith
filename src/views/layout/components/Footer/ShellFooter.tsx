import type { ReactNode } from 'react';

interface ShellFooterProps {
  /**
   * 底部区域内容，传入 false 时不渲染 Footer。
   */
  footerContent?: ReactNode | false;
}

/** 渲染可选底部区域。 */
export default function ShellFooter({ footerContent }: ShellFooterProps) {
  if (!footerContent) {
    return null;
  }

  return <footer className="dy-sec-shell-footer">{footerContent}</footer>;
}
