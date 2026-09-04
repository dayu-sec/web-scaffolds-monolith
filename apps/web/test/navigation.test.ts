import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RouteObject } from 'react-router';
import { parseMenuConfig } from '../src/services/menu/schema';
import { matchNavigation } from '../src/services/navigation/match';
import { normalizeNavigationItems } from '../src/services/navigation/normalize';
import { createProjectMenuNavigationSource } from '../src/services/navigation/source';

const navigation = normalizeNavigationItems(
  createProjectMenuNavigationSource(
    parseMenuConfig([
      {
        key: 'examples',
        title: '示例',
        children: [
          { key: 'overview', title: '概览', selectRule: { path: '/examples' } },
          { key: 'detail', title: '详情', selectRule: { path: '/examples/demo' } },
        ],
      },
    ])
  )
);
const routes: RouteObject[] = [{ path: '/' }, { path: '/examples' }, { path: '/examples/:id' }];

void describe('matchNavigation', () => {
  void it('使用最长路径匹配详情页并推导父级展开态', () => {
    const match = matchNavigation(navigation, '/examples/demo/child');
    assert.deepEqual(match.selectedKeys, ['examples:0/detail:1']);
    assert.deepEqual(match.openKeys, ['examples:0']);
    assert.deepEqual(
      match.breadcrumb.items.map((item) => item.label),
      ['示例', '详情']
    );
  });

  void it('根据文件路由模式高亮任意动态参数详情 URL', () => {
    const match = matchNavigation(navigation, '/examples/browser-check', routes);
    assert.deepEqual(match.selectedKeys, ['examples:0/detail:1']);
    assert.deepEqual(
      match.breadcrumb.items.map((item) => item.label),
      ['示例', '详情']
    );
  });

  void it('未命中菜单时使用路径面包屑降级且不伪造选中项', () => {
    const match = matchNavigation(navigation, '/not-in-menu');
    assert.deepEqual(match.selectedKeys, []);
    assert.equal(match.breadcrumb.source, 'fallback');
    assert.equal(match.breadcrumb.items[0]?.label, '/not-in-menu');
  });
});
