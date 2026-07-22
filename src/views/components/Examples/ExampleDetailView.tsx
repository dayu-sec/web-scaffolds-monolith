import { Descriptions, Flex, Typography } from 'antd';

export interface ExampleDetailViewProps {
  id: string;
}

/** 动态参数示例的业务视图，只消费路由适配层提供的参数。 */
export default function ExampleDetailView({ id }: ExampleDetailViewProps) {
  return (
    <Flex className="cssp-page" vertical gap="middle">
      <div>
        <Typography.Title level={2}>动态参数页面</Typography.Title>
        <Typography.Paragraph type="secondary">
          当前页面来自 views/pages/examples/[id].tsx，并由 React Router 提供参数。
        </Typography.Paragraph>
      </div>
      <Descriptions bordered column={1} size="small" title="路由信息">
        <Descriptions.Item label="参数 id">
          <Typography.Text code copyable>
            {id}
          </Typography.Text>
        </Descriptions.Item>
      </Descriptions>
    </Flex>
  );
}
