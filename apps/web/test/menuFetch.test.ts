import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MenuConfigError } from '../src/services/menu/error';
import { fetchMenuConfigFrom } from '../src/services/menu/fetch';

function expectMenuError(kind: MenuConfigError['kind']) {
  return (error: unknown) => error instanceof MenuConfigError && error.kind === kind;
}

void describe('fetchMenuConfigFrom', () => {
  void it('接受有效菜单响应', async () => {
    const menu = await fetchMenuConfigFrom('/menu.json', undefined, async () =>
      Promise.resolve(
        new Response(JSON.stringify([{ key: 'home', title: '首页', selectRule: { path: '/' } }]), { status: 200 })
      )
    );
    assert.equal(menu[0]?.key, 'home');
  });

  void it('把网络异常和非成功状态归类为 fetch 错误', async () => {
    await assert.rejects(
      fetchMenuConfigFrom('/menu.json', undefined, async () => Promise.reject(new Error('offline'))),
      expectMenuError('fetch')
    );
    await assert.rejects(
      fetchMenuConfigFrom('/menu.json', undefined, async () => Promise.resolve(new Response(null, { status: 404 }))),
      expectMenuError('fetch')
    );
  });

  void it('区分非法 JSON 与 Schema 契约错误', async () => {
    await assert.rejects(
      fetchMenuConfigFrom('/menu.json', undefined, async () => Promise.resolve(new Response('{', { status: 200 }))),
      expectMenuError('parse')
    );
    await assert.rejects(
      fetchMenuConfigFrom('/menu.json', undefined, async () =>
        Promise.resolve(new Response(JSON.stringify([{ key: '' }]), { status: 200 }))
      ),
      expectMenuError('contract')
    );
  });
});
