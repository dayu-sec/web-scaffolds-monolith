import fs from 'node:fs';
import path from 'node:path';
import type { ParseError } from 'jsonc-parser';
import { parse as parseJsonc, printParseErrorCode } from 'jsonc-parser';
import type { ProxyOptions } from 'vite';
import { API_BASE_PATH } from './src/constants/api';

/**
 * 本地开发配置与 Vite 开发代理的唯一装配点。
 *
 * 模块负责三件事：发现并解析开发者本机的 `proxy.local.jsonc`、按约定校验字段、
 * 把校验后的约定编译成 Vite `server.proxy` 并输出启动摘要。
 * 不负责浏览器 API 根的定义（由 `src/constants/api.ts` 的 `API_BASE_PATH` 拥有），
 * 也不负责 Mock 开关的语义（由 `dev-mock.ts` 拥有），本模块只提供它读取的配置字段。
 *
 * 全模块的错误策略是快速失败：本地配置是开发者唯一入口，字段名或类型写错必须立刻暴露，
 * 不做兼容、不回落默认值，否则会出现「以为改了配置其实没生效」。
 */

/**
 * 本地开发配置文件名。
 *
 * 运行时只读这一个文件，格式固定为 JSONC（可写注释和尾随逗号）。
 */
export const LOCAL_PROXY_CONFIG_FILE_NAME = 'proxy.local.jsonc';

/**
 * JSONC/JSON 中可序列化的正则路径重写约定。
 *
 * `pattern` 是 RegExp source，不含 `/.../` 分隔符，当前版本不支持 flags；
 * `replacement` 允许空字符串，表示把匹配段整体删除。
 */
export interface LocalProxyRewrite {
  pattern: string;
  replacement: string;
}

/**
 * 单条本地代理规则。
 *
 * 字段与项目支持的 Vite 8 代理选项一致，但默认值由本模块决定而非沿用 Vite：
 * `changeOrigin` 默认 true、`secure` 默认 false，便于直连自签证书的本机服务。
 */
export interface LocalProxyItemOptions {
  /**
   * 上游绝对地址，协议限于 `TARGET_PROTOCOLS`。
   *
   * 必须能被 `URL` 解析：转发和启动摘要的 origin 都依赖它。
   */
  target: string;
  changeOrigin?: boolean;
  secure?: boolean;
  ws?: boolean;
  /**
   * 覆盖共享 Token。
   *
   * 声明即终结：写了这个字段就不再继承 `server.proxy.token` 或 `DEV_API_TOKEN`，
   * 去除首尾空白后为空表示该规则显式不发送 Authorization。
   */
  token?: string;
  /**
   * 路径改写。
   *
   * 大多数上游接收完整浏览器路径，不需要配置；只有上游不接收 API 根前缀时才声明。
   */
  rewrite?: LocalProxyRewrite;
  /**
   * 只发给该上游的自定义请求头。
   *
   * 任意头的逃生口，合并时排在注入的 Authorization 之后，同名头以此处声明为准。
   */
  headers?: Record<string, string>;
}

/**
 * 本地 Mock 选项。
 *
 * 由开发人员在本机显式声明，文件被 Git 忽略，不会影响其他开发者；
 * 它只控制 Mock 服务是否装配，单个端点是否拦截仍由各自的 `defineMock` 记录决定。
 */
export interface LocalMockConfig {
  enabled?: boolean;
}

/**
 * 本地开发配置文件约定。
 *
 * 字段约束以 `proxy.schema.json` 为准，通过文件顶部的 `$schema` 在编辑期生效；运行时只解析不校验。
 * 文件名保留 `proxy.` 前缀是历史沿革，不限定它只配置代理。
 */
export interface LocalProxyConfig {
  $schema?: string;
  mock?: LocalMockConfig;
  /**
   * 开发服务端口；缺省时由调用方回退 `DEV_SERVER_PORT`，再回退 Vite 默认端口。
   */
  'server.port'?: number;
  /**
   * 共享 Bearer Token，默认发给全部代理规则与网关兜底规则。
   *
   * 扩散面大于单条规则，启动摘要会按规则标注来源以便核对；
   * 单条规则可用自己的 `token` 覆盖或关闭。
   */
  'server.proxy.token'?: string;
  /**
   * 代理路由映射，key 是浏览器请求的显式 URL 路径前缀。
   *
   * 装配时按 key 长度从长到短排序，长前缀先匹配；开发者可以声明包括 API 根在内的任意路径，
   * 覆盖范围由配置者负责。
   */
  'server.proxy.api'?: Record<string, LocalProxyItemOptions>;
}

/**
 * `getProxyConfig()` 的装配选项。
 */
