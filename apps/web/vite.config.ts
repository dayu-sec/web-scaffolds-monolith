import path from 'node:path';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import pc from 'picocolors';
import { createLogger, defineConfig, loadEnv } from 'vite';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';
import pages from 'vite-plugin-pages';
import ViteRestart from 'vite-plugin-restart';

import { name as appName, version as appVersion } from '../../package.json';
import { getProxyConfig, LOCAL_PROXY_CONFIG_FILE_NAMES } from './proxy';
import { API_BASE_PATH } from './src/constants/api';

/**
 * 给 proxy.ts 输出的纯文本代理摘要追加终端高亮；proxy.ts 本身及其测试断言的原始文本保持不变，
 * 上色只发生在这一层展示代码里。
 */
function highlightProxySummary(message: string): string {
  return message
    .replace(/^\[Vite Proxy\]/mu, (tag) => pc.bold(pc.cyan(tag)))
    .replace(
      /^(\s+)(\S+)( -> )(\S+)$/gmu,
      (_line, indent: string, ruleKey: string, arrow: string, target: string) =>
        `${indent}${pc.green(ruleKey)}${pc.dim(arrow)}${pc.yellow(target)}`
    );
}

// 配置 Vite
// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number.parseInt(env.DEV_SERVER_PORT || '5173', 10);
  const base = env.VITE_APP_BASE || '/';
  const logger = createLogger();
  const isDevServer = command === 'serve';

  return {
    /**
     * 共享选项，适用于开发、构建和预览
     * https://cn.vite.dev/config/shared-options
     */

    // 开发或生产环境服务的公共基础路径
    base,

    // 定义全局常量替换方式，在开发环境下会被定义在全局，而在构建时被静态替换
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __APP_NAME__: JSON.stringify(appName),
    },

    customLogger: logger,

    // 替换 `import` 或 `require` 语句中值的别名
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '#': path.resolve(import.meta.dirname, 'mock'),
      },
    },

    // 插件列表
    plugins: [
      tailwindcss(),

      /**
       * https://inspector.fe-dev.cn/guide/start.html
       * 必须位于 React 插件之前，才能在 JSX 转换前注入源码定位信息。
       * 按 Option/Alt + Shift + 鼠标点击 DOM 元素，即可在 IDE 中打开对应的源代码位置。
       */
      codeInspectorPlugin({
        bundler: 'vite',
        // hideConsole: true,
      }),

      // 提供 JSX/TSX 转换、Fast Refresh 热更新、自动 JSX runtime 注入这些基础能力
      react(),

      // 预置文件过滤规则 (React Compiler 依赖 Babel 插件生态，给 Rolldown 这个 Rust bundler 补上用 Babel 转换代码的能力)
      babel({ presets: [reactCompilerPreset()] }),

      /**
       * 基于文件系统自动生成路由配置
       * https://www.npmjs.com/package/vite-plugin-pages
       * + Basic Routing
       *   - `src/views/pages/users.tsx` -> `/users`
       *   - `src/views/pages/users/profile.tsx` -> `/users/profile`
       * + Index Routes
       *   - `src/views/pages/index.tsx` -> `/`
       *   - `src/views/pages/users/index.tsx` -> `/users`
       * + Dynamic Routes
       *   - `src/views/pages/users/[id].tsx` -> `/users/:id`，示例：`/users/123`
       *   - `src/views/pages/[user]/settings.tsx` -> `/:user/settings`，示例：`/123/settings`
       */
      pages({
        dirs: [{ dir: 'src/views/pages', baseRoute: '' }],
        // pages 目录只存放文件路由入口，不用排除规则为非路由模块兜底。
        importMode: mode === 'development' ? 'sync' : 'async',
      }),

      /**
       * https://www.npmjs.com/package/vite-plugin-mock-dev-server
       * 在开发环境里搭一个 mock API 服务器
       */
      mockDevServerPlugin({
        prefix: API_BASE_PATH,
      }),

      // 本地多微服务代理：修改 proxy.local.jsonc / proxy.local.json 后由 vite-plugin-restart 重启开发服务。
      ViteRestart({
        restart: [...LOCAL_PROXY_CONFIG_FILE_NAMES],
      }),
    ],

    /**
     * 构建选项
     * https://cn.vite.dev/config/build-options
     */
    build: {
      emptyOutDir: true,
      outDir: '../../dist',
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                priority: 30,
                test: /node_modules[\\/](?:react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              {
                name: 'ui-vendor',
                priority: 20,
                test: /node_modules[\\/](?:@base-ui|react-hook-form|@hookform)[\\/]/,
              },
              {
                name: 'vendor',
                minSize: 20_000,
                priority: 10,
                test: /node_modules[\\/]/,
              },
            ],
          },
        },
      },
    },

    /**
     * 开发服务器选项，仅适用于开发环境
     * https://cn.vite.dev/config/server-options
     */
    server: {
      host: '0.0.0.0',
      cors: true,
      port,
      proxy: isDevServer
        ? getProxyConfig(env, {
            logger: (message) => {
              logger.info(highlightProxySummary(message));
            },
          })
        : {},
      // 支持在远程开发环境中运行
      allowedHosts: ['.github.dev', '.cnb.run'],
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
