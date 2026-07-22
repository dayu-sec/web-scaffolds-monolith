import {
  App as AntdApp,
  Button,
  Card,
  Descriptions,
  Flex,
  Modal,
  Progress,
  Space,
  Table,
  type TableProps,
  Tag,
  Typography,
} from 'antd';
import { Download, Eye, FileBarChart, FilePlus2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill from '@/views/components/StatusPill/StatusPill';

import { type SecurityReport, securityReports } from './mssData';
import styles from './MssWorkspace.module.css';

const { Paragraph, Text, Title } = Typography;

/** 历史报告列定义，预览与下载均提供明确操作反馈。 */
function createReportColumns(
  onPreview: (report: SecurityReport) => void,
  onDownload: (report: SecurityReport) => void
): TableProps<SecurityReport>['columns'] {
  return [
    {
      key: 'report',
      render: (_value: unknown, record) => (
        <span>
          <Text className={styles.tablePrimary}>{record.name}</Text>
          <Text className={styles.tableSecondary}>{record.key}</Text>
        </span>
      ),
      title: '报告名称',
      width: 360,
    },
    {
      dataIndex: 'type',
      key: 'type',
      render: (type: SecurityReport['type']) => <Tag>{type}</Tag>,
      title: '类型',
      width: 120,
    },
    { dataIndex: 'period', key: 'period', title: '统计周期', width: 210 },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: SecurityReport['status']) => (
        <StatusPill label={status} tone={status === '已发布' ? 'success' : 'active'} />
      ),
      title: '状态',
      width: 108,
    },
    { dataIndex: 'publishedAt', key: 'publishedAt', title: '发布时间', width: 150 },
    {
      key: 'action',
      render: (_value: unknown, record) => (
        <Space size="small">
          <Button
            icon={<Eye aria-hidden size={14} />}
            size="small"
            type="text"
            onClick={() => {
              onPreview(record);
            }}
          >
            预览
          </Button>
          <Button
            icon={<Download aria-hidden size={14} />}
            size="small"
            type="text"
            onClick={() => {
              onDownload(record);
            }}
          >
            下载
          </Button>
        </Space>
      ),
      title: '操作',
      width: 184,
    },
  ];
}

/** 月度安全运营报告预览，聚合风险、响应和服务履约结论。 */
function ReportPreview({ report }: { report: SecurityReport }) {
  return (
    <Flex vertical gap="middle">
      <div className={styles.reportPreviewHero}>
        <Text type="secondary">{report.type}</Text>
        <Title level={3}>{report.name}</Title>
        <Paragraph type="secondary">{report.period}</Paragraph>
        <Flex gap="large" wrap="wrap">
          <span>
            <Text className={styles.metricLabel}>安全评分</Text>
            <div className={styles.reportPreviewMetric}>82 / 100</div>
          </span>
          <span>
            <Text className={styles.metricLabel}>处置事件</Text>
            <div className={styles.reportPreviewMetric}>46</div>
          </span>
          <span>
            <Text className={styles.metricLabel}>SLA 达成</Text>
            <div className={styles.reportPreviewMetric}>100%</div>
          </span>
        </Flex>
      </div>
      <Descriptions
        bordered
        column={1}
        items={[
          {
            children: '本期未发生确认的数据泄露事件，重大安全事件均在 SLA 内完成遏制。',
            key: 'summary',
            label: '管理摘要',
          },
          {
            children: '高权限账号异常访问、外部网关漏洞探测、特权身份 MFA 覆盖。',
            key: 'focus',
            label: '重点关注',
          },
          {
            children: '完成公网管理面收敛、优先修复 4 台关键服务器漏洞、扩大 EDR 覆盖。',
            key: 'action',
            label: '下期行动',
          },
          { children: report.publishedAt, key: 'publish', label: '发布时间' },
        ]}
        size="small"
      />
      <DataPanel meta="框架映射用于可行性验证，不构成正式审计结论" title="控制框架覆盖">
        <Flex vertical gap="small">
          <span>
            <Flex justify="space-between">
              <Text>ISO 27001</Text>
              <Text type="secondary">88%</Text>
            </Flex>
            <Progress percent={88} showInfo={false} size="small" />
          </span>
          <span>
            <Flex justify="space-between">
              <Text>NIST CSF</Text>
              <Text type="secondary">84%</Text>
            </Flex>
            <Progress percent={84} showInfo={false} size="small" />
          </span>
          <span>
            <Flex justify="space-between">
              <Text>CIS Controls</Text>
              <Text type="secondary">79%</Text>
            </Flex>
            <Progress percent={79} showInfo={false} size="small" />
          </span>
        </Flex>
      </DataPanel>
    </Flex>
  );
}

