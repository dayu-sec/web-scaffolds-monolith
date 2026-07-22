/** CSSP 可行性演示统一使用的事件严重度。 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

/** 客户侧安全事件的最小展示模型，不代表后端接口契约。 */
export interface SecurityIncident {
  key: string;
  title: string;
  severity: SecuritySeverity;
  status: 'investigating' | 'contained' | 'monitoring' | 'closed';
  source: string;
  affectedAsset: string;
  assignee: string;
  detectedAt: string;
  updatedAt: string;
  sla: string;
  description: string;
  recommendation: string;
}

/** 客户资产清单的静态展示模型。 */
export interface SecurityAsset {
  key: string;
  name: string;
  type: '终端' | '服务器' | '云资源' | '身份' | '应用';
  business: string;
  owner: string;
  risk: SecuritySeverity | 'safe';
  findings: number;
  coverage: string;
  lastSeen: string;
}

/** 暴露面问题的静态展示模型。 */
export interface ExposureFinding {
  key: string;
  title: string;
  category: string;
  severity: SecuritySeverity;
  assets: number;
  age: string;
  owner: string;
  dueAt: string;
  status: '待处理' | '修复中' | '已接受';
}

/** 客户已订阅托管服务的静态展示模型。 */
export interface ManagedService {
  key: string;
  name: string;
  shortName: string;
  status: '正常' | '需关注';
  coverage: number;
  metric: string;
  metricLabel: string;
  description: string;
  analyst: string;
  nextReview: string;
}

/** 客户与安全运营团队协作使用的服务工单。 */
export interface ServiceCase {
  key: string;
  title: string;
  type: '事件协查' | '策略变更' | '风险咨询' | '服务支持';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: '处理中' | '等待客户' | '已解决';
  requester: string;
  owner: string;
  updatedAt: string;
}

/** 客户可查阅的周期安全报告。 */
export interface SecurityReport {
  key: string;
  name: string;
  type: '月度运营' | '事件复盘' | '风险评估' | '合规简报';
  period: string;
  status: '已发布' | '生成中';
  publishedAt: string;
  size: string;
}

export const severityLabelMap: Record<SecuritySeverity, string> = {
  critical: '严重',
  high: '高危',
  low: '低危',
  medium: '中危',
};

export const incidentRecords: SecurityIncident[] = [
  {
    affectedAsset: 'finance-db-02',
    assignee: 'MDR · 陈分析师',
    description: '数据库服务账号在非办公时段出现异常导出行为，并伴随新的高权限会话。',
    detectedAt: '今天 09:42',
    key: 'INC-2026-0717-0042',
    recommendation: '保持账号冻结，确认最近的运维变更，并完成关联主机的凭据轮换。',
    severity: 'critical',
    sla: '剩余 18 分钟',
    source: '身份威胁检测',
    status: 'investigating',
    title: '高权限服务账号出现异常数据访问',
    updatedAt: '4 分钟前',
  },
  {
    affectedAsset: 'web-gateway-prod',
    assignee: 'MDR · 王分析师',
    description: '边界网关检测到利用已知漏洞的连续探测，已由 WAF 自动阻断主要攻击源。',
    detectedAt: '今天 08:18',
    key: 'INC-2026-0717-0037',
    recommendation: '在变更窗口内升级网关组件，并检查同版本节点是否存在相同暴露。',
    severity: 'high',
    sla: '剩余 1 小时 12 分',
    source: '外部攻击面',
    status: 'contained',
    title: '公网网关遭受漏洞利用尝试',
    updatedAt: '12 分钟前',
  },
  {
    affectedAsset: 'user: zhang.wei',
    assignee: 'MDR · 自动化流程',
    description: '同一身份在短时间内从两个远距离地区登录，第二次会话已触发条件访问。',
    detectedAt: '昨天 22:56',
    key: 'INC-2026-0716-0119',
    recommendation: '由账号所有者确认出行情况；若无法确认，立即重置凭据并检查 OAuth 授权。',
    severity: 'high',
    sla: '已满足',
    source: '身份与访问',
    status: 'monitoring',
    title: '检测到不可能旅行登录行为',
    updatedAt: '38 分钟前',
  },
  {
    affectedAsset: 'ops-laptop-117',
    assignee: 'MDR · 李分析师',
    description: '终端执行了经过混淆的 PowerShell 命令，EDR 已隔离相关进程。',
    detectedAt: '昨天 19:31',
    key: 'INC-2026-0716-0108',
    recommendation: '完成终端全盘扫描，核对下载来源，并清理同批次邮件中的附件。',
    severity: 'medium',
    sla: '已满足',
    source: '终端检测响应',
    status: 'contained',
    title: '终端执行可疑 PowerShell 脚本',
    updatedAt: '1 小时前',
  },
  {
    affectedAsset: 'crm-api-prod',
    assignee: 'MDR · 自动化流程',
    description: 'API 访问量在业务低峰出现明显偏移，当前未发现数据泄露证据。',
    detectedAt: '7 月 16 日 14:06',
    key: 'INC-2026-0716-0086',
    recommendation: '继续观察 24 小时，并为异常来源增加速率限制规则。',
    severity: 'medium',
    sla: '已满足',
    source: '云工作负载',
    status: 'monitoring',
    title: '生产 API 出现异常访问峰值',
    updatedAt: '3 小时前',
  },
  {
    affectedAsset: 'mailbox: sales.ops',
    assignee: 'MDR · 陈分析师',
    description: '共享邮箱收到仿冒供应商的钓鱼邮件，邮件已从全部收件箱撤回。',
    detectedAt: '7 月 15 日 11:20',
    key: 'INC-2026-0715-0054',
    recommendation: '向相关收件人完成安全提醒，并将发件域加入监控列表。',
    severity: 'low',
    sla: '已关闭',
    source: '邮件安全',
    status: 'closed',
    title: '供应商仿冒钓鱼邮件活动',
    updatedAt: '昨天 16:40',
  },
];

