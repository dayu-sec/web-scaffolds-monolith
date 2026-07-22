import {
  App as AntdApp,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  type TableProps,
  Timeline,
  Typography,
} from 'antd';
import { CirclePlus, FilterX, MessageSquareText, Search, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill, { type StatusPillTone } from '@/views/components/StatusPill/StatusPill';

import { initialServiceCases, type ServiceCase } from './mssData';
import styles from './MssWorkspace.module.css';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

type CaseStatusFilter = ServiceCase['status'] | 'all';

const caseStatusToneMap: Record<ServiceCase['status'], StatusPillTone> = {
  已解决: 'success',
  处理中: 'active',
  等待客户: 'warning',
};

const priorityToneMap: Record<ServiceCase['priority'], StatusPillTone> = {
  P1: 'danger',
  P2: 'warning',
  P3: 'active',
  P4: 'neutral',
};

interface ServiceCaseFormValues {
  description: string;
  priority: ServiceCase['priority'];
  title: string;
  type: ServiceCase['type'];
}

/** 服务工单列定义，保留服务请求编号、优先级和协作状态。 */
function createCaseColumns(onOpen: (serviceCase: ServiceCase) => void): TableProps<ServiceCase>['columns'] {
  return [
    {
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: ServiceCase['priority']) => <StatusPill label={priority} tone={priorityToneMap[priority]} />,
      title: '优先级',
      width: 92,
    },
    {
      key: 'case',
      render: (_value: unknown, record) => (
        <Button
          className={styles.tableLink}
          type="link"
          onClick={() => {
            onOpen(record);
          }}
        >
          <span>
            <span className={styles.tablePrimary}>{record.title}</span>
            <span className={styles.tableSecondary}>
              {record.key} · {record.type}
            </span>
          </span>
        </Button>
      ),
      title: '服务工单',
      width: 380,
    },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: ServiceCase['status']) => <StatusPill label={status} tone={caseStatusToneMap[status]} />,
      title: '状态',
      width: 112,
    },
    { dataIndex: 'requester', key: 'requester', title: '发起人', width: 120 },
    { dataIndex: 'owner', key: 'owner', title: '服务负责人', width: 176 },
    { dataIndex: 'updatedAt', key: 'updatedAt', title: '最近更新', width: 120 },
  ];
}

/** 服务工单详情展示客户与运营团队的双向协作记录。 */
function ServiceCaseDetail({ serviceCase }: { serviceCase: ServiceCase }) {
  const { message } = AntdApp.useApp();
  const [reply, setReply] = useState('');

  return (
    <Flex vertical gap="middle">
      <div className={styles.drawerSummary}>
        <Flex align="center" justify="space-between" gap="small" wrap="wrap">
          <span>
            <Text type="secondary">{serviceCase.key}</Text>
            <Title className={styles.drawerSectionTitle} level={4}>
              {serviceCase.title}
            </Title>
          </span>
          <Space>
            <StatusPill label={serviceCase.priority} tone={priorityToneMap[serviceCase.priority]} />
            <StatusPill label={serviceCase.status} tone={caseStatusToneMap[serviceCase.status]} />
          </Space>
        </Flex>
        <Paragraph type="secondary">
          {serviceCase.type} · 发起人 {serviceCase.requester} · 当前负责人 {serviceCase.owner}
        </Paragraph>
      </div>
      <Timeline
        items={[
          {
            children: (
              <span>
                <Text strong>{serviceCase.requester} 创建服务工单</Text>
                <Text className={styles.tableSecondary}>描述了期望结果、影响范围和紧急程度。</Text>
              </span>
            ),
            color: 'blue',
          },
          {
            children: (
              <span>
                <Text strong>{serviceCase.owner} 接单并开始处理</Text>
                <Text className={styles.tableSecondary}>已关联相关安全事件、资产和处置记录。</Text>
              </span>
            ),
            color: 'green',
          },
          {
            children: (
              <span>
                <Text strong>最近更新 · {serviceCase.updatedAt}</Text>
                <Text className={styles.tableSecondary}>
                  {serviceCase.status === '等待客户'
                    ? '等待客户补充变更窗口和资产负责人。'
                    : '服务团队正在准备下一步处理结果。'}
                </Text>
              </span>
            ),
            color: serviceCase.status === '等待客户' ? 'orange' : 'gray',
          },
        ]}
      />
      <div className={styles.drawerSection}>
        <Text strong>回复服务团队</Text>
        <TextArea
          showCount
          maxLength={500}
          placeholder="补充处理信息或向服务团队提问"
          rows={4}
          value={reply}
          onChange={(event) => {
            setReply(event.target.value);
          }}
        />
        <Flex justify="flex-end">
          <Button
            disabled={reply.trim().length === 0}
            icon={<Send aria-hidden size={15} />}
            type="primary"
            onClick={() => {
              setReply('');
              void message.success('回复已添加到静态演示时间线');
            }}
          >
            发送回复
          </Button>
        </Flex>
      </div>
    </Flex>
  );
}

