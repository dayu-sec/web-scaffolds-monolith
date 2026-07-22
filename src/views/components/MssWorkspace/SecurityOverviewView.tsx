import { Alert, Button, Card, Flex, Progress, Space, Table, type TableProps, theme, Typography } from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { Activity, ArrowRight, CircleAlert, Clock3, RefreshCw, ShieldCheck, Siren, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill, { type StatusPillTone } from '@/views/components/StatusPill/StatusPill';

import { incidentRecords, managedServices, riskTrend, type SecurityIncident, severityLabelMap } from './mssData';
import styles from './MssWorkspace.module.css';

const { Text } = Typography;

const severityToneMap: Record<SecurityIncident['severity'], StatusPillTone> = {
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

interface SecurityOverviewViewProps {
  /** 从总览进入完整事件中心。 */
  onOpenIncidents: () => void;
  /** 从总览进入资产与暴露面模块。 */
  onOpenExposure: () => void;
  /** 从总览进入报告中心。 */
  onOpenReports: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  hint: ReactNode;
  icon: ReactNode;
  tone?: 'default' | 'danger' | 'success' | 'warning';
}

/** 展示单个客户安全运营指标及其变化语义。 */
function MetricCard({ label, value, hint, icon, tone = 'default' }: MetricCardProps) {
  const toneClassName = {
    danger: styles.metricIconDanger,
    default: '',
    success: styles.metricIconSuccess,
    warning: styles.metricIconWarning,
  }[tone];

  return (
    <Card className={styles.metricCard} size="small">
      <Flex align="flex-start" justify="space-between" gap="small">
        <div className={styles.metricHeader}>
          <Text className={styles.metricLabel}>{label}</Text>
          <div className={styles.metricValue}>{value}</div>
        </div>
        <span className={`${styles.metricIcon} ${toneClassName}`} aria-hidden>
          {icon}
        </span>
      </Flex>
      <Text className={styles.metricHint}>{hint}</Text>
    </Card>
  );
}

/** 使用当前 Ant Design Token 绘制可随 Light/Dark 切换的安全趋势图。 */
function SecurityTrendChart() {
  const { token } = theme.useToken();
  const option = useMemo<EChartsOption>(
    () => ({
      animationDuration: 400,
      color: [token.colorError, token.colorWarning],
      grid: { bottom: 24, containLabel: true, left: 4, right: 16, top: 32 },
      legend: {
        data: ['新增事件', '待修复风险'],
        itemHeight: 8,
        itemWidth: 12,
        right: 0,
        textStyle: { color: token.colorTextSecondary },
        top: 0,
      },
      series: [
        {
          areaStyle: { color: token.colorErrorBg, opacity: 0.55 },
          data: riskTrend.incidents,
          emphasis: { focus: 'series' },
          name: '新增事件',
          smooth: true,
          symbolSize: 6,
          type: 'line',
        },
        {
          data: riskTrend.risks,
          emphasis: { focus: 'series' },
          name: '待修复风险',
          smooth: true,
          symbolSize: 6,
          type: 'line',
        },
      ],
      tooltip: { trigger: 'axis' },
      xAxis: {
        axisLine: { lineStyle: { color: token.colorBorderSecondary } },
        axisTick: { show: false },
        data: riskTrend.dates,
        type: 'category',
      },
      yAxis: {
        axisLabel: { color: token.colorTextSecondary },
        splitLine: { lineStyle: { color: token.colorBorderSecondary, type: 'dashed' } },
        type: 'value',
      },
    }),
    [token]
  );

  return <ReactECharts aria-label="最近七天新增安全事件与待修复风险趋势" className={styles.chart} option={option} />;
}

function createIncidentColumns(onOpenIncidents: () => void): TableProps<SecurityIncident>['columns'] {
  return [
    {
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: SecurityIncident['severity']) => (
        <StatusPill label={severityLabelMap[severity]} tone={severityToneMap[severity]} />
      ),
      title: '级别',
      width: 92,
    },
    {
      key: 'incident',
      render: (_value: unknown, record) => (
        <Button className={styles.tableLink} type="link" onClick={onOpenIncidents}>
          <span>
            <span className={styles.tablePrimary}>{record.title}</span>
            <span className={styles.tableSecondary}>
              {record.key} · {record.affectedAsset}
            </span>
          </span>
        </Button>
      ),
      title: '事件',
    },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: SecurityIncident['status']) => (
        <StatusPill label={statusLabelMap[status]} tone={statusToneMap[status]} />
      ),
      title: '处置状态',
      width: 112,
    },
    {
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      title: '最近更新',
      width: 112,
    },
  ];
}

