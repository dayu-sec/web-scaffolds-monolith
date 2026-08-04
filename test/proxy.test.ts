import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getProxyConfig } from '../proxy';
import { API_BASE_PATH } from '../src/constants/api';

void describe('getProxyConfig', () => {
  void it('未配置有效上游时不创建远端代理', () => {
    assert.deepEqual(getProxyConfig({}), {});
    assert.deepEqual(getProxyConfig({ DEV_API_URL: '   ' }), {});
  });

  void it('为统一 API 根路径创建代理并保留完整请求路径', () => {
    const config = getProxyConfig({ DEV_API_URL: ' https://gateway.example.invalid/ ' });
    const proxy = config[`${API_BASE_PATH}/`];

    assert.deepEqual(Object.keys(config), [`${API_BASE_PATH}/`]);
    assert.equal(proxy.target, 'https://gateway.example.invalid/');
    assert.equal(proxy.changeOrigin, true);
    assert.equal(proxy.secure, false);
    assert.equal(proxy.rewrite, undefined);
  });

  void it('只为非空 Token 添加 Bearer 请求头', () => {
    const withToken = getProxyConfig({
      DEV_API_TOKEN: ' token-value ',
      DEV_API_URL: 'https://gateway.example.invalid',
    });
    const withoutToken = getProxyConfig({
      DEV_API_TOKEN: '   ',
      DEV_API_URL: 'https://gateway.example.invalid',
    });

    assert.deepEqual(withToken[`${API_BASE_PATH}/`].headers, {
      Authorization: 'Bearer token-value',
    });
    assert.equal(withoutToken[`${API_BASE_PATH}/`].headers, undefined);
  });
});
