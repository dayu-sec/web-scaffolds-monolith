import { Button, DatePicker, Input, Select, Table, type TableProps, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill from '@/views/components/StatusPill/StatusPill';

import styles from './logSearch.module.css';
import { type LogRecord, logRecords, serviceOptions, severityToneMap } from './logSearchData';

const { RangePicker } = DatePicker;
const { Text } = Typography;

function createResultColumns(onOpenTrace: (traceId: string) => void): TableProps<LogRecord>['columns'] {
  return [
    {
      dataIndex: 'timestamp',
      key: 'time',
      title: 'Time',
      width: 170,
    },
    {
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: LogRecord['severity']) => (
        <StatusPill label={severity.toUpperCase()} tone={severityToneMap[severity]} />
      ),
      title: 'Level',
      width: 120,
    },
    {
      dataIndex: 'service',
      key: 'service',
      title: 'Service',
      width: 150,
    },
    {
      dataIndex: 'traceId',
      key: 'trace',
      render: (traceId: string) => (
        <Button
          className={styles.traceLink}
          type="link"
          onClick={() => {
            onOpenTrace(traceId);
          }}
        >
          {traceId}
        </Button>
      ),
      title: 'Trace ID',
      width: 210,
    },
    {
      key: 'message',
      render: (_value: unknown, record) => (
        <span className={styles.messageCell}>
          <span className={styles.messageTitle}>{record.message}</span>
          <span className={styles.messageMeta}>
            {record.endpoint} · {record.duration} · {record.instance}
          </span>
        </span>
      ),
      title: 'Message',
    },
    {
      key: 'action',
      render: (_value: unknown, record) => (
        <Button
          size="small"
          type="link"
          onClick={() => {
            onOpenTrace(record.traceId);
          }}
        >
          查看详情
        </Button>
      ),
      title: 'Action',
      width: 110,
    },
  ];
}

export interface LogSearchViewProps {
  onOpenTrace: (traceId: string) => void;
}

/** 日志检索工作台：承载从主应用菜单进入后的第一跳业务流程。 */
export default function LogSearchView({ onOpenTrace }: LogSearchViewProps) {
  const errorCount = logRecords.filter((record) => record.severity === 'error').length;
  const warningCount = logRecords.filter((record) => record.severity === 'warn').length;
  const resultColumns = useMemo(() => createResultColumns(onOpenTrace), [onOpenTrace]);

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Button>刷新</Button>
          <Button disabled>导出</Button>
          <Button type="primary">检索</Button>
        </div>
      }
    >
      <div className={styles.searchWorkspace}>
        <DataPanel meta="静态条件用于展示交互结构，后续可接入真实查询接口" title="检索条件">
          <div className={styles.queryGrid}>
            <label className={styles.queryKeyword}>
              <span className={styles.fieldLabel}>关键字 / Trace ID</span>
              <Input defaultValue="payment gateway timeout OR cache hit rate" />
            </label>
            <label className={styles.queryService}>
              <span className={styles.fieldLabel}>业务服务</span>
              <Select defaultValue="all" options={serviceOptions} />
            </label>
            <label className={styles.querySeverity}>
              <span className={styles.fieldLabel}>日志级别</span>
              <Select
                defaultValue="all"
                options={[
                  { label: '全部级别', value: 'all' },
                  { label: 'ERROR', value: 'error' },
                  { label: 'WARN', value: 'warn' },
                  { label: 'INFO', value: 'info' },
                  { label: 'DEBUG', value: 'debug' },
                ]}
              />
            </label>
            <label className={styles.queryTimeRange}>
              <span className={styles.fieldLabel}>时间范围</span>
              <RangePicker showTime defaultValue={[dayjs('2026-06-17 10:30:00'), dayjs('2026-06-17 10:45:00')]} />
            </label>
            <div className={styles.toolbar}>
              <Button type="primary">应用筛选</Button>
              <Button>重置</Button>
            </div>
          </div>
        </DataPanel>

        <section className={styles.metricGrid} aria-label="检索统计">
          <div className={styles.metricCard}>
            <Text className={styles.summaryLabel}>命中日志</Text>
            <div className={styles.summaryValue}>4</div>
            <Text className={styles.metricHint}>当前静态样例全部命中</Text>
          </div>
          <div className={styles.metricCard}>
            <Text className={styles.summaryLabel}>错误日志</Text>
            <div className={styles.summaryValue}>
              {errorCount}
              <StatusPill label="ERROR" tone="danger" />
            </div>
            <Text className={styles.metricHint}>建议优先打开 Trace 详情</Text>
          </div>
          <div className={styles.metricCard}>
            <Text className={styles.summaryLabel}>性能预警</Text>
            <div className={styles.summaryValue}>
              {warningCount}
              <StatusPill label="WARN" tone="warning" />
            </div>
            <Text className={styles.metricHint}>缓存命中率低于阈值</Text>
          </div>
          <div className={styles.metricCard}>
            <Text className={styles.summaryLabel}>级别分布</Text>
            <div className={styles.levelBars} aria-label="日志级别分布图">
              <span className={styles.levelDanger} style={{ inlineSize: '25%' }} />
              <span className={styles.levelWarning} style={{ inlineSize: '25%' }} />
              <span className={styles.levelSuccess} style={{ inlineSize: '25%' }} />
              <span className={styles.levelMuted} style={{ inlineSize: '25%' }} />
            </div>
            <Text className={styles.metricHint}>ERROR / WARN / INFO / DEBUG</Text>
          </div>
        </section>

        <DataPanel
          bodyClassName={styles.resultPanelBody}
          className={styles.resultPanel}
          meta="点击 Trace ID 或查看详情进入单条日志排障页面"
          title="检索结果"
        >
          <Table<LogRecord>
            className={styles.resultTable}
            columns={resultColumns}
            dataSource={logRecords}
            pagination={{
              hideOnSinglePage: false,
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `共 ${String(total)} 条`,
              size: 'small',
            }}
            rowClassName={(record) => {
              if (record.severity === 'error') {
                return styles.tableRowDanger;
              }
              if (record.severity === 'warn') {
                return styles.tableRowWarning;
              }
              return '';
            }}
            rowKey="traceId"
            scroll={{ x: 1080 }}
            size="small"
          />
        </DataPanel>
      </div>
    </OperationalPage>
  );
}
