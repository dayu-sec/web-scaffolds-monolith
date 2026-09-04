import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldShowHeaderAsideCollapseButton } from '../utils/header-aside-collapse.js';
import { isShellLayoutMode } from '../utils/layout-mode.js';
import { getShellTopNavigationPlacement } from '../utils/navigation-placement.js';

void describe('layoutOptions', () => {
  void it('mix 支持顶部菜单起始与居中位置', () => {
    assert.equal(getShellTopNavigationPlacement('mix', false), 'start');
    assert.equal(getShellTopNavigationPlacement('mix', true), 'center');
  });

  void it('top 始终使用 Header center，side 系列不渲染顶部菜单', () => {
    assert.equal(getShellTopNavigationPlacement('top', false), 'center');
    assert.equal(getShellTopNavigationPlacement('side', false), 'hidden');
    assert.equal(getShellTopNavigationPlacement('side-compact', false), 'hidden');
  });

  void it('只识别四种单体 Shell 布局', () => {
    for (const mode of ['mix', 'side', 'side-compact', 'top']) assert.equal(isShellLayoutMode(mode), true);
    assert.equal(isShellLayoutMode('side2'), false);
  });

  void it('Header 折叠按钮只有显式开启且存在 aside 时显示', () => {
    assert.equal(shouldShowHeaderAsideCollapseButton({ enabled: false, hasAside: true, layoutMode: 'side' }), false);
    assert.equal(shouldShowHeaderAsideCollapseButton({ enabled: true, hasAside: true, layoutMode: 'side' }), true);
    assert.equal(shouldShowHeaderAsideCollapseButton({ enabled: true, hasAside: false, layoutMode: 'side' }), false);
    assert.equal(shouldShowHeaderAsideCollapseButton({ enabled: true, hasAside: false, layoutMode: 'top' }), false);
  });
});