export const assetRecords: SecurityAsset[] = [
  {
    business: '财务结算',
    coverage: 'EDR · 漏洞管理',
    findings: 3,
    key: 'AST-001',
    lastSeen: '2 分钟前',
    name: 'finance-db-02',
    owner: '数据平台组',
    risk: 'critical',
    type: '服务器',
  },
  {
    business: '客户门户',
    coverage: 'WAF · EASM · 云防护',
    findings: 5,
    key: 'AST-002',
    lastSeen: '1 分钟前',
    name: 'web-gateway-prod',
    owner: '云平台组',
    risk: 'high',
    type: '云资源',
  },
  {
    business: '客户关系',
    coverage: 'API 防护 · 云防护',
    findings: 2,
    key: 'AST-003',
    lastSeen: '4 分钟前',
    name: 'crm-api-prod',
    owner: '应用研发组',
    risk: 'medium',
    type: '应用',
  },
  {
    business: '运维管理',
    coverage: 'EDR · DLP',
    findings: 1,
    key: 'AST-004',
    lastSeen: '8 分钟前',
    name: 'ops-laptop-117',
    owner: '基础设施组',
    risk: 'medium',
    type: '终端',
  },
  {
    business: '统一身份',
    coverage: 'ITDR · MFA',
    findings: 1,
    key: 'AST-005',
    lastSeen: '刚刚',
    name: 'zhang.wei',
    owner: '业务运营部',
    risk: 'high',
    type: '身份',
  },
  {
    business: '订单履约',
    coverage: 'EDR · 漏洞管理',
    findings: 0,
    key: 'AST-006',
    lastSeen: '3 分钟前',
    name: 'order-worker-06',
    owner: '交易平台组',
    risk: 'safe',
    type: '服务器',
  },
  {
    business: '协同办公',
    coverage: '邮件安全 · DLP',
    findings: 0,
    key: 'AST-007',
    lastSeen: '6 分钟前',
    name: 'sales.ops',
    owner: '销售运营部',
    risk: 'safe',
    type: '身份',
  },
];

export const exposureFindings: ExposureFinding[] = [
  {
    age: '12 天',
    assets: 2,
    category: '互联网暴露',
    dueAt: '7 月 18 日',
    key: 'EXP-1042',
    owner: '云平台组',
    severity: 'critical',
    status: '修复中',
    title: '公网管理端口缺少来源限制',
  },
  {
    age: '6 天',
    assets: 4,
    category: '漏洞',
    dueAt: '7 月 20 日',
    key: 'EXP-1038',
    owner: '基础设施组',
    severity: 'high',
    status: '待处理',
    title: '关键服务器存在可远程利用漏洞',
  },
  {
    age: '4 天',
    assets: 7,
    category: '身份配置',
    dueAt: '7 月 22 日',
    key: 'EXP-1031',
    owner: '身份平台组',
    severity: 'high',
    status: '修复中',
    title: '特权账号未启用抗钓鱼 MFA',
  },
  {
    age: '19 天',
    assets: 11,
    category: '云配置',
    dueAt: '7 月 25 日',
    key: 'EXP-1016',
    owner: '数据平台组',
    severity: 'medium',
    status: '待处理',
    title: '对象存储访问日志未完整启用',
  },
  {
    age: '31 天',
    assets: 1,
    category: '证书',
    dueAt: '8 月 2 日',
    key: 'EXP-0998',
    owner: '应用研发组',
    severity: 'medium',
    status: '已接受',
    title: '外部应用仍支持弱 TLS 密码套件',
  },
];