export interface GetProxyConfigOptions {
  /**
   * 配置文件查找目录，默认当前模块所在目录；测试用它指向临时目录。
   */
  customDir?: string;
  /**
   * 直接传入已解析的本地配置，跳过磁盘读取。
   *
   * 三态语义不可混用：`undefined` 表示从磁盘读取，`null` 表示明确没有本地配置，
   * 对象表示使用给定配置。测试依赖 `null` 得到与「文件不存在」一致的行为。
   */
  localConfig?: LocalProxyConfig | null;
  /**
   * 启动摘要输出通道。
   *
   * 只有 Vite serve 会传入；这里输出纯文本，终端上色由 `vite.config.ts` 那一层负责，
   * 保证本模块与其测试断言的字符串保持稳定。
   */
  logger?: (message: string) => void;
}

/**
 * Authorization 的生效来源。
 *
 * 只用于启动摘要标注，让「Token 发给了哪些服务」可核对；不携带也不输出 Token 值。
 */
export type ProxyTokenSource = 'env' | 'headers' | 'rule' | 'shared';

/**
 * 单条规则的 Authorization 解析结果。
 */
interface ResolvedProxyToken {
  /**
   * 需要注入的 Authorization 头值；规则自带 Authorization 或显式关闭时为 undefined。
   */
  header?: string;
  /**
   * 最终生效的来源；该规则不发送 Authorization 时为 null。
   */
  source: ProxyTokenSource | null;
}

/**
 * 启动摘要中的单条代理信息。
 */
interface ProxySummaryRule {
  ruleKey: string;
  target: string;
  tokenSource: ProxyTokenSource | null;
}

/**
 * 解析并校验本地开发配置文本。
 *
 * 按 JSONC 惯例解析：允许注释和尾随逗号，与 `tsconfig.json`、VS Code `settings.json` 一致，
 * 注释掉最后一项后留下的逗号是手写常态，不是错误。
 *
 * `sourceName` 只用于错误信息，让报错指向具体文件；语法错误以异常形式抛出，调用方不需要判空。
 *
 * 字段名与取值都不在运行时校验：`proxy.schema.json` 通过文件顶部的 `$schema` 在编辑期约束配置项
 * （四层 `additionalProperties: false`），取值错误由 `URL`、`RegExp`、Vite 自身在装配或运行时抛出。
 */
export function parseJsoncContent(configText: string, sourceName = LOCAL_PROXY_CONFIG_FILE_NAME): LocalProxyConfig {
  const parseErrors: ParseError[] = [];
  const parsed: unknown = parseJsonc(configText, parseErrors, { allowTrailingComma: true });
  // 只报告首个语法错误：后续错误多为前一个错误的连锁结果，全部列出反而干扰定位。
  const parseError = parseErrors.at(0);
  if (parseError) {
    throw new Error(
      `${sourceName} JSONC 语法错误：${printParseErrorCode(parseError.error)}，位置 ${String(parseError.offset)}`
    );
  }
  return parsed as LocalProxyConfig;
}

/**
 * 读取本地开发配置文件。
 *
 * 文件不存在返回 null，代表开发者没有本地配置，是合法状态而非错误；
 * 存在但内容不合约定则抛错。同步读取：Vite 配置加载阶段本身同步执行。
 */
