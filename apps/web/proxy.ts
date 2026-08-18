import fs from 'node:fs';
import path from 'node:path';

import type { ParseError } from 'jsonc-parser';
import { parse as parseJsonc, printParseErrorCode } from 'jsonc-parser';
import type { ProxyOptions } from 'vite';

import { API_BASE_PATH } from './src/constants/api';

/** 本地代理配置文件按 JSONC、JSON 顺序发现，不合并两份配置。 */
export const LOCAL_PROXY_CONFIG_FILE_NAMES = ['proxy.local.jsonc', 'proxy.local.json'] as const;

/** JSONC/JSON 中可序列化的正则路径重写约定。 */
export interface LocalProxyRewrite {
  pattern: string;
  replacement: string;
}

/** 单条本地代理规则；字段与项目支持的 Vite 8 代理选项一致。 */
export interface LocalProxyItemOptions {
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  ws?: boolean;
  rewrite?: LocalProxyRewrite;
  headers?: Record<string, string>;
}

/** 本地代理文件约定；具体字段提示和校验规则由 proxy.schema.json 提供。 */
export interface LocalProxyConfig {
  $schema?: string;
  'server.proxy.api'?: Record<string, LocalProxyItemOptions>;
}

/** 已读取的本地代理配置及其文件来源。 */
export interface LoadedLocalProxyConfig {
  config: LocalProxyConfig;
  fileName: (typeof LOCAL_PROXY_CONFIG_FILE_NAMES)[number];
  filePath: string;
}

/** getProxyConfig 的装配选项；测试可直接传入本地配置，Vite serve 可传入 logger。 */
export interface GetProxyConfigOptions {
  customDir?: string;
  localConfig?: LocalProxyConfig | null;
  logger?: (message: string) => void;
}

/** 按文件扩展名解析 JSONC 或标准 JSON，语法错误直接终止 Vite 配置加载。 */
export function parseJsoncContent(configText: string, sourceName = 'proxy.local.jsonc'): LocalProxyConfig {
  const parseErrors: ParseError[] = [];
  const isJsonFile = sourceName.endsWith('.json');
  const parsed: unknown = parseJsonc(configText, parseErrors, {
    allowTrailingComma: false,
    disallowComments: isJsonFile,
  });
  const parseError = parseErrors.at(0);
  if (parseError) {
    const syntaxName = isJsonFile ? 'JSON' : 'JSONC';
    throw new Error(
      `${sourceName} ${syntaxName} 语法错误：${printParseErrorCode(parseError.error)}，位置 ${String(parseError.offset)}`
    );
  }
  return parsed as LocalProxyConfig;
}

/** 读取首个存在的本地代理文件；JSONC 优先于 JSON。 */
export function loadLocalProxyConfig(customDir = import.meta.dirname): LoadedLocalProxyConfig | null {
  const selectedFile = LOCAL_PROXY_CONFIG_FILE_NAMES.map((fileName) => ({
    fileName,
    filePath: path.resolve(customDir, fileName),
  })).find(({ filePath }) => fs.existsSync(filePath));
  if (!selectedFile) {
    return null;
  }
  return {
    ...selectedFile,
    config: parseJsoncContent(fs.readFileSync(selectedFile.filePath, 'utf-8'), selectedFile.fileName),
  };
}

/** 将单条本地或网关约定转换为 Vite ProxyOptions。 */
function buildProxyOptions(
  ruleKey: string,
  targetKind: 'gateway' | 'local',
  options: LocalProxyItemOptions
): ProxyOptions {
  const { target, changeOrigin = true, secure = false, ws, rewrite, headers } = options;
  const rewritePattern = rewrite ? new RegExp(rewrite.pattern) : undefined;
  return {
    target,
    changeOrigin,
    secure,
    ws,
    rewrite:
      rewrite && rewritePattern
        ? (requestPath: string) => requestPath.replace(rewritePattern, rewrite.replacement)
        : undefined,
    ...(headers ? { headers } : {}),
    configure(proxyServer) {
      proxyServer.on('proxyRes', (proxyResponse) => {
        proxyResponse.headers['x-dev-proxy-target'] = targetKind;
        proxyResponse.headers['x-dev-proxy-rule'] = ruleKey;
      });
    },
  };
}

/** 按实际匹配顺序输出 API 代理概要，不对 target 的环境或用途分类。 */
function formatProxySummary(rules: readonly (readonly [string, string])[]): string {
  if (rules.length === 0) {
    return '[Vite Proxy] 未配置 API 网关';
  }
  return [
    '[Vite Proxy] API 代理：',
    ...rules.map(([ruleKey, target]) => `  ${ruleKey} -> ${new URL(target).origin}`),
  ].join('\n');
}

/** 创建本地规则优先、API_BASE_PATH 网关兜底的 Vite 8 开发代理配置。 */
export function getProxyConfig(
  env: Partial<Record<string, string>>,
  options?: GetProxyConfigOptions
): Record<string, ProxyOptions> {
  const loadedConfig = options?.localConfig === undefined ? loadLocalProxyConfig(options?.customDir) : null;
  const localConfig = options?.localConfig !== undefined ? options.localConfig : loadedConfig?.config;
  const localRules = localConfig?.['server.proxy.api'] ?? {};
  const sortedLocalRules = Object.entries(localRules).sort(([leftPrefix], [rightPrefix]) => {
    return rightPrefix.length - leftPrefix.length;
  });

  const proxyConfig: Record<string, ProxyOptions> = {};
  const proxySummaryRules: [string, string][] = [];
  for (const [ruleKey, rule] of sortedLocalRules) {
    proxyConfig[ruleKey] = buildProxyOptions(ruleKey, 'local', rule);
    proxySummaryRules.push([ruleKey, rule.target]);
  }

  const gatewayProxyPath = `${API_BASE_PATH}/`;
  const apiUrl = env.DEV_API_URL?.trim();
  const apiToken = env.DEV_API_TOKEN?.trim();
  const hasLocalApiRoot = API_BASE_PATH in localRules || gatewayProxyPath in localRules;
  const gatewayRule = apiUrl && !hasLocalApiRoot ? ([gatewayProxyPath, apiUrl] as const) : null;
  if (gatewayRule) {
    proxyConfig[gatewayProxyPath] = buildProxyOptions(gatewayProxyPath, 'gateway', {
      target: gatewayRule[1],
      ...(apiToken ? { headers: { Authorization: `Bearer ${apiToken}` } } : {}),
    });
    proxySummaryRules.push([gatewayRule[0], gatewayRule[1]]);
  }

  options?.logger?.(formatProxySummary(proxySummaryRules));
  return proxyConfig;
}
