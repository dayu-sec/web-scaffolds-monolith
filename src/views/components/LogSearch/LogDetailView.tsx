import { Alert, Button, Space, Tabs, Typography } from 'antd';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import DenseStateTable, {
  type DenseStateTableColumn,
  type DenseStateTableRow,
} from '@/views/components/DenseStateTable/DenseStateTable';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill from '@/views/components/StatusPill/StatusPill';

import styles from './logSearch.module.css';
import { contextLogsByTraceId, logRecords, severityToneMap } from './logSearchData';

const { Text } = Typography;

const contextColumns: DenseStateTableColumn[] = [
  { key: 'offset', title: 'Offset', width: '90px' },
  { key: 'time', title: 'Time', width: '150px' },
  { key: 'service', title: 'Service', width: '150px' },
  { key: 'severity', title: 'Level', width: '110px' },
  { key: 'message', title: 'Message' },
];

export interface LogDetailViewProps {
  traceId: string;
  onBack: () => void;
}

/** 单条日志详情业务视图：展示排障所需的上下文、字段解析和原始日志。 */
export default function LogDetailView({ traceId, onBack }: LogDetailViewProps) {
  const record = logRecords.find((item) => item.traceId === traceId);

  if (!record) {
    return (
      <OperationalPage
        actions={
          <Button icon={<ArrowLeft size={14} />} onClick={onBack}>
            返回检索
          </Button>
        }
      >
        <DataPanel
          state={{
            description: `当前静态样例中不存在 Trace ID: ${traceId}`,
            title: '未找到日志',
            type: 'empty',
          }}
          title="查询结果"
        />
      </OperationalPage>
    );
  }

  const contextRows: DenseStateTableRow[] = (contextLogsByTraceId[record.traceId] ?? []).map((item) => ({
    key: `${item.timestamp}-${item.service}`,
    tone: item.severity === 'error' ? 'danger' : item.severity === 'warn' ? 'warning' : undefined,
    values: {
      offset: item.offset,
      time: item.timestamp,
      service: item.service,
      severity: <StatusPill label={item.severity.toUpperCase()} tone={severityToneMap[item.severity]} />,
      message: item.message,
    },
  }));
  const detailTabItems = [
    {
      children: (
        <DataPanel meta="用于定位业务入口、实例和错误归属" title="事件摘要">
          <div className={styles.fieldGrid}>
            {record.fields.map((field) => (
              <div className={styles.fieldItem} key={field.label}>
                <Text className={styles.fieldLabel}>{field.label}</Text>
                <div className={styles.fieldValue}>{field.value}</div>
              </div>
            ))}
            <div className={styles.fieldItem}>
              <Text className={styles.fieldLabel}>服务实例</Text>
              <div className={styles.fieldValue}>{record.instance}</div>
            </div>
            <div className={styles.fieldItem}>
              <Text className={styles.fieldLabel}>发生时间</Text>
              <div className={styles.fieldValue}>{record.timestamp}</div>
            </div>
          </div>
        </DataPanel>
      ),
      key: 'summary',
      label: '事件摘要',
    },
    {
      children: (
        <DataPanel meta="静态建议，后续可由告警规则或检索后端生成" title="处置建议">
          <Alert
            showIcon
            title={record.severity === 'error' ? '建议升级为事件排查' : '建议继续观察'}
            type={record.severity === 'error' ? 'error' : 'warning'}
          />
          <ul className={styles.actionList}>
            <li>先确认同一 Trace 的上下游服务是否持续出现同类异常。</li>
            <li>对比实例维度，判断是单实例问题还是服务整体退化。</li>
            <li>若错误持续超过 5 分钟，再创建事件并关联告警记录。</li>
          </ul>
        </DataPanel>
      ),
      key: 'actions',
      label: '处置建议',
    },
    {
      children: (
        <DataPanel meta="原始日志保留完整字段，便于复制给后续排障工具" title="原始日志">
          <pre className={styles.rawLog}>{record.raw}</pre>
        </DataPanel>
      ),
      key: 'raw',
      label: '原始日志',
    },
    {
      children: (
        <DataPanel meta="同一 Trace 的上下文日志" title="上下文日志">
          <DenseStateTable columns={contextColumns} emptyText="没有上下文日志" rows={contextRows} />
        </DataPanel>
      ),
      key: 'context',
      label: '上下文日志',
    },
  ];

  return (
    <OperationalPage
      actions={
        <Space wrap>
          <Button icon={<ArrowLeft size={14} />} onClick={onBack}>
            返回检索
          </Button>
          <Button icon={<Copy size={14} />}>复制 Trace ID</Button>
          <Button disabled icon={<ExternalLink size={14} />} type="primary">
            创建事件
          </Button>
        </Space>
      }
      stateStrip={
        <div className={styles.stateStrip}>
          <StatusPill label={record.severity.toUpperCase()} tone={severityToneMap[record.severity]} />
          <StatusPill detail={record.service} label="服务" tone="active" />
          <StatusPill detail={record.duration} label="耗时" tone={record.severity === 'error' ? 'danger' : 'neutral'} />
        </div>
      }
    >
      <Tabs className={styles.detailTabs} items={detailTabItems} />
    </OperationalPage>
  );
}
