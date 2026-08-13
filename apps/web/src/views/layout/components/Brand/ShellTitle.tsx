interface ShellTitleProps {
  /**
   * 品牌或当前项目标题。
   */
  title?: string;
}

/** 渲染左侧应用名称。 */
export default function ShellTitle({ title }: ShellTitleProps) {
  if (!title) {
    return null;
  }

  return <span className="dy-sec-shell-brand__title">{title}</span>;
}