export function loadLocalProxyConfig(customDir = import.meta.dirname): LocalProxyConfig | null {
  const filePath = path.resolve(customDir, LOCAL_PROXY_CONFIG_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return parseJsoncContent(fs.readFileSync(filePath, 'utf-8'), LOCAL_PROXY_CONFIG_FILE_NAME);
}

/**
 * 解析单条规则最终发送的 Authorization。
 *
 * 优先级为 `headers.Authorization` > 规则 `token` > 共享 `server.proxy.token` > `DEV_API_TOKEN`；
 * 声明即终结：某一层写了 `token` 就不再向上继承，去除首尾空白后为空表示显式关闭。
 *
 * 网关兜底规则复用同一套解析，传入空规则即可，避免共享 Token 出现第二套优先级。
 */
function resolveProxyToken(
  options: Pick<LocalProxyItemOptions, 'headers' | 'token'>,
  sharedToken: string | undefined,
  envToken: string | undefined
): ResolvedProxyToken {
  // 规则自带 Authorization 时不再注入；装配处的展开顺序已让它覆盖共享 Token，这里只为摘要标注来源。
  if (options.headers?.Authorization !== undefined) return { source: 'headers' };

  const declaredTokens: readonly (readonly [string | undefined, ProxyTokenSource])[] = [
    [options.token, 'rule'],
    [sharedToken, 'shared'],
    [envToken, 'env'],
  ];
  for (const [value, source] of declaredTokens) {
    // 未声明才继续向上一层查找；声明了空白值属于显式关闭，直接终止。
    if (value === undefined) continue;
    const token = value.trim();
    return token ? { header: `Bearer ${token}`, source } : { source: null };
  }
  return { source: null };
}

/**
 * 把已校验的 rewrite 约定编译成 Vite 需要的路径改写函数。
 *
 * 正则在装配期编译一次并被闭包持有，不在每次请求时重复编译。
 */
function createRewrite({ pattern, replacement }: LocalProxyRewrite): (requestPath: string) => string {
  const compiled = new RegExp(pattern);
  return (requestPath: string) => requestPath.replace(compiled, replacement);
}

/**
 * 将单条本地或网关约定转换为 Vite ProxyOptions。
 *
 * `targetKind` 只影响响应标识，不改变转发行为，用于在浏览器里区分请求命中的是
 * 开发者声明的本地规则还是常量派生的网关兜底规则。
 */
function buildProxyOptions(
  ruleKey: string,
  targetKind: 'gateway' | 'local',
  options: LocalProxyItemOptions
): ProxyOptions {
  const { target, changeOrigin = true, secure = false, ws, rewrite, headers } = options;
  return {
    target,
    changeOrigin,
    secure,
    ws,
    rewrite: rewrite ? createRewrite(rewrite) : undefined,
    ...(headers ? { headers } : {}),
    configure(proxyServer) {
      // 只回写命中规则的标识，不暴露完整 target、Token 或请求头。
      proxyServer.on('proxyRes', (proxyResponse) => {
        proxyResponse.headers['x-dev-proxy-target'] = targetKind;
        proxyResponse.headers['x-dev-proxy-rule'] = ruleKey;
      });
    },
  };
}

/**
 * 按实际匹配顺序输出 API 代理概要，不对 target 的环境或用途分类。
 *
 * 只输出 origin，不输出完整 target 的路径和查询串，避免把凭据带进日志。
 * 共享 Token 默认发给全部规则，扩散面比单条网关规则大，因此逐条标注 Authorization 来源，
 * 让「Token 发给了哪些服务」在启动那一眼可核对；只标来源，不输出 Token 值。
 *
 * 返回纯文本，终端上色由调用方负责。
 */
function formatProxySummary(rules: readonly ProxySummaryRule[]): string {
  if (rules.length === 0) {
    return '[Vite Proxy] 未配置 API 网关';
  }
  return [
    '[Vite Proxy] API 代理：',
    ...rules.map(({ ruleKey, target, tokenSource }) => {
      const tokenMark = tokenSource ? `  [token: ${tokenSource}]` : '';
      return `  ${ruleKey} -> ${new URL(target).origin}${tokenMark}`;
    }),
  ].join('\n');
}

/**
 * 创建本地规则优先、`API_BASE_PATH` 网关兜底的 Vite 8 开发代理配置。
 *
 * 返回值可直接作为 `server.proxy`；没有任何规则时返回空对象，此时未匹配的请求由 Vite 自己处理，
 * 不会形成自代理。传入 `logger` 时同步输出启动摘要，这是本函数唯一的副作用。
 *
 * `env` 只读取 `DEV_API_URL` 与 `DEV_API_TOKEN` 两个 Vite 进程内部变量，两者都是弱化保留的兜底，
 * 本地配置声明了同名项时以配置文件为准。
 */
export function getProxyConfig(
  env: Partial<Record<string, string>>,
  options?: GetProxyConfigOptions
): Record<string, ProxyOptions> {
  const localConfig =
    options?.localConfig === undefined ? loadLocalProxyConfig(options?.customDir) : options.localConfig;
  const localRules = localConfig?.['server.proxy.api'] ?? {};
  const sharedToken = localConfig?.['server.proxy.token'];
  const envToken = env.DEV_API_TOKEN;
  // 长前缀先注册：Vite 代理按声明顺序匹配，短前缀在前会把更具体的规则整个吃掉。
  const sortedLocalRules = Object.entries(localRules).sort(([leftPrefix], [rightPrefix]) => {
    return rightPrefix.length - leftPrefix.length;
  });

  const proxyConfig: Record<string, ProxyOptions> = {};
  const proxySummaryRules: ProxySummaryRule[] = [];
  for (const [ruleKey, rule] of sortedLocalRules) {
    const { header, source } = resolveProxyToken(rule, sharedToken, envToken);
    // headers 是任意头的逃生口，同名头以开发者显式声明的为准。
    const headers = header ? { Authorization: header, ...rule.headers } : rule.headers;
    proxyConfig[ruleKey] = buildProxyOptions(ruleKey, 'local', { ...rule, headers });
    proxySummaryRules.push({ ruleKey, target: rule.target, tokenSource: source });
  }

  const gatewayProxyPath = `${API_BASE_PATH}/`;
  const apiUrl = env.DEV_API_URL?.trim();
  // 开发者声明了 API 根规则就完全交给他，不再追加网关兜底，避免两条规则争抢同一段路径。
  const hasLocalApiRoot = API_BASE_PATH in localRules || gatewayProxyPath in localRules;
  if (apiUrl && !hasLocalApiRoot) {
    const { header, source } = resolveProxyToken({}, sharedToken, envToken);
    proxyConfig[gatewayProxyPath] = buildProxyOptions(gatewayProxyPath, 'gateway', {
      target: apiUrl,
      ...(header ? { headers: { Authorization: header } } : {}),
    });
    proxySummaryRules.push({ ruleKey: gatewayProxyPath, target: apiUrl, tokenSource: source });
  }

  options?.logger?.(formatProxySummary(proxySummaryRules));
  return proxyConfig;
}
