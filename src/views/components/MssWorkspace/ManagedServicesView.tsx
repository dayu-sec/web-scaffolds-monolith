import { App as AntdApp, Button, Card, Descriptions, Flex, Progress, Space, Table, Tabs, Tag, Typography } from 'antd';
import { CalendarClock, Headphones, MessageSquarePlus, RadioTower, ShieldCheck } from 'lucide-react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill from '@/views/components/StatusPill/StatusPill';

import { type ManagedService, managedServices } from './mssData';
import styles from './MssWorkspace.module.css';

const { Paragraph, Text } = Typography;

interface ManagedServicesViewProps {
  /** 从服务履约视图进入客户与运营团队的工单协作区。 */
  onOpenServiceCases: () => void;
}

interface ManagedServiceCardProps {
  service: ManagedService;
  onViewGuide: (service: ManagedService) => void;
}

/** 展示单项订阅服务的覆盖度、关键产出和服务责任人。 */
function ManagedServiceCard({ service, onViewGuide }: ManagedServiceCardProps) {
  return (
    <Card
      className={styles.serviceCard}
      extra={<StatusPill label={service.status} tone={service.status === '正常' ? 'success' : 'warning'} />}
      title={
        <Space>
          <span className={styles.metricIcon} aria-hidden>
            <ShieldCheck size={17} />
          </span>
          <span>
            {service.name} <Text type="secondary">{service.shortName}</Text>
          </span>
        </Space>
      }
    >
      <Paragraph className={styles.serviceDescription}>{service.description}</Paragraph>
      <Flex align="flex-end" justify="space-between" gap="middle" wrap="wrap">
        <span>
          <Text className={styles.metricLabel}>{service.metricLabel}</Text>
          <div className={styles.serviceMetric}>{service.metric}</div>
        </span>
        <span className={styles.coverageBar}>
          <Text className={styles.metricLabel}>数据覆盖 {service.coverage}%</Text>
          <Progress percent={service.coverage} showInfo={false} size="small" />
        </span>
      </Flex>
      <Flex className={styles.serviceFooter} align="center" justify="space-between" gap="small" wrap="wrap">
        <Text type="secondary">
          {service.analyst} · 下次回顾 {service.nextReview}
        </Text>
        <Button
          size="small"
          type="link"
          onClick={() => {
            onViewGuide(service);
          }}
        >
          服务说明
        </Button>
      </Flex>
    </Card>
  );
}

/** 已订阅服务总览，验证客户对服务范围和产出的可见性。 */
function SubscriptionOverview({ onViewGuide }: { onViewGuide: (service: ManagedService) => void }) {
  return (
    <div className={styles.serviceGrid}>
      {managedServices.map((service) => (
        <ManagedServiceCard key={service.key} service={service} onViewGuide={onViewGuide} />
      ))}
    </div>
  );
}

/** 服务运行视图，区分产品数据接入健康和服务团队履约状态。 */
function ServiceOperations() {
  return (
    <div className={styles.equalColumnGrid}>
      <DataPanel meta="最近一次同步均在预期窗口内" title="数据接入健康">
        <Table
          columns={[
            { dataIndex: 'source', key: 'source', title: '数据源' },
            {
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <StatusPill label={status} tone={status === '正常' ? 'success' : 'warning'} />
              ),
              title: '状态',
              width: 100,
            },
            { dataIndex: 'sync', key: 'sync', title: '最近同步', width: 112 },
          ]}
          dataSource={[
            { key: 'edr', source: '终端检测与响应', status: '正常', sync: '1 分钟前' },
            { key: 'identity', source: '身份与访问平台', status: '正常', sync: '刚刚' },
            { key: 'cloud', source: '云工作负载保护', status: '正常', sync: '4 分钟前' },
            { key: 'easm', source: '外部攻击面发现', status: '部分延迟', sync: '28 分钟前' },
          ]}
          pagination={false}
          rowKey="key"
          size="small"
        />
      </DataPanel>
      <DataPanel meta="客户可见的服务承诺与当前值班信息" title="服务履约">
        <Descriptions
          column={1}
          items={[
            {
              children: <StatusPill label="在线" tone="success" />,
              key: 'duty',
              label: '7 × 24 值班',
            },
            { children: '严重 15 分钟 / 高危 30 分钟', key: 'sla', label: '目标响应时间' },
            { children: '100%（本月 8 / 8）', key: 'sla-rate', label: 'SLA 达成率' },
            { children: '客户安全负责人 + MDR 值班经理', key: 'escalation', label: '升级联系人' },
            { children: '2026 年 7 月 31 日', key: 'review', label: '下次服务回顾' },
          ]}
          size="small"
        />
      </DataPanel>
    </div>
  );
}

