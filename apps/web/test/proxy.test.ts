import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { createServer as createViteServer } from 'vite';

import { getProxyConfig, loadLocalProxyConfig, parseJsoncContent } from '../proxy';
import { API_BASE_PATH } from '../src/constants/api';

function listen(server: ReturnType<typeof createHttpServer>): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('测试 HTTP 服务未获得 TCP 端口'));
        return;
      }
      resolve(address.port);
    });
  });
}

function close(server: ReturnType<typeof createHttpServer>): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}

async function reserveAvailablePort(): Promise<number> {
  const server = createHttpServer();
  const port = await listen(server);
  await close(server);
  return port;
}

void describe('本地开发代理配置', () => {
  void it('解析 JSONC 注释并报告语法错误', () => {
    const parsed = parseJsoncContent(`{
      // 本地服务使用显式浏览器路径
      "server.proxy.api": {
        "/dysec/api/example-service": {
          "target": "http://127.0.0.1:8080"
        }
      }
    }`);

    assert.equal(parsed['server.proxy.api']?.['/dysec/api/example-service']?.target, 'http://127.0.0.1:8080');
    assert.throws(() => parseJsoncContent('{"server.proxy.api":', 'proxy.local.jsonc'), /JSONC 语法错误/u);
  });

  void it('按最长路径优先，并只在显式配置时执行正则重写', () => {
    const gatewayProxyPath = `${API_BASE_PATH}/`;
    const proxyConfig = getProxyConfig(
      { DEV_API_TOKEN: ' gateway-token ', DEV_API_URL: ' http://gateway.local ' },
      {
        localConfig: {
          'server.proxy.api': {
            '/dysec/api/example': { target: 'http://example.local' },
            '/dysec/api/example-service': {
              target: 'http://example-service.local',
              headers: { Authorization: 'Basic local-token' },
              rewrite: { pattern: '^/dysec/api/example-service', replacement: '' },
            },
          },
        },
      }
    );

    assert.deepEqual(Object.keys(proxyConfig), ['/dysec/api/example-service', '/dysec/api/example', gatewayProxyPath]);
    assert.equal(proxyConfig['/dysec/api/example-service'].rewrite?.('/dysec/api/example-service/items'), '/items');
    assert.equal(proxyConfig['/dysec/api/example'].rewrite, undefined);
    assert.deepEqual(proxyConfig['/dysec/api/example-service'].headers, { Authorization: 'Basic local-token' });
    assert.deepEqual(proxyConfig[gatewayProxyPath].headers, { Authorization: 'Bearer gateway-token' });
    assert.equal(proxyConfig[gatewayProxyPath].rewrite, undefined);
  });

  void it('保留开发者声明的 API 根规则且不追加远程网关', () => {
    const proxyConfig = getProxyConfig(
      { DEV_API_URL: 'http://gateway.local' },
      {
        localConfig: {
          'server.proxy.api': {
            [API_BASE_PATH]: { target: 'http://root-local.local' },
          },
        },
      }
    );

    assert.deepEqual(Object.keys(proxyConfig), [API_BASE_PATH]);
    assert.equal(proxyConfig[API_BASE_PATH].target, 'http://root-local.local');
  });

  void it('旧业务环境变量不再创建本地规则，空白网关不创建代理', () => {
    const gatewayProxyPath = `${API_BASE_PATH}/`;
    assert.deepEqual(
      Object.keys(
        getProxyConfig(
          {
            DEV_API_URL: 'http://gateway.local',
            DEV_LOG_QUERY_API_URL: 'http://log-query.local',
            DEV_SECURITY_OPERATIONS_SERVICE_URL: 'http://operations.local',
            VITE_API_URL: 'http://legacy-user-center.local',
          },
          { localConfig: null }
        )
      ),
      [gatewayProxyPath]
    );
    assert.deepEqual(getProxyConfig({ DEV_API_TOKEN: 'token', DEV_API_URL: ' ' }, { localConfig: null }), {});
  });

  void it('JSONC 优先于 JSON，删除后读取 JSON', (context) => {
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'soc-proxy-config-'));
    context.after(() => {
      fs.rmSync(configDir, { force: true, recursive: true });
    });
    const jsoncPath = path.join(configDir, 'proxy.local.jsonc');
    const jsonPath = path.join(configDir, 'proxy.local.json');
    fs.writeFileSync(jsonPath, '{"server.proxy.api":{ "/json":{"target":"http://127.0.0.1:8001"}}}', 'utf-8');
    fs.writeFileSync(jsoncPath, '{"server.proxy.api":{ "/jsonc":{"target":"http://127.0.0.1:8002"}}}', 'utf-8');

    assert.equal(loadLocalProxyConfig(configDir)?.fileName, 'proxy.local.jsonc');
    fs.rmSync(jsoncPath);
    assert.equal(loadLocalProxyConfig(configDir)?.fileName, 'proxy.local.json');
  });

  void it('版本控制中的模板只配置路径和 target', () => {
    const examplePath = path.resolve(import.meta.dirname, '../proxy.local.jsonc.example');
    const exampleConfig = parseJsoncContent(fs.readFileSync(examplePath, 'utf-8'), path.basename(examplePath));
    const proxyConfig = getProxyConfig({}, { localConfig: exampleConfig });

    assert.deepEqual(Object.keys(proxyConfig), ['/dysec/api/example-service']);
    assert.equal(proxyConfig['/dysec/api/example-service'].target, 'http://127.0.0.1:8080');
    assert.equal(proxyConfig['/dysec/api/example-service'].rewrite, undefined);
  });

  void it('真实 Vite 代理区分本地规则与远程网关', async (context) => {
    const requests: { authorization?: string; kind: 'gateway' | 'local'; url?: string }[] = [];
    const localServer = createHttpServer((request, response) => {
      requests.push({ authorization: request.headers.authorization, kind: 'local', url: request.url });
      response.end('local');
    });
    const gatewayServer = createHttpServer((request, response) => {
      requests.push({ authorization: request.headers.authorization, kind: 'gateway', url: request.url });
      response.end('gateway');
    });
    const localPort = await listen(localServer);
    const gatewayPort = await listen(gatewayServer);
    const viteRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'soc-vite-proxy-'));
    const vitePort = await reserveAvailablePort();
    const vite = await createViteServer({
      appType: 'custom',
      configFile: false,
      root: viteRoot,
      server: {
        host: '127.0.0.1',
        port: vitePort,
        proxy: getProxyConfig(
          {
            DEV_API_TOKEN: ' gateway-token ',
            DEV_API_URL: `http://127.0.0.1:${String(gatewayPort)}`,
          },
          {
            localConfig: {
              'server.proxy.api': {
                '/dysec/api/example-service': {
                  target: `http://127.0.0.1:${String(localPort)}`,
                  headers: { Authorization: 'Basic local-token' },
                },
              },
            },
          }
        ),
        strictPort: true,
      },
    });
    await vite.listen();
    context.after(async () => {
      await vite.close();
      await Promise.all([close(localServer), close(gatewayServer)]);
      fs.rmSync(viteRoot, { force: true, recursive: true });
    });
    const viteAddress = vite.httpServer?.address();
    assert.ok(viteAddress && typeof viteAddress !== 'string');
    const origin = `http://127.0.0.1:${String(viteAddress.port)}`;

    const localResponse = await fetch(`${origin}/dysec/api/example-service/items`);
    const gatewayResponse = await fetch(`${origin}/dysec/api/another-service/items`);

    assert.equal(await localResponse.text(), 'local');
    assert.equal(localResponse.headers.get('x-dev-proxy-target'), 'local');
    assert.equal(await gatewayResponse.text(), 'gateway');
    assert.equal(gatewayResponse.headers.get('x-dev-proxy-target'), 'gateway');
    assert.deepEqual(requests, [
      { authorization: 'Basic local-token', kind: 'local', url: '/dysec/api/example-service/items' },
      { authorization: 'Bearer gateway-token', kind: 'gateway', url: '/dysec/api/another-service/items' },
    ]);
  });

  void it('启动时按优先级输出全部 API 代理清单', () => {
    const messages: string[] = [];
    getProxyConfig(
      { DEV_API_URL: 'http://gateway.local/private?ignored=true' },
      {
        localConfig: {
          'server.proxy.api': {
            '/dysec/api/example-service': { target: 'http://127.0.0.1:8080' },
            '/third-party/api': { target: 'https://online.local/private?ignored=true' },
          },
        },
        logger: (message) => {
          messages.push(message);
        },
      }
    );

    assert.deepEqual(messages, [
      `[Vite Proxy] API 代理：\n  /dysec/api/example-service -> http://127.0.0.1:8080\n  /third-party/api -> https://online.local\n  ${API_BASE_PATH}/ -> http://gateway.local`,
    ]);
  });

  void it('只有本地规则时仍输出 API 代理清单', () => {
    const messages: string[] = [];
    getProxyConfig(
      {},
      {
        localConfig: {
          'server.proxy.api': {
            '/local': { target: 'http://127.0.0.1:8080' },
          },
        },
        logger: (message) => {
          messages.push(message);
        },
      }
    );

    assert.deepEqual(messages, ['[Vite Proxy] API 代理：\n  /local -> http://127.0.0.1:8080']);
  });

  void it('没有任何代理规则时提示未配置 API 网关', () => {
    const messages: string[] = [];
    getProxyConfig(
      {},
      {
        localConfig: null,
        logger: (message) => {
          messages.push(message);
        },
      }
    );

    assert.deepEqual(messages, ['[Vite Proxy] 未配置 API 网关']);
  });
});