/** CSSP 首页：汇总客户安全态势、MDR 处置与托管服务履约状态。 */
export default function SecurityOverviewView({
  onOpenExposure,
  onOpenIncidents,
  onOpenReports,
}: SecurityOverviewViewProps) {
  const [lastUpdated, setLastUpdated] = useState('2 分钟前');
  const incidentColumns = useMemo(() => createIncidentColumns(onOpenIncidents), [onOpenIncidents]);

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Text type="secondary">数据更新于 {lastUpdated}</Text>
          <Button
            icon={<RefreshCw aria-hidden size={15} />}
            onClick={() => {
              setLastUpdated('刚刚');
            }}
          >
            刷新
          </Button>
          <Button type="primary" onClick={onOpenReports}>
            查看月报
          </Button>
        </div>
      }
      stateStrip={
        <div className={styles.stateStrip}>
          <StatusPill detail="所有核心数据源在线" label="7 × 24 监测中" tone="success" />
          <Text type="secondary">当前值班：MDR 一线响应组 · 严重事件目标响应时间 15 分钟</Text>
        </div>
      }
    >
      <div className={styles.workspace}>
        <Alert
          showIcon
          action={
            <Button size="small" type="link" onClick={onOpenIncidents}>
              查看事件
            </Button>
          }
          description="MDR 团队正在调查财务数据库服务账号的异常访问，账号已临时冻结，等待客户确认近期运维变更。"
          title="1 个严重事件需要客户协同"
          type="warning"
        />

        <section aria-label="关键安全指标" className={styles.metricGrid}>
          <MetricCard
            hint={
              <span>
                <span className={styles.danger}>1 个严重</span> · 2 个高危
              </span>
            }
            icon={<Siren size={18} />}
            label="活跃安全事件"
            tone="danger"
            value="5"
          />
          <MetricCard
            hint={
              <span>
                较上周 <span className={styles.positive}>下降 18%</span>
              </span>
            }
            icon={<TrendingDown size={18} />}
            label="待修复高风险"
            tone="warning"
            value="24"
          />
          <MetricCard
            hint="本月目标 ≥ 95%"
            icon={<ShieldCheck size={18} />}
            label="安全监测覆盖率"
            tone="success"
            value="96.8%"
          />
          <MetricCard
            hint="严重事件 SLA 当前全部满足"
            icon={<Clock3 size={18} />}
            label="平均响应时间"
            value="12 分钟"
          />
        </section>

        <div className={styles.twoColumnGrid}>
          <DataPanel meta="新增事件与未关闭风险，统计范围为最近 7 天" title="风险与事件趋势">
            <SecurityTrendChart />
          </DataPanel>
          <DataPanel meta="已订阅服务的数据接入与运行情况" title="托管服务健康度">
            <Flex aria-label="托管服务健康度列表" className={styles.stackList} role="list" vertical>
              {managedServices.map((service) => (
                <Flex className={styles.stackListItem} key={service.key} role="listitem">
                  <Flex className={styles.listItemBody} vertical gap={6}>
                    <Flex align="center" justify="space-between" gap="small">
                      <Text className={styles.listTitle}>{service.shortName}</Text>
                      <StatusPill label={service.status} tone={service.status === '正常' ? 'success' : 'warning'} />
                    </Flex>
                    <Progress
                      percent={service.coverage}
                      size="small"
                      status={service.status === '正常' ? 'success' : 'normal'}
                    />
                    <Text className={styles.listMeta}>{service.name}</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </DataPanel>
        </div>

        <div className={styles.twoColumnGrid}>
          <DataPanel
            actions={
              <Button icon={<ArrowRight aria-hidden size={14} />} size="small" type="text" onClick={onOpenIncidents}>
                全部事件
              </Button>
            }
            meta="按风险和处置时效排序"
            title="正在处置的事件"
          >
            <Table<SecurityIncident>
              columns={incidentColumns}
              dataSource={incidentRecords.slice(0, 4)}
              pagination={false}
              rowClassName={(record) => (record.severity === 'critical' ? styles.tableRowDanger : '')}
              rowKey="key"
              scroll={{ x: 720 }}
              size="small"
            />
          </DataPanel>
          <DataPanel
            actions={
              <Button size="small" type="text" onClick={onOpenExposure}>
                查看暴露面
              </Button>
            }
            meta="建议由客户团队在本周内完成"
            title="优先行动"
          >
            <Flex aria-label="优先行动列表" className={styles.stackList} role="list" vertical>
              {[
                {
                  meta: '2 个公网入口 · 截止明天',
                  title: '限制公网管理端口的访问来源',
                  tone: 'danger' as const,
                },
                {
                  meta: '4 台关键服务器 · 截止 7 月 20 日',
                  title: '修复可远程利用的高危漏洞',
                  tone: 'warning' as const,
                },
                {
                  meta: '7 个特权账号 · 截止 7 月 22 日',
                  title: '启用抗钓鱼多因素认证',
                  tone: 'warning' as const,
                },
              ].map((item) => (
                <Flex className={styles.stackListItem} key={item.title} role="listitem">
                  <Space align="start">
                    {item.tone === 'danger' ? (
                      <CircleAlert aria-hidden color="var(--dy-sec-error)" size={17} />
                    ) : (
                      <Activity aria-hidden color="var(--dy-sec-warning)" size={17} />
                    )}
                    <span>
                      <Text className={styles.listTitle}>{item.title}</Text>
                      <Text className={styles.listMeta}>{item.meta}</Text>
                    </span>
                  </Space>
                </Flex>
              ))}
            </Flex>
          </DataPanel>
        </div>
      </div>
    </OperationalPage>
  );
}
