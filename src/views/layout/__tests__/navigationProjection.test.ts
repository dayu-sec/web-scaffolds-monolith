import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { NavigationItem, NavigationMatch } from '@/types/navigation';

import { createShellNavigationProjection, resolveNavigationIntent } from '../navigationProjection.js';
import { isShellLayoutMode } from '../types.js';

const navigationItems: NavigationItem[] = [
  {
    key: 'logs',
    label: '日志',
    path: '/log-query',
    children: [
      {
        key: 'logs/search',
        label: '日志检索',
        path: '/log-query/search',
      },
      {
        key: 'logs/analytics',
        label: '日志分析',
        path: '/log-query/analytics',
      },
    ],
  },
  {
    key: 'assets',
    label: '资产',
    path: '/assets',
    children: [
      {
        key: 'assets/list',
        label: '资产列表',
        path: '/assets/list',
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

const logSearchMatch: NavigationMatch = {
  selectedKeys: ['logs/search'],
  openKeys: ['logs'],
  activeItem: navigationItems[0].children?.[0] ?? null,
  breadcrumb: {
    activePath: '/log-query/search',
    source: 'menu',
    items: [
      {
        key: 'logs',
        label: '日志',
        path: '/log-query',
      },
      {
        key: 'logs/search',
        label: '日志检索',
        path: '/log-query/search',
      },
    ],
  },
};

void describe('navigationProjection', () => {
  void it('在 mix 模式下将一级菜单投影到顶部，并将当前一级菜单的子菜单投影到侧边栏', () => {
    const projection = createShellNavigationProjection('mix', navigationItems, logSearchMatch, 'success');

    assert.equal(projection.hasAside, true);
    assert.deepEqual(
      projection.topItems.map((item) => item.key),
      ['logs', 'assets', 'external-docs']
    );
    assert.equal(projection.topItems[0].children, undefined);
    assert.deepEqual(projection.topMatch.selectedKeys, ['logs']);
    assert.deepEqual(
      projection.asideItems.map((item) => item.key),
      ['logs/search', 'logs/analytics']
    );
    assert.deepEqual(projection.asideMatch.selectedKeys, ['logs/search']);
    assert.deepEqual(projection.asideMatch.openKeys, []);
  });

  void it('点击带 children 的内部一级菜单时进入第一个可访问子菜单', () => {
    const intent = resolveNavigationIntent(navigationItems[0]);

    if (!intent) assert.fail('expected navigation intent');
    assert.equal(intent.key, 'logs/search');
    assert.equal(intent.path, '/log-query/search');
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
