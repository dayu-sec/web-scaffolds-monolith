import { Typography } from 'antd';

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

  return (
    <Typography.Text className="dy-sec-shell-brand__title" ellipsis>
      {title}
    </Typography.Text>
  );
}
