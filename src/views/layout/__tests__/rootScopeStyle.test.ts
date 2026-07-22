import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createShellRootScopeCssText, getShellRootScopeSelector } from '../useShellRootScope.js';

void describe('rootScopeStyle', () => {
  void it('主应用主题变量使用独立的 container scope', () => {
    assert.equal(getShellRootScopeSelector(), '#cssp-root.dy-sec-shell-wrapper.dy-sec-container-theme-scope');
  });

  void it('将 Shell 变量序列化为 root scope 样式规则', () => {
    assert.equal(
      createShellRootScopeCssText('#cssp-root.dy-sec-shell-wrapper.dy-sec-container-theme-scope', {
        '--dy-sec-shell-bg': '#ffffff',
        '--dy-sec-shell-current-aside-width': '240px',
      }),
      [
        '#cssp-root.dy-sec-shell-wrapper.dy-sec-container-theme-scope {',
        '  --dy-sec-shell-bg: #ffffff;',
        '  --dy-sec-shell-current-aside-width: 240px;',
        '}',
      ].join('\n')
    );
  });
});
