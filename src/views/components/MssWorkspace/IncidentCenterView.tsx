import {
  Alert,
  App as AntdApp,
  Button,
  Descriptions,
  Drawer,
  Flex,
  Input,
  Select,
  Space,
  Table,
  type TableProps,
  Tabs,
  Timeline,
  Typography,
} from 'antd';
import { CirclePlus, FilterX, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill, { type StatusPillTone } from '@/views/components/StatusPill/StatusPill';

import { incidentRecords, type SecurityIncident, type SecuritySeverity, severityLabelMap } from './mssData';
import styles from './MssWorkspace.module.css';

const { Paragraph, Text, Title } = Typography;

type SeverityFilter = SecuritySeverity | 'all';
type IncidentStatusFilter = SecurityIncident['status'] | 'all';

const severityToneMap: Record<SecuritySeverity, StatusPillTone> = {
  critical: 'danger',
  high: 'danger',
  low: 'neutral',
  medium: 'warning',
};

const statusLabelMap: Record<SecurityIncident['status'], string> = {
  closed: '已关闭',
  contained: '已遏制',
  investigating: '调查中',
  monitoring: '监控中',
};

const statusToneMap: Record<SecurityIncident['status'], StatusPillTone> = {
  closed: 'success',
  contained: 'active',
  investigating: 'warning',
  monitoring: 'neutral',
};

interface IncidentCenterViewProps {
  /** 将需要跨团队协作的事件升级为服务工单。 */
  onOpenServiceCases: () => void;
}

/** 构造事件中心列定义，详情入口始终由显式按钮承载。 */
function createIncidentColumns(onOpen: (incident: SecurityIncident) => void): TableProps<SecurityIncident>['columns'] {
  return [
    {
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: SecuritySeverity) => (
        <StatusPill label={severityLabelMap[severity]} tone={severityToneMap[severity]} />
      ),
      title: '级别',
      width: 92,
    },
    {
      key: 'title',
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
              {record.key} · {record.source}
            </span>
          </span>
        </Button>
      ),
      title: '安全事件',
      width: 360,
    },
    {
      dataIndex: 'affectedAsset',
      key: 'asset',
      title: '受影响资产',
      width: 180,
    },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: SecurityIncident['status']) => (
        <StatusPill label={statusLabelMap[status]} tone={statusToneMap[status]} />
      ),
      title: '状态',
      width: 112,
    },
    {
      dataIndex: 'assignee',
      key: 'assignee',
      title: '当前负责人',
      width: 168,
    },
    {
      key: 'time',
      render: (_value: unknown, record) => (
        <span>
          <Text>{record.updatedAt}</Text>
          <Text className={styles.tableSecondary}>{record.sla}</Text>
        </span>
      ),
      title: '更新 / SLA',
      width: 140,
    },
  ];
}

/** 在列表上下文内展示事件研判、处置时间线和客户待办。 */
function IncidentDetail({ incident }: { incident: SecurityIncident }) {
  return (
    <Tabs
      items={[
        {
          children: (
            <Flex vertical gap="middle">
              <div className={styles.drawerSummary}>
                <Flex wrap="wrap" gap="small" align="center">
                  <StatusPill label={severityLabelMap[incident.severity]} tone={severityToneMap[incident.severity]} />
                  <StatusPill label={statusLabelMap[incident.status]} tone={statusToneMap[incident.status]} />
                  <Text type="secondary">SLA：{incident.sla}</Text>
                </Flex>
                <Title className={styles.drawerSectionTitle} level={4}>
                  {incident.title}
                </Title>
                <Paragraph>{incident.description}</Paragraph>
              </div>
              <Descriptions
                bordered
                column={1}
                items={[
                  { key: 'source', label: '检测来源', children: incident.source },
                  { key: 'asset', label: '受影响资产', children: incident.affectedAsset },
                  { key: 'detected', label: '首次发现', children: incident.detectedAt },
                  { key: 'assignee', label: '当前负责人', children: incident.assignee },
                ]}
                size="small"
              />
              <Alert
                showIcon
                description={incident.recommendation}
                title="建议客户行动"
                type={incident.severity === 'critical' || incident.severity === 'high' ? 'warning' : 'info'}
              />
            </Flex>
          ),
          key: 'overview',
          label: '事件概览',
        },
        {
          children: (
            <Timeline
              className={styles.drawerTimeline}
              items={[
                {
                  children: (
                    <span>
                      <Text strong>检测规则触发并完成信号关联</Text>
                      <Text className={styles.tableSecondary}>{incident.detectedAt} · 自动化检测</Text>
                    </span>
                  ),
                  color: 'red',
                },
                {
                  children: (
                    <span>
                      <Text strong>MDR 一线分析师完成初步研判</Text>
                      <Text className={styles.tableSecondary}>确认不是已知业务活动，并补充受影响资产</Text>
                    </span>
                  ),
                  color: 'blue',
                },
                {
                  children: (
                    <span>
                      <Text strong>已执行低风险遏制动作</Text>
                      <Text className={styles.tableSecondary}>阻断可疑会话并保留取证数据</Text>
                    </span>
                  ),
                  color: 'green',
                },
                {
                  children: (
                    <span>
                      <Text strong>等待客户确认运维变更</Text>
                      <Text className={styles.tableSecondary}>{incident.updatedAt} · 客户协同</Text>
                    </span>
                  ),
                  color: 'gray',
                },
              ]}
            />
          ),
          key: 'timeline',
          label: '处置时间线',
        },
        {
          children: (
            <Flex vertical gap="small">
              <Alert showIcon title="MDR 团队已完成告警聚合、上下文补充和初步遏制。" type="success" />
              <div className={styles.intelItem}>
                <Text strong>1. 验证业务活动</Text>
                <Text className={styles.listMeta}>由资产负责人确认对应时间段是否存在授权运维。</Text>
              </div>
              <div className={styles.intelItem}>
                <Text strong>2. 收敛访问权限</Text>
                <Text className={styles.listMeta}>若无法确认，执行凭据轮换并审查关联账号的有效会话。</Text>
              </div>
              <div className={styles.intelItem}>
                <Text strong>3. 完成事件复盘</Text>
                <Text className={styles.listMeta}>事件关闭后 2 个工作日内提供根因和改进建议。</Text>
              </div>
            </Flex>
          ),
          key: 'actions',
          label: '响应建议',
        },
      ]}
    />
  );
}

