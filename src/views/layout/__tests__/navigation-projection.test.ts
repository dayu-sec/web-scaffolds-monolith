import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { NavigationItem, NavigationMatch } from '@/types/navigation';

import { isShellLayoutMode } from '../utils/layout-mode.js';
import { createShellNavigationProjection, resolveNavigationIntent } from '../utils/navigation-projection.js';

const navigationItems: NavigationItem[] = [
  {
    key: 'examples',
    label: '示例',
    path: '/examples',
    children: [
      {
        key: 'examples/overview',
        label: '示例概览',
        path: '/examples/overview',
      },
      {
        key: 'examples/detail',
        label: '示例详情',
        path: '/examples/detail',
      },
    ],
  },
  {
    key: 'settings',
    label: '设置',
    path: '/settings',
    children: [
      {
        key: 'settings/profile',
        label: '个人设置',
        path: '/settings/profile',
      },
    ],
  },
  {
    key: 'external-docs',
    label: '外部文档',
    href: 'https://example.com',
    target: '_blank',
  },
];

const exampleOverviewMatch: NavigationMatch = {
  selectedKeys: ['examples/overview'],
  openKeys: ['examples'],
  activeItem: navigationItems[0].children?.[0] ?? null,
  breadcrumb: {
    activePath: '/examples/overview',
    source: 'menu',
    items: [
      {
        key: 'examples',
        label: '示例',
        path: '/examples',
      },
      {
        key: 'examples/overview',
        label: '示例概览',
        path: '/examples/overview',
      },
    ],
  },
};

void describe('navigationProjection', () => {
  void it('在 mix 模式下将一级菜单投影到顶部，并将当前一级菜单的子菜单投影到侧边栏', () => {
    const projection = createShellNavigationProjection('mix', navigationItems, exampleOverviewMatch, 'success');

    assert.equal(projection.hasAside, true);
    assert.deepEqual(
      projection.topItems.map((item) => item.key),
      ['examples', 'settings', 'external-docs']
    );
    assert.equal(projection.topItems[0].children, undefined);
    assert.deepEqual(projection.topMatch.selectedKeys, ['examples']);
    assert.deepEqual(
      projection.asideItems.map((item) => item.key),
      ['examples/overview', 'examples/detail']
    );
    assert.deepEqual(projection.asideMatch.selectedKeys, ['examples/overview']);
    assert.deepEqual(projection.asideMatch.openKeys, []);
  });

  void it('点击带 children 的内部一级菜单时进入第一个可访问子菜单', () => {
    const intent = resolveNavigationIntent(navigationItems[0]);

    if (!intent) assert.fail('expected navigation intent');
    assert.equal(intent.key, 'examples/overview');
    assert.equal(intent.path, '/examples/overview');
  });

  void it('side 系列使用完整侧边导航，top 只使用顶部导航', () => {
    for (const layoutMode of ['side', 'side-compact'] as const) {
      const projection = createShellNavigationProjection(layoutMode, navigationItems, exampleOverviewMatch, 'success');
      assert.equal(projection.hasAside, true);
      assert.deepEqual(projection.asideItems, navigationItems);
    }

    const topProjection = createShellNavigationProjection('top', navigationItems, exampleOverviewMatch, 'success');
    assert.equal(topProjection.hasAside, false);
    assert.deepEqual(topProjection.topItems, navigationItems);
  });

  void it('点击外链一级菜单时保持外链自身作为跳转目标', () => {
    const intent = resolveNavigationIntent(navigationItems[2]);

    if (!intent) assert.fail('expected external navigation intent');
    assert.equal(intent.key, 'external-docs');
    assert.equal(intent.href, 'https://example.com');
  });

  void it('mix 模式命中无子菜单一级菜单时隐藏侧边栏', () => {
    const projection = createShellNavigationProjection(
      'mix',
      navigationItems,
      {
        selectedKeys: ['external-docs'],
        openKeys: [],
        activeItem: navigationItems[2],
        breadcrumb: {
          activePath: 'https://example.com',
          source: 'menu',
          items: [
            {
              key: 'external-docs',
              label: '外部文档',
            },
          ],
        },
      },
      'success'
    );

    assert.equal(projection.hasAside, false);
    assert.deepEqual(projection.asideItems, []);
  });

  void it('识别 side-compact 和 side 作为合法主应用布局模式，并淘汰 side2', () => {
    assert.equal(isShellLayoutMode('side-compact'), true);
    assert.equal(isShellLayoutMode('side'), true);
    assert.equal(isShellLayoutMode('side2'), false);
  });
});
