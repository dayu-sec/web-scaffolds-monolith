import type { ReactNode } from 'react';

interface ShellContentProps {
  /**
   * 当前主应用页面或微应用挂载内容。
   */
  children: ReactNode;
}

/** 渲染业务内容承载区。 */
export default function ShellContent({ children }: ShellContentProps) {
  return (
    <section className="dy-sec-shell-content">
      <div className="dy-sec-shell-content__inner">{children}</div>
    </section>
  );
}
