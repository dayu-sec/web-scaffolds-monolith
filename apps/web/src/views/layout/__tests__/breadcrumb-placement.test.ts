import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveShellBreadcrumbPlacement } from '../utils/breadcrumb-placement.js';

void describe('breadcrumbPlacement', () => {
  void it('side 系列支持 Header 面包屑', () => {
    assert.equal(resolveShellBreadcrumbPlacement('side', 'header'), 'header');
    assert.equal(resolveShellBreadcrumbPlacement('side-compact', 'header'), 'header');
  });

  void it('mix 和 top 在 Header 请求下回退到内容区', () => {
    assert.equal(resolveShellBreadcrumbPlacement('mix', 'header'), 'content');
    assert.equal(resolveShellBreadcrumbPlacement('top', 'header'), 'content');
  });

  void it('显式内容区位置适用于全部布局', () => {
    for (const layoutMode of ['mix', 'side', 'side-compact', 'top'] as const) {
      assert.equal(resolveShellBreadcrumbPlacement(layoutMode, 'content'), 'content');
    }
  });
});
