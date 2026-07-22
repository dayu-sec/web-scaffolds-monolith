import { Flex, Tag, Typography } from 'antd';

/** 单体应用首页业务视图，只验证 Shell 与文件路由基线，不承载未定义业务。 */
export default function HomeView() {
  return (
    <Flex className="cssp-page" vertical gap="middle">
      <div>
        <Typography.Title level={2}>CSSP</Typography.Title>
        <Typography.Paragraph type="secondary">
          单体 Web SPA 已就绪。业务页面由文件路径生成路由，并共享同一套布局、菜单和主题能力。
        </Typography.Paragraph>
      </div>
      <Flex gap="small" wrap="wrap">
        <Tag color="blue">React 19</Tag>
        <Tag color="geekblue">Ant Design 6</Tag>
        <Tag color="purple">文件路由</Tag>
        <Tag color="cyan">TypeScript strict</Tag>
      </Flex>
    </Flex>
  );
}
