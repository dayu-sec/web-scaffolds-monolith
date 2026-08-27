import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MOCK_MODE, resolveMockEnabled } from '../dev-mock';
import { parseJsoncContent } from '../proxy';

void describe('Mock 服务开关', () => {
  void it('默认关闭：常规 dev 启动不装配 Mock', () => {
    assert.equal(resolveMockEnabled({ mode: 'development', env: {}, localConfig: null }), false);
    assert.equal(resolveMockEnabled({ mode: 'production', env: {} }), false);
  });

  void it('`pnpm dev:mock` 的 mode 开启 Mock', () => {
    assert.equal(MOCK_MODE, 'mock');
    assert.equal(resolveMockEnabled({ mode: MOCK_MODE, env: {}, localConfig: null }), true);
  });

  void it('DEV_MOCK 只认去空白后的 true，不接受其它真值写法', () => {
    assert.equal(resolveMockEnabled({ mode: 'development', env: { DEV_MOCK: ' true ' } }), true);
    assert.equal(resolveMockEnabled({ mode: 'development', env: { DEV_MOCK: '1' } }), false);
    assert.equal(resolveMockEnabled({ mode: 'development', env: { DEV_MOCK: 'TRUE' } }), false);
    assert.equal(resolveMockEnabled({ mode: 'development', env: { DEV_MOCK: '' } }), false);
  });

  void it('本地 proxy.local.jsonc 显式开启 Mock', () => {
    const localConfig = parseJsoncContent('{ "mock": { "enabled": true } }');

    assert.equal(resolveMockEnabled({ mode: 'development', env: {}, localConfig }), true);
  });

  void it('运行时不认识的字段一律忽略，字段名由 proxy.schema.json 在编辑期约束', () => {
    const typo = parseJsoncContent('{ "mock": { "enable": true } }');

    assert.equal(resolveMockEnabled({ mode: 'development', env: {}, localConfig: typo }), false);
  });

  void it('本地配置显式 false 或未声明时保持关闭', () => {
    assert.equal(
      resolveMockEnabled({
        mode: 'development',
        env: {},
        localConfig: parseJsoncContent('{ "mock": { "enabled": false } }'),
      }),
      false
    );
    assert.equal(resolveMockEnabled({ mode: 'development', env: {}, localConfig: parseJsoncContent('{}') }), false);
  });

  void it('旧开关名不再生效，避免多入口并存', () => {
    assert.equal(resolveMockEnabled({ mode: 'development', env: { MOCK: 'true' } }), false);
    assert.equal(resolveMockEnabled({ mode: 'development', env: { VITE_ENABLE_MOCK: 'true' } }), false);
  });
});
