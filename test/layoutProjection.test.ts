import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { NavigationItem, NavigationMatch } from '../src/types/navigation';
import { createShellNavigationProjection, resolveNavigationIntent } from '../src/views/layout/navigationProjection';

const items: NavigationItem[] = [
  {
    key: 'examples',
    label: '示例',
    children: [
      { key: 'overview', label: '概览', path: '/examples' },
      { key: 'detail', label: '详情', path: '/examples/demo' },
    ],
  },
  { key: 'home', label: '首页', path: '/' },
];

const match: NavigationMatch = {
  activeItem: items[0]?.children?.[1] ?? null,
  breadcrumb: { activePath: '/examples/demo', items: [], source: 'menu' },
  openKeys: ['examples'],
  selectedKeys: ['detail'],
};

void describe('createShellNavigationProjection', () => {
  void it('mix 把一级菜单放顶部并把当前子菜单放侧栏', () => {
    const projection = createShellNavigationProjection('mix', items, match, 'success');
    assert.equal(projection.hasAside, true);
    assert.deepEqual(
      projection.topItems.map((item) => item.key),
      ['examples', 'home']
    );
    assert.deepEqual(
      projection.asideItems.map((item) => item.key),
      ['overview', 'detail']
    );
    assert.deepEqual(projection.topMatch.selectedKeys, ['examples']);
  });

  void it('side 与 side-compact 使用完整侧栏，top 只使用顶部菜单', () => {
    for (const mode of ['side', 'side-compact'] as const) {
      const projection = createShellNavigationProjection(mode, items, match, 'success');
      assert.equal(projection.hasAside, true);
      assert.deepEqual(projection.asideItems, items);
    }
    const top = createShellNavigationProjection('top', items, match, 'success');
    assert.equal(top.hasAside, false);
    assert.deepEqual(top.topItems, items);
  });

  void it('分组节点导航到第一个可访问子项', () => {
    assert.equal(resolveNavigationIntent(items[0])?.path, '/examples');
  });
});
