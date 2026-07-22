import { Button, Flex, Input, Typography } from 'antd';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export interface ExamplesViewProps {
  onOpenDetail: () => void;
}

/** 文件路由示例的业务视图，页面局部状态不依赖路由实现。 */
export default function ExamplesView({ onOpenDetail }: ExamplesViewProps) {
  const [draft, setDraft] = useState('');

  return (
    <Flex className="cssp-page" vertical gap="middle">
      <div>
        <Typography.Title level={2}>静态文件路由</Typography.Title>
        <Typography.Paragraph type="secondary">
          当前页面来自 views/pages/examples/index.tsx，对应路径 /examples。
        </Typography.Paragraph>
      </div>
      <Input
        aria-label="页面局部状态"
        placeholder="输入内容可验证布局切换不会卸载页面"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
      <Button icon={<ArrowRight size="1em" />} type="primary" onClick={onOpenDetail}>
        打开动态参数页面
      </Button>
    </Flex>
  );
}