export const managedServices: ManagedService[] = [
  {
    analyst: '7 × 24 MDR 团队',
    coverage: 98,
    description: '跨终端、身份、邮件与云工作负载持续监测，提供分级研判和处置建议。',
    key: 'mdr',
    metric: '12 分钟',
    metricLabel: '本月平均响应',
    name: '托管检测与响应',
    nextReview: '7 月 31 日',
    shortName: 'MDR',
    status: '正常',
  },
  {
    analyst: '暴露面管理团队',
    coverage: 92,
    description: '持续发现互联网资产、漏洞与错误配置，按照业务影响提供修复优先级。',
    key: 'exposure',
    metric: '26 项',
    metricLabel: '本月已关闭风险',
    name: '暴露面与漏洞管理',
    nextReview: '7 月 24 日',
    shortName: 'EASM / VM',
    status: '需关注',
  },
  {
    analyst: '威胁情报团队',
    coverage: 100,
    description: '提供行业威胁跟踪、品牌与凭据泄露监测，以及与客户资产相关的情报通知。',
    key: 'intel',
    metric: '8 条',
    metricLabel: '本月相关情报',
    name: '威胁情报服务',
    nextReview: '8 月 5 日',
    shortName: 'CTI',
    status: '正常',
  },
  {
    analyst: '安全顾问团队',
    coverage: 100,
    description: '按月输出安全运营回顾、改进路线与关键指标，支持重大事件专项复盘。',
    key: 'advisory',
    metric: '3 项',
    metricLabel: '进行中的改进计划',
    name: '安全顾问与报告',
    nextReview: '7 月 29 日',
    shortName: 'vCISO',
    status: '正常',
  },
];

export const initialServiceCases: ServiceCase[] = [
  {
    key: 'SR-2026-0186',
    owner: 'MDR · 陈分析师',
    priority: 'P1',
    requester: '林管理员',
    status: '处理中',
    title: '协查财务数据库异常访问事件',
    type: '事件协查',
    updatedAt: '5 分钟前',
  },
  {
    key: 'SR-2026-0181',
    owner: '暴露面管理团队',
    priority: 'P2',
    requester: '周工程师',
    status: '等待客户',
    title: '确认公网管理端口整改方案',
    type: '风险咨询',
    updatedAt: '26 分钟前',
  },
  {
    key: 'SR-2026-0174',
    owner: '安全顾问 · 赵顾问',
    priority: 'P3',
    requester: '徐经理',
    status: '处理中',
    title: '申请调整月报接收人和抄送范围',
    type: '服务支持',
    updatedAt: '今天 09:10',
  },
  {
    key: 'SR-2026-0168',
    owner: 'MDR · 王分析师',
    priority: 'P3',
    requester: '周工程师',
    status: '已解决',
    title: '新增云主机纳入 EDR 监测范围',
    type: '策略变更',
    updatedAt: '昨天 17:42',
  },
  {
    key: 'SR-2026-0159',
    owner: '威胁情报团队',
    priority: 'P4',
    requester: '林管理员',
    status: '已解决',
    title: '订阅零售行业每周威胁简报',
    type: '服务支持',
    updatedAt: '7 月 15 日',
  },
];

export const securityReports: SecurityReport[] = [
  {
    key: 'RPT-2026-0701',
    name: '2026 年 6 月安全运营月报',
    period: '2026-06-01 — 2026-06-30',
    publishedAt: '7 月 3 日 10:20',
    size: '4.8 MB',
    status: '已发布',
    type: '月度运营',
  },
  {
    key: 'RPT-2026-0628',
    name: '公网网关漏洞利用事件复盘',
    period: '2026-06-26 — 2026-06-28',
    publishedAt: '6 月 30 日 16:42',
    size: '2.1 MB',
    status: '已发布',
    type: '事件复盘',
  },
  {
    key: 'RPT-2026-Q2',
    name: '2026 年第二季度暴露面风险评估',
    period: '2026 Q2',
    publishedAt: '7 月 6 日 09:15',
    size: '6.3 MB',
    status: '已发布',
    type: '风险评估',
  },
  {
    key: 'RPT-2026-ISOH1',
    name: 'ISO 27001 控制运行情况简报',
    period: '2026 上半年',
    publishedAt: '7 月 8 日 14:05',
    size: '3.7 MB',
    status: '已发布',
    type: '合规简报',
  },
];

export const riskTrend = {
  dates: ['7/11', '7/12', '7/13', '7/14', '7/15', '7/16', '7/17'],
  incidents: [11, 9, 14, 8, 10, 7, 6],
  risks: [36, 34, 35, 31, 29, 27, 24],
};