/** 客户安全报告中心：提供管理摘要、周期趋势、合规映射和历史报告预览。 */
export default function SecurityReportsView() {
  const { message } = AntdApp.useApp();
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);

  const handleDownload = useCallback(
    (report: SecurityReport): void => {
      void message.success(`${report.name} 已加入静态演示下载队列`);
    },
    [message]
  );

  const columns = useMemo(() => createReportColumns(setSelectedReport, handleDownload), [handleDownload]);

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Button
            icon={<FilePlus2 aria-hidden size={15} />}
            type="primary"
            onClick={() => {
              void message.success('已生成 2026 年 7 月安全运营报告演示任务');
            }}
          >
            生成报告
          </Button>
        </div>
      }
    >
      <div className={styles.workspace}>
        <section aria-label="本月报告摘要" className={styles.reportGrid}>
          <Card className={styles.reportCard}>
            <Flex vertical gap="small">
              <Flex align="center" justify="space-between">
                <Text type="secondary">组织安全评分</Text>
                <span className={styles.metricIcon} aria-hidden>
                  <FileBarChart size={17} />
                </span>
              </Flex>
              <div className={styles.metricValue}>82 / 100</div>
              <Progress percent={82} showInfo={false} size="small" />
              <Text className={styles.positive}>较上月提升 4 分</Text>
            </Flex>
          </Card>
          <Card className={styles.reportCard}>
            <Flex vertical gap="small">
              <Text type="secondary">本月事件响应</Text>
              <div className={styles.metricValue}>46 个事件</div>
              <Text>严重事件 2 个，均已完成遏制</Text>
              <Text className={styles.positive}>平均响应时间缩短 18%</Text>
            </Flex>
          </Card>
          <Card className={styles.reportCard}>
            <Flex vertical gap="small">
              <Text type="secondary">风险整改进展</Text>
              <div className={styles.metricValue}>26 项关闭</div>
              <Text>24 项风险仍在整改中</Text>
              <Text className={styles.danger}>3 项即将到期</Text>
            </Flex>
          </Card>
        </section>

        <DataPanel meta="正式版本可连接报告模板、审批、订阅和归档策略" title="报告库">
          <Table<SecurityReport>
            columns={columns}
            dataSource={securityReports}
            pagination={false}
            rowKey="key"
            scroll={{ x: 1120 }}
            size="small"
          />
        </DataPanel>
      </div>

      <Modal
        cancelText="关闭"
        footer={(_, { CancelBtn }) => (
          <Space>
            <CancelBtn />
            <Button
              icon={<Download aria-hidden size={15} />}
              type="primary"
              onClick={() => {
                if (selectedReport) handleDownload(selectedReport);
              }}
            >
              下载 PDF
            </Button>
          </Space>
        )}
        open={selectedReport !== null}
        styles={{ body: { maxHeight: 'calc(100dvh - 200px)', overflowY: 'auto' } }}
        title="安全报告预览"
        width={760}
        onCancel={() => {
          setSelectedReport(null);
        }}
      >
        {selectedReport ? <ReportPreview report={selectedReport} /> : null}
      </Modal>
    </OperationalPage>
  );
}
