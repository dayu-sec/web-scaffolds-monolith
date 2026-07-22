import {
  Alert,
  App as AntdApp,
  Button,
  Descriptions,
  Drawer,
  Flex,
  Input,
  Progress,
  Select,
  Table,
  type TableProps,
  Tabs,
  Typography,
} from 'antd';
import { CirclePlus, Download, FilterX, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import DataPanel from '@/views/components/DataPanel/DataPanel';
import OperationalPage from '@/views/components/OperationalPage/OperationalPage';
import StatusPill, { type StatusPillTone } from '@/views/components/StatusPill/StatusPill';

import {
  assetRecords,
  type ExposureFinding,
  exposureFindings,
  type SecurityAsset,
  type SecuritySeverity,
  severityLabelMap,
} from './mssData';
import styles from './MssWorkspace.module.css';

const { Paragraph, Text, Title } = Typography;

export type AssetRiskSection = 'assets' | 'exposure';
type AssetRiskFilter = SecurityAsset['risk'] | 'all';

const riskToneMap: Record<SecurityAsset['risk'], StatusPillTone> = {
  critical: 'danger',
  high: 'danger',
  low: 'neutral',
  medium: 'warning',
  safe: 'success',
};

const findingToneMap: Record<SecuritySeverity, StatusPillTone> = {
  critical: 'danger',
  high: 'danger',
  low: 'neutral',
  medium: 'warning',
};

interface AssetRiskViewProps {
  /** 当前由 URL 决定的资产安全子模块。 */
  activeSection: AssetRiskSection;
  /** 在资产与暴露面路由之间切换。 */
  onChangeSection: (section: AssetRiskSection) => void;
  /** 将整改协作升级到服务工单。 */
  onOpenServiceCases: () => void;
}

function isAssetRiskSection(value: string): value is AssetRiskSection {
  return value === 'assets' || value === 'exposure';
}

/** 客户资产清单列定义，风险与发现数量共同支持优先级判断。 */
function createAssetColumns(onOpen: (asset: SecurityAsset) => void): TableProps<SecurityAsset>['columns'] {
  return [
    {
      key: 'asset',
      render: (_value: unknown, record) => (
        <Button
          className={styles.tableLink}
          type="link"
          onClick={() => {
            onOpen(record);
          }}
        >
          <span>
            <span className={styles.tablePrimary}>{record.name}</span>
            <span className={styles.tableSecondary}>
              {record.key} · {record.type}
            </span>
          </span>
        </Button>
      ),
      title: '资产',
      width: 260,
    },
    { dataIndex: 'business', key: 'business', title: '业务系统', width: 140 },
    { dataIndex: 'owner', key: 'owner', title: '责任团队', width: 140 },
    {
      dataIndex: 'risk',
      key: 'risk',
      render: (risk: SecurityAsset['risk']) => (
        <StatusPill label={risk === 'safe' ? '安全' : severityLabelMap[risk]} tone={riskToneMap[risk]} />
      ),
      title: '风险',
      width: 100,
    },
    {
      dataIndex: 'findings',
      key: 'findings',
      render: (findings: number) => <Text type={findings > 0 ? 'warning' : 'secondary'}>{findings}</Text>,
      title: '未关闭发现',
      width: 112,
    },
    { dataIndex: 'coverage', key: 'coverage', title: '安全覆盖', width: 210 },
    { dataIndex: 'lastSeen', key: 'lastSeen', title: '最近在线', width: 112 },
  ];
}

/** 暴露面问题列定义，突出严重度、资产影响和整改期限。 */
function createFindingColumns(onOpenServiceCases: () => void): TableProps<ExposureFinding>['columns'] {
  return [
    {
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: SecuritySeverity) => (
        <StatusPill label={severityLabelMap[severity]} tone={findingToneMap[severity]} />
      ),
      title: '级别',
      width: 92,
    },
    {
      key: 'finding',
      render: (_value: unknown, record) => (
        <span>
          <Text className={styles.tablePrimary}>{record.title}</Text>
          <Text className={styles.tableSecondary}>
            {record.key} · {record.category} · 已发现 {record.age}
          </Text>
        </span>
      ),
      title: '风险发现',
      width: 360,
    },
    { dataIndex: 'assets', key: 'assets', title: '影响资产', width: 96 },
    { dataIndex: 'owner', key: 'owner', title: '责任团队', width: 140 },
    { dataIndex: 'dueAt', key: 'dueAt', title: '整改期限', width: 112 },
    {
      dataIndex: 'status',
      key: 'status',
      render: (status: ExposureFinding['status']) => (
        <StatusPill
          label={status}
          tone={status === '修复中' ? 'active' : status === '已接受' ? 'neutral' : 'warning'}
        />
      ),
      title: '状态',
      width: 112,
    },
    {
      key: 'action',
      render: () => (
        <Button size="small" type="link" onClick={onOpenServiceCases}>
          协同整改
        </Button>
      ),
      title: '操作',
      width: 104,
    },
  ];
}