/** 威胁情报视图只展示与当前客户资产和行业相关的可行动情报。 */
function ThreatIntelligence() {
  return (
    <DataPanel meta="已根据本企业资产、品牌和零售行业画像完成相关性过滤" title="相关威胁情报">
      <Flex aria-label="相关威胁情报列表" className={styles.stackList} role="list" vertical>
        {[
          {
            date: '今天 08:30',
            level: '高相关',
            summary: '监测到针对零售行业支付系统的新型凭据窃取活动，已核对当前 EDR 规则覆盖。',
            tags: ['零售行业', '凭据窃取', '已覆盖'],
            title: '行业定向攻击活动更新',
          },
          {
            date: '昨天 16:10',
            level: '需关注',
            summary: '一个与企业品牌相似的新注册域名开始解析，尚未发现仿冒页面或邮件投递。',
            tags: ['品牌保护', '相似域名', '持续监控'],
            title: '发现疑似品牌仿冒域名',
          },
          {
            date: '7 月 15 日',
            level: '信息',
            summary: '云网关组件新披露漏洞与当前版本不匹配，无需紧急处置，将继续跟踪更新。',
            tags: ['漏洞情报', '无直接影响'],
            title: '云网关组件漏洞影响评估',
          },
        ].map((item) => (
          <Flex className={styles.stackListItem} key={item.title} role="listitem">
            <Flex className={styles.listItemBody} vertical gap="small">
              <Flex justify="space-between" gap="small" wrap="wrap">
                <Text className={styles.listTitle}>{item.title}</Text>
                <Text type="secondary">{item.date}</Text>
              </Flex>
              <Paragraph className={styles.serviceDescription}>{item.summary}</Paragraph>
              <Flex gap="small" wrap="wrap">
                <Tag color={item.level === '高相关' ? 'red' : item.level === '需关注' ? 'orange' : 'default'}>
                  {item.level}
                </Tag>
                {item.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </DataPanel>
  );
}

/** 客户侧托管服务中心：展示订阅范围、运行健康、履约信息和相关情报。 */
export default function ManagedServicesView({ onOpenServiceCases }: ManagedServicesViewProps) {
  const { message } = AntdApp.useApp();

  function handleViewGuide(service: ManagedService): void {
    void message.info(`${service.shortName} 服务说明将在正式版本连接知识库`);
  }

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Button
            icon={<CalendarClock aria-hidden size={15} />}
            onClick={() => {
              void message.success('已提交服务回顾预约，客户成功经理将确认时间');
            }}
          >
            预约服务回顾
          </Button>
          <Button icon={<MessageSquarePlus aria-hidden size={15} />} type="primary" onClick={onOpenServiceCases}>
            联系服务团队
          </Button>
        </div>
      }
      stateStrip={
        <div className={styles.stateStrip}>
          <StatusPill label="服务正常" tone="success" />
          <Text type="secondary">当前订阅 4 项托管服务，本月 SLA 达成率 100%。</Text>
        </div>
      }
    >
      <Tabs
        defaultActiveKey="subscriptions"
        items={[
          {
            children: <SubscriptionOverview onViewGuide={handleViewGuide} />,
            icon: <ShieldCheck aria-hidden size={15} />,
            key: 'subscriptions',
            label: '已订阅服务',
          },
          {
            children: <ServiceOperations />,
            icon: <RadioTower aria-hidden size={15} />,
            key: 'operations',
            label: '服务运行',
          },
          {
            children: <ThreatIntelligence />,
            icon: <Headphones aria-hidden size={15} />,
            key: 'intelligence',
            label: '威胁情报',
          },
        ]}
      />
    </OperationalPage>
  );
}