/** 服务工单中心：支持本地创建、筛选和查看客户与 MSS 团队的协作记录。 */
export default function ServiceCasesView() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<ServiceCaseFormValues>();
  const [cases, setCases] = useState(initialServiceCases);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<CaseStatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);
  const columns = useMemo(() => createCaseColumns(setSelectedCase), []);

  const filteredCases = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return cases.filter((serviceCase) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        `${serviceCase.key} ${serviceCase.title} ${serviceCase.owner}`.toLowerCase().includes(normalizedKeyword);
      return matchesKeyword && (status === 'all' || serviceCase.status === status);
    });
  }, [cases, keyword, status]);

  function handleCreateServiceCase(values: ServiceCaseFormValues): void {
    const sequence = String(cases.length + 187).padStart(4, '0');
    const serviceCase: ServiceCase = {
      key: `SR-2026-${sequence}`,
      owner: '待分配',
      priority: values.priority,
      requester: '当前用户',
      status: '处理中',
      title: values.title,
      type: values.type,
      updatedAt: '刚刚',
    };
    setCases((current) => [serviceCase, ...current]);
    setCreateOpen(false);
    form.resetFields();
    void message.success(`服务工单 ${serviceCase.key} 已创建`);
  }

  return (
    <OperationalPage
      actions={
        <Button
          icon={<CirclePlus aria-hidden size={15} />}
          type="primary"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          创建服务工单
        </Button>
      }
      stateStrip={
        <div className={styles.stateStrip}>
          <StatusPill label="服务台在线" tone="success" />
          <Text type="secondary">P1 工单 7 × 24 响应，普通服务请求在工作时间处理。</Text>
        </div>
      }
    >
      <div className={styles.workspace}>
        <section aria-label="服务工单筛选" className={styles.filterPanel}>
          <div className={styles.filterBar}>
            <Input
              allowClear
              placeholder="搜索工单编号、标题或负责人"
              prefix={<Search aria-hidden size={15} />}
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
              }}
            />
            <Select<CaseStatusFilter>
              aria-label="按工单状态筛选"
              options={[
                { label: '全部状态', value: 'all' },
                { label: '处理中', value: '处理中' },
                { label: '等待客户', value: '等待客户' },
                { label: '已解决', value: '已解决' },
              ]}
              value={status}
              onChange={setStatus}
            />
            <Select
              aria-label="按工单类型筛选"
              defaultValue="all"
              options={[
                { label: '全部类型', value: 'all' },
                { label: '事件协查', value: '事件协查' },
                { label: '策略变更', value: '策略变更' },
                { label: '风险咨询', value: '风险咨询' },
                { label: '服务支持', value: '服务支持' },
              ]}
            />
            <Button
              className={styles.filterActions}
              icon={<FilterX aria-hidden size={15} />}
              onClick={() => {
                setKeyword('');
                setStatus('all');
              }}
            >
              重置
            </Button>
          </div>
        </section>
        <DataPanel meta={`当前显示 ${String(filteredCases.length)} 个服务工单`} title="我的服务请求">
          <Table<ServiceCase>
            columns={columns}
            dataSource={filteredCases}
            locale={{ emptyText: '没有符合当前筛选条件的服务工单' }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowKey="key"
            scroll={{ x: 1040 }}
            size="small"
          />
        </DataPanel>
      </div>

      <Modal
        destroyOnHidden
        okText="创建工单"
        open={createOpen}
        title="创建服务工单"
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <Form<ServiceCaseFormValues>
          className={styles.modalForm}
          form={form}
          initialValues={{ priority: 'P3', type: '服务支持' }}
          layout="vertical"
          onFinish={handleCreateServiceCase}
        >
          <Form.Item label="请求标题" name="title" rules={[{ message: '请输入请求标题', required: true }]}>
            <Input placeholder="简要描述希望服务团队协助的事项" />
          </Form.Item>
          <Flex gap="middle">
            <Form.Item label="请求类型" name="type" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select
                options={[
                  { label: '事件协查', value: '事件协查' },
                  { label: '策略变更', value: '策略变更' },
                  { label: '风险咨询', value: '风险咨询' },
                  { label: '服务支持', value: '服务支持' },
                ]}
              />
            </Form.Item>
            <Form.Item label="优先级" name="priority" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select
                options={[
                  { label: 'P1 · 业务严重受影响', value: 'P1' },
                  { label: 'P2 · 高优先级', value: 'P2' },
                  { label: 'P3 · 普通请求', value: 'P3' },
                  { label: 'P4 · 咨询建议', value: 'P4' },
                ]}
              />
            </Form.Item>
          </Flex>
          <Form.Item
            label="详细说明"
            name="description"
            rules={[{ message: '请补充请求背景和期望结果', required: true }]}
          >
            <TextArea
              showCount
              maxLength={800}
              placeholder="说明影响范围、相关资产、期望结果和可接受的处理窗口"
              rows={5}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        extra={<MessageSquareText aria-hidden size={18} />}
        open={selectedCase !== null}
        title="服务工单详情"
        size={600}
        onClose={() => {
          setSelectedCase(null);
        }}
      >
        {selectedCase ? <ServiceCaseDetail serviceCase={selectedCase} /> : null}
      </Drawer>
    </OperationalPage>
  );
}