/** 资产详情保留清单上下文，并解释安全控制覆盖和当前风险。 */
function AssetDetail({ asset }: { asset: SecurityAsset }) {
  return (
    <Flex vertical gap="middle">
      <div className={styles.drawerSummary}>
        <Flex align="center" justify="space-between" gap="small" wrap="wrap">
          <span>
            <Text type="secondary">{asset.key}</Text>
            <Title className={styles.drawerSectionTitle} level={4}>
              {asset.name}
            </Title>
          </span>
          <StatusPill
            label={asset.risk === 'safe' ? '当前安全' : `${severityLabelMap[asset.risk]}风险`}
            tone={riskToneMap[asset.risk]}
          />
        </Flex>
        <Paragraph type="secondary">该视图聚合资产归属、安全控制覆盖和仍需处置的风险发现。</Paragraph>
      </div>
      <Descriptions
        bordered
        column={1}
        items={[
          { children: asset.type, key: 'type', label: '资产类型' },
          { children: asset.business, key: 'business', label: '业务系统' },
          { children: asset.owner, key: 'owner', label: '责任团队' },
          { children: asset.coverage, key: 'coverage', label: '安全控制' },
          { children: asset.lastSeen, key: 'seen', label: '最近在线' },
        ]}
        size="small"
      />
      <DataPanel meta="演示数据用于验证资产风险详情结构" title={`未关闭风险 · ${String(asset.findings)}`}>
        {asset.findings === 0 ? (
          <Alert showIcon title="当前没有未关闭的风险发现" type="success" />
        ) : (
          <Flex aria-label="资产未关闭风险" className={styles.stackList} role="list" vertical>
            {exposureFindings.slice(0, Math.min(asset.findings, 3)).map((finding) => (
              <Flex className={styles.stackListItem} key={finding.key} role="listitem">
                <span>
                  <Text strong>{finding.title}</Text>
                  <Text className={styles.listMeta}>
                    {finding.category} · 截止 {finding.dueAt}
                  </Text>
                </span>
              </Flex>
            ))}
          </Flex>
        )}
      </DataPanel>
    </Flex>
  );
}

/** 资产清单子视图，验证客户资产搜索、风险筛选与侧向详情流程。 */
function AssetInventory() {
  const [keyword, setKeyword] = useState('');
  const [risk, setRisk] = useState<AssetRiskFilter>('all');
  const [selectedAsset, setSelectedAsset] = useState<SecurityAsset | null>(null);
  const columns = useMemo(() => createAssetColumns(setSelectedAsset), []);

  const filteredAssets = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return assetRecords.filter((asset) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        `${asset.name} ${asset.business} ${asset.owner}`.toLowerCase().includes(normalizedKeyword);
      return matchesKeyword && (risk === 'all' || asset.risk === risk);
    });
  }, [keyword, risk]);

  return (
    <div className={styles.workspace}>
      <section aria-label="资产筛选" className={styles.filterPanel}>
        <div className={styles.filterBar}>
          <Input
            allowClear
            placeholder="搜索资产、业务系统或责任团队"
            prefix={<Search aria-hidden size={15} />}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
            }}
          />
          <Select<AssetRiskFilter>
            aria-label="按资产风险筛选"
            options={[
              { label: '全部风险', value: 'all' },
              { label: '严重风险', value: 'critical' },
              { label: '高危风险', value: 'high' },
              { label: '中危风险', value: 'medium' },
              { label: '当前安全', value: 'safe' },
            ]}
            value={risk}
            onChange={setRisk}
          />
          <Select
            aria-label="按资产类型筛选"
            defaultValue="all"
            options={[
              { label: '全部类型', value: 'all' },
              { label: '终端与服务器', value: 'endpoint' },
              { label: '云资源', value: 'cloud' },
              { label: '身份', value: 'identity' },
              { label: '应用', value: 'application' },
            ]}
          />
          <Button
            className={styles.filterActions}
            icon={<FilterX aria-hidden size={15} />}
            onClick={() => {
              setKeyword('');
              setRisk('all');
            }}
          >
            重置
          </Button>
        </div>
      </section>
      <DataPanel
        meta={`已纳管 1,286 项资产，当前展示 ${String(filteredAssets.length)} 条代表性数据`}
        title="统一资产清单"
      >
        <Table<SecurityAsset>
          columns={columns}
          dataSource={filteredAssets}
          locale={{ emptyText: '没有符合当前筛选条件的资产' }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          rowKey="key"
          scroll={{ x: 1080 }}
          size="small"
        />
      </DataPanel>
      <Drawer
        open={selectedAsset !== null}
        title="资产风险详情"
        size={560}
        onClose={() => {
          setSelectedAsset(null);
        }}
      >
        {selectedAsset ? <AssetDetail asset={selectedAsset} /> : null}
      </Drawer>
    </div>
  );
}

