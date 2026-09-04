import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RouteObject } from 'react-router';
import { validateMenuRouteCoverage } from '../src/services/menu/routeCoverage';
import { parseMenuConfig } from '../src/services/menu/schema';

const routes: RouteObject[] = [{ path: '/' }, { path: '/examples' }, { path: '/examples/:id' }];

void describe('validateMenuRouteCoverage', () => {
  void it('接受静态、动态文件路由和外链', () => {
    const config = parseMenuConfig([
      { key: 'home', title: '首页', selectRule: { path: '/' } },
      { key: 'static', title: '静态', selectRule: { path: '/examples' } },
      { key: 'dynamic', title: '动态', selectRule: { path: '/examples/demo' } },
      { key: 'external', title: '外部', selectRule: { href: 'https://example.invalid' } },
    ]);
    assert.doesNotThrow(() => {
      validateMenuRouteCoverage(config, routes);
    });
  });

  void it('拒绝没有对应文件路由的内部菜单路径', () => {
    const config = parseMenuConfig([{ key: 'missing', title: '缺失', selectRule: { path: '/missing' } }]);
    assert.throws(() => {
      validateMenuRouteCoverage(config, routes);
    }, /\/missing/);
  });
});
