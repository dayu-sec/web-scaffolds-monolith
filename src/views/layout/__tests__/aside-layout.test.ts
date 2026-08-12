import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SHELL_ASIDE_BREAKPOINT } from '../constants/layout.js';
import { createShellAsideLayoutStyle } from '../utils/aside-layout.js';

void describe('asideLayout', () => {
  void it('使用 lg 作为主应用侧边导航默认响应式断点', () => {
    assert.equal(SHELL_ASIDE_BREAKPOINT, 'lg');
  });

  void it('根据侧边导航可见性和折叠态输出当前 aside 宽度变量', () => {
    assert.deepEqual(
      createShellAsideLayoutStyle({
        collapsed: false,
        collapsedWidth: 54,
        hasAside: true,
        width: 240,
      }),
      {
        '--dy-sec-shell-current-aside-width': '240px',
      }
    );

    assert.deepEqual(
      createShellAsideLayoutStyle({
        collapsed: true,
        collapsedWidth: 54,
        hasAside: true,
        width: 240,
      }),
      {
        '--dy-sec-shell-current-aside-width': '54px',
      }
    );

    assert.deepEqual(
      createShellAsideLayoutStyle({
        collapsed: false,
        collapsedWidth: 54,
        hasAside: false,
        width: 240,
      }),
      {
        '--dy-sec-shell-current-aside-width': '0px',
      }
    );
  });
});
