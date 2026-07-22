import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseMenuConfig } from '../src/services/menu/schema';

void describe('menuConfigSchema', () => {
  void it('接受嵌套内部路径、外链和已知旧元数据', () => {
    const config = parseMenuConfig([
      {
        key: 'examples',
        title: '示例',
        sitemapNodeKey: 'legacy-examples',
        children: [
          { key: 'examples-list', title: '列表', selectRule: { path: '/examples', target: '_self' } },
          { key: 'docs', title: '文档', selectRule: { href: 'https://example.invalid', target: '_blank' } },
        ],
      },
    ]);

    assert.equal(config[0]?.children?.length, 2);
  });

  void it('空数组是合法菜单空态', () => {
    assert.deepEqual(parseMenuConfig([]), []);
  });

  void it('拒绝整棵树中的重复 key', () => {
    assert.throws(() =>
      parseMenuConfig([
        { key: 'same', title: '一级' },
        { key: 'group', title: '分组', children: [{ key: 'same', title: '二级' }] },
      ])
    );
  });

  void it('拒绝 path 与 href 同时出现、相对内部路径和非法 target', () => {
    assert.throws(() =>
      parseMenuConfig([{ key: 'both', title: '冲突', selectRule: { path: '/valid', href: 'https://example.invalid' } }])
    );
    assert.throws(() => parseMenuConfig([{ key: 'relative', title: '相对', selectRule: { path: 'examples' } }]));
    assert.throws(() =>
      parseMenuConfig([{ key: 'target', title: '目标', selectRule: { path: '/examples', target: 'popup' } }])
    );
  });

  void it('拒绝契约外字段', () => {
    assert.throws(() => parseMenuConfig([{ key: 'unknown', title: '未知', route: '/examples' }]));
  });
});
