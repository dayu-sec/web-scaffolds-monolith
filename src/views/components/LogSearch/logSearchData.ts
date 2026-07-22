import type { StatusPillTone } from '@/views/components/StatusPill/StatusPill';

/** 日志检索示例的静态数据契约与展示数据，由列表和详情业务视图共享。 */

export type LogSeverity = 'debug' | 'error' | 'info' | 'warn';

export interface LogRecord {
  traceId: string;
  timestamp: string;
  service: string;
  instance: string;
  severity: LogSeverity;
  duration: string;
  endpoint: string;
  message: string;
  raw: string;
  fields: { label: string; value: string }[];
}

export interface ContextLogRecord {
  offset: string;
  timestamp: string;
  service: string;
  severity: LogSeverity;
  message: string;
}

export const severityToneMap: Record<LogSeverity, StatusPillTone> = {
  debug: 'disabled',
  error: 'danger',
  info: 'success',
  warn: 'warning',
};

export const logRecords: LogRecord[] = [
  {
    traceId: 'trc-8f42a91c0d7e4a6b',
    timestamp: '2026-06-17 10:42:13.438',
    service: 'order-api',
    instance: 'order-api-7c9f9b6c8f-q2x4m',
    severity: 'error',
    duration: '2.84s',
    endpoint: 'POST /api/orders/submit',
    message: '订单提交链路调用支付网关超时，已触发重试队列',
    raw: 'level=error trace_id=trc-8f42a91c0d7e4a6b service=order-api endpoint="POST /api/orders/submit" duration=2840ms retry_queue=payment-retry message="payment gateway timeout"',
    fields: [
      { label: '业务域', value: '订单交易' },
      { label: '请求入口', value: 'POST /api/orders/submit' },
      { label: '错误类型', value: 'UpstreamTimeout' },
      { label: '重试队列', value: 'payment-retry' },
    ],
  },
  {
    traceId: 'trc-4d719b2f5cc14610',
    timestamp: '2026-06-17 10:39:55.021',
    service: 'gateway',
    instance: 'gateway-prod-cn-east-02',
    severity: 'warn',
    duration: '812ms',
    endpoint: 'GET /api/logistics/traces',
    message: '物流轨迹查询响应变慢，缓存命中率低于阈值',
    raw: 'level=warn trace_id=trc-4d719b2f5cc14610 service=gateway endpoint="GET /api/logistics/traces" cache_hit_rate=41% duration=812ms message="cache hit rate below threshold"',
    fields: [
      { label: '业务域', value: '物流查询' },
      { label: '缓存命中率', value: '41%' },
      { label: '阈值', value: '70%' },
      { label: '入口网关', value: 'gateway-prod-cn-east-02' },
    ],
  },
  {
    traceId: 'trc-a91d7c063de3402c',
    timestamp: '2026-06-17 10:37:09.884',
    service: 'account-center',
    instance: 'account-center-59ddcbfb76-hx7bk',
    severity: 'info',
    duration: '126ms',
    endpoint: 'GET /api/accounts/profile',
    message: '用户资料读取完成，命中本地只读缓存',
    raw: 'level=info trace_id=trc-a91d7c063de3402c service=account-center endpoint="GET /api/accounts/profile" duration=126ms cache=local-readonly message="profile loaded"',
    fields: [
      { label: '业务域', value: '账号中心' },
      { label: '缓存层', value: 'local-readonly' },
      { label: '响应耗时', value: '126ms' },
      { label: '结果', value: 'success' },
    ],
  },
  {
    traceId: 'trc-f02d0a8b61c14b21',
    timestamp: '2026-06-17 10:33:48.207',
    service: 'risk-control',
    instance: 'risk-control-0',
    severity: 'debug',
    duration: '43ms',
    endpoint: 'POST /api/risk/evaluate',
    message: '风控策略命中低风险分支，仅记录调试采样日志',
    raw: 'level=debug trace_id=trc-f02d0a8b61c14b21 service=risk-control endpoint="POST /api/risk/evaluate" rule=low-risk-sample duration=43ms message="debug sample accepted"',
    fields: [
      { label: '业务域', value: '风控评估' },
      { label: '策略分支', value: 'low-risk-sample' },
      { label: '采样类型', value: 'debug' },
      { label: '响应耗时', value: '43ms' },
    ],
  },
];

export const contextLogsByTraceId: Record<string, ContextLogRecord[]> = {
  'trc-8f42a91c0d7e4a6b': [
    {
      offset: '-2.3s',
      timestamp: '2026-06-17 10:42:11.138',
      service: 'gateway',
      severity: 'info',
      message: '请求进入订单提交网关，鉴权通过',
    },
    {
      offset: '-0.8s',
      timestamp: '2026-06-17 10:42:12.638',
      service: 'payment-adapter',
      severity: 'warn',
      message: '支付网关第一次调用超过 800ms，准备重试',
    },
    {
      offset: '0s',
      timestamp: '2026-06-17 10:42:13.438',
      service: 'order-api',
      severity: 'error',
      message: '支付网关超时，订单进入待确认状态',
    },
  ],
  'trc-4d719b2f5cc14610': [
    {
      offset: '-1.1s',
      timestamp: '2026-06-17 10:39:53.921',
      service: 'gateway',
      severity: 'info',
      message: '物流轨迹查询请求进入网关',
    },
    {
      offset: '0s',
      timestamp: '2026-06-17 10:39:55.021',
      service: 'logistics-query',
      severity: 'warn',
      message: '缓存命中率低于阈值，触发下游直查',
    },
  ],
  'trc-a91d7c063de3402c': [
    {
      offset: '0s',
      timestamp: '2026-06-17 10:37:09.884',
      service: 'account-center',
      severity: 'info',
      message: '本地只读缓存命中，返回用户资料',
    },
  ],
  'trc-f02d0a8b61c14b21': [
    {
      offset: '0s',
      timestamp: '2026-06-17 10:33:48.207',
      service: 'risk-control',
      severity: 'debug',
      message: '低风险策略采样日志写入完成',
    },
  ],
};

export const serviceOptions = [
  { label: '全部服务', value: 'all' },
  { label: 'order-api', value: 'order-api' },
  { label: 'gateway', value: 'gateway' },
  { label: 'account-center', value: 'account-center' },
  { label: 'risk-control', value: 'risk-control' },
];
