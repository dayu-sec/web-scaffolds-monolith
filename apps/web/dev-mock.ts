import type { LocalProxyConfig } from './proxy';

/**
 * `pnpm dev:mock` 使用的 Vite mode。
 *
 * 它只表达“开启 Mock 服务”，不参与环境变量文件的选择：`loadEnv` 仍按 development 读取，
 * 否则 `.env.development.local` 在 Mock 模式下会整份失效。
 */
export const MOCK_MODE = 'mock';

/**
 * Mock 开关解析入参。
 *
 * env 与本地配置都由调用方读取后传入，保证解析本身是纯函数、可被测试直接覆盖。
 */
export interface ResolveMockEnabledOptions {
  mode: string;
  env: Partial<Record<string, string>>;
  localConfig?: LocalProxyConfig | null;
}

/**
 * 解析当前 Vite 进程是否装配 Mock 服务。
 *
 * 三个开关是「或」关系，任一显式声明为开即开启：`pnpm dev:mock`、`DEV_MOCK=true`、
 * 本地 `proxy.local.jsonc` 的 `"mock": { "enabled": true }`。命令行形态必须能压过配置文件，
 * 否则 `pnpm dev:mock` 会被一份历史配置否决，因此这里不采用「文件优先于 env」的取值语义。
 *
 * 默认关闭，保证仓库里遗留的 Mock 记录不会拦截其他开发者的常规启动。
 * 它只决定服务是否装配；单个端点是否被拦截由各自 `defineMock` 记录的 `enabled` 决定。
 */
export function resolveMockEnabled({ mode, env, localConfig }: ResolveMockEnabledOptions): boolean {
  if (mode === MOCK_MODE) return true;
  if (env.DEV_MOCK?.trim() === 'true') return true;
  return localConfig?.mock?.enabled === true;
}
