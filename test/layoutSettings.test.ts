import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { layoutSettingsSchema } from '../src/contexts/LayoutContext';

void describe('layoutSettingsSchema', () => {
  void it('只接受四种布局与有效主题设置', () => {
    const validSettings = {
      breadcrumbPlacement: 'header',
      centerTopMenu: false,
      fixedHeader: false,
      fixedSidebar: true,
      layout: 'mix',
      primaryColor: '#3871dc',
      splitMenus: false,
      theme: 'dark',
    };
    assert.equal(layoutSettingsSchema.parse(validSettings).layout, 'mix');
    assert.equal(layoutSettingsSchema.safeParse({ ...validSettings, breadcrumbPlacement: 'sidebar' }).success, false);
    assert.equal(layoutSettingsSchema.safeParse({ ...validSettings, layout: 'side2' }).success, false);
    assert.equal(layoutSettingsSchema.safeParse({ ...validSettings, layout: 'top', theme: 'auto' }).success, false);
  });
});