/** 客户侧统一事件队列：支持筛选、研判详情与服务协作入口。 */
export default function IncidentCenterView({ onOpenServiceCases }: IncidentCenterViewProps) {
  const { message } = AntdApp.useApp();
  const [keyword, setKeyword] = useState('');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [status, setStatus] = useState<IncidentStatusFilter>('all');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);

  const filteredIncidents = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return incidentRecords.filter((incident) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        `${incident.key} ${incident.title} ${incident.affectedAsset}`.toLowerCase().includes(normalizedKeyword);
      const matchesSeverity = severity === 'all' || incident.severity === severity;
      const matchesStatus = status === 'all' || incident.status === status;
      return matchesKeyword && matchesSeverity && matchesStatus;
    });
  }, [keyword, severity, status]);

  const columns = useMemo(() => createIncidentColumns(setSelectedIncident), []);

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Button
            icon={<ShieldCheck aria-hidden size={15} />}
            onClick={() => {
              void message.success('已刷新演示事件队列');
            }}
          >
            刷新事件
          </Button>
          <Button icon={<CirclePlus aria-hidden size={15} />} type="primary" onClick={onOpenServiceCases}>
            创建服务工单
          </Button>
        </div>
      }
      stateStrip={
        <div className={styles.stateStrip}>
          <StatusPill detail="目标 15 分钟" label="严重事件 SLA 正常" tone="success" />
          <Text type="secondary">当前 2 个事件等待客户反馈，MDR 团队持续跟进。</Text>
        </div>
      }
    >
      <div className={styles.workspace}>
        <section aria-label="事件筛选" className={styles.filterPanel}>
          <div className={styles.filterBar}>
            <Input
              allowClear
              placeholder="搜索事件编号、标题或资产"
              prefix={<Search aria-hidden size={15} />}
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
              }}
            />
            <Select<SeverityFilter>
              aria-label="按严重度筛选"
              options={[
                { label: '全部级别', value: 'all' },
                { label: '严重', value: 'critical' },
                { label: '高危', value: 'high' },
                { label: '中危', value: 'medium' },
                { label: '低危', value: 'low' },
              ]}
              value={severity}
              onChange={setSeverity}
            />
            <Select<IncidentStatusFilter>
              aria-label="按事件状态筛选"
              options={[
                { label: '全部状态', value: 'all' },
                { label: '调查中', value: 'investigating' },
                { label: '已遏制', value: 'contained' },
                { label: '监控中', value: 'monitoring' },
                { label: '已关闭', value: 'closed' },
              ]}
              value={status}
              onChange={setStatus}
            />
            <Button
              className={styles.filterActions}
              icon={<FilterX aria-hidden size={15} />}
              onClick={() => {
                setKeyword('');
                setSeverity('all');
                setStatus('all');
              }}
            >
              重置
            </Button>
          </div>
        </section>

        <DataPanel
          meta={`当前显示 ${String(filteredIncidents.length)} 个事件，按严重度和更新时间排序`}
          title="统一事件队列"
        >
          <Table<SecurityIncident>
            columns={columns}
            dataSource={filteredIncidents}
            locale={{ emptyText: '没有符合当前筛选条件的安全事件' }}
            pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (total) => `共 ${String(total)} 个事件` }}
            rowClassName={(record) => {
              if (record.severity === 'critical') return styles.tableRowDanger;
              if (record.severity === 'high') return styles.tableRowWarning;
              return '';
            }}
            rowKey="key"
            scroll={{ x: 1160 }}
            size="small"
          />
        </DataPanel>
      </div>

      <Drawer
        extra={
          <Space>
            <Button
              onClick={() => {
                void message.success('已记录客户确认，MDR 团队将继续处置');
              }}
            >
              确认收到
            </Button>
            <Button type="primary" onClick={onOpenServiceCases}>
              发起协作
            </Button>
          </Space>
        }
        open={selectedIncident !== null}
        title={selectedIncident ? `事件详情 · ${selectedIncident.key}` : '事件详情'}
        size={640}
        onClose={() => {
          setSelectedIncident(null);
        }}
      >
        {selectedIncident ? <IncidentDetail incident={selectedIncident} /> : null}
      </Drawer>
    </OperationalPage>
  );
}
