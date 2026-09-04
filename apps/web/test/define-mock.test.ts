import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { defineMock } from '../mock/defineMock';
import { API_BASE_PATH } from '../src/constants/api';

void describe('Mock 端点公共层', () => {
  void it('补齐 API 根路径，入口只声明微服务名与端点', () => {
    const mock = defineMock({ url: '/system/health', enabled: true, body: { status: 'ok' } });

    assert.equal(mock.url, `${API_BASE_PATH}/system/health`);
  });

  void it('不改写 enabled 语义，原样保留插件默认值', () => {
    assert.equal(defineMock({ url: '/system/health', body: {} }).enabled, undefined);
    assert.equal(defineMock({ url: '/system/health', enabled: false, body: {} }).enabled, false);
    assert.equal(defineMock({ url: '/system/health', enabled: true, body: {} }).enabled, true);
  });

  void it('数组导出逐条应用公共层', () => {
    const mocks = defineMock([
      { url: '/system/health', enabled: true, body: {} },
      { url: '/system/ready', body: {} },
    ]);

    assert.deepEqual(
      mocks.map((mock) => [mock.url, mock.enabled]),
      [
        [`${API_BASE_PATH}/system/health`, true],
        [`${API_BASE_PATH}/system/ready`, undefined],
      ]
    );
  });
});