/** 暴露面子视图，验证风险评分、整改优先级与服务协作流程。 */
function ExposureManagement({ onOpenServiceCases }: Pick<AssetRiskViewProps, 'onOpenServiceCases'>) {
  const columns = useMemo(() => createFindingColumns(onOpenServiceCases), [onOpenServiceCases]);

  return (
    <div className={styles.workspace}>
      <Alert
        showIcon
        action={
          <Button size="small" type="link" onClick={onOpenServiceCases}>
            联系顾问
          </Button>
        }
        description="优先修复公网管理端口和可远程利用漏洞，预计可将安全评分提升 6 分。"
        title="本周建议完成 3 项优先整改"
        type="warning"
      />
      <div className={styles.twoColumnGrid}>
        <DataPanel meta="综合资产重要性、暴露程度与可利用性" title="安全暴露评分">
          <div className={styles.scorePanel}>
            <Flex vertical align="center" gap="small">
              <Progress percent={82} size={180} strokeWidth={10} type="dashboard" />
              <div>
                <div className={styles.scoreValue}>良好</div>
                <Text className={styles.scoreLabel}>较上月提升 4 分 · 目标 90 分</Text>
              </div>
            </Flex>
          </div>
        </DataPanel>
        <DataPanel meta="覆盖互联网、云配置、漏洞和身份风险" title="风险构成">
          <Flex aria-label="暴露面风险构成" className={styles.stackList} role="list" vertical>
            {[
              { label: '互联网暴露', percent: 74, value: '6 项' },
              { label: '漏洞风险', percent: 61, value: '9 项' },
              { label: '身份配置', percent: 43, value: '4 项' },
              { label: '云配置', percent: 28, value: '5 项' },
            ].map((item) => (
              <Flex className={styles.stackListItem} key={item.label} role="listitem">
                <Flex className={styles.listItemBody} vertical gap={4}>
                  <Flex justify="space-between" gap="small">
                    <Text>{item.label}</Text>
                    <Text type="secondary">{item.value}</Text>
                  </Flex>
                  <Progress percent={item.percent} showInfo={false} size="small" />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </DataPanel>
      </div>
      <DataPanel meta="按照业务影响、可利用性和整改期限综合排序" title="优先整改队列">
        <Table<ExposureFinding>
          columns={columns}
          dataSource={exposureFindings}
          pagination={false}
          rowClassName={(record) => (record.severity === 'critical' ? styles.tableRowDanger : '')}
          rowKey="key"
          scroll={{ x: 1060 }}
          size="small"
        />
      </DataPanel>
    </div>
  );
}

/** 统一承载资产清单与暴露面管理，URL 仍由各自文件路由负责。 */
export default function AssetRiskView({ activeSection, onChangeSection, onOpenServiceCases }: AssetRiskViewProps) {
  const { message } = AntdApp.useApp();

  return (
    <OperationalPage
      actions={
        <div className={styles.actionBar}>
          <Button
            icon={<Download aria-hidden size={15} />}
            onClick={() => {
              void message.success('已生成静态演示导出任务');
            }}
          >
            导出清单
          </Button>
          <Button icon={<CirclePlus aria-hidden size={15} />} type="primary" onClick={onOpenServiceCases}>
            发起整改协作
          </Button>
        </div>
      }
    >
      <Tabs
        activeKey={activeSection}
        items={[
          { children: <AssetInventory />, key: 'assets', label: '资产清单' },
          {
            children: <ExposureManagement onOpenServiceCases={onOpenServiceCases} />,
            key: 'exposure',
            label: '暴露面与整改',
          },
        ]}
        onChange={(key) => {
          if (isAssetRiskSection(key)) onChangeSection(key);
        }}
      />
    </OperationalPage>
  );
}
