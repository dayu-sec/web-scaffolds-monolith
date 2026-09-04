import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { layoutSettingsSchema } from '../schemas/layout-settings.js';
import type { LayoutSettings } from '../types/layout.js';
import { restoreLayoutSettings } from '../utils/restore-layout-settings.js';

const defaultSettings: LayoutSettings = {
  breadcrumbPlacement: 'header',
  centerTopMenu: false,
  layout: 'mix',
  primaryColor: '#3871dc',
  splitMenus: false,
  theme: 'dark',
};

void describe('layoutSettingsSchema', () => {
  void it('只接受四种布局与有效主题设置', () => {
    assert.equal(layoutSettingsSchema.parse(defaultSettings).layout, 'mix');
    assert.equal(layoutSettingsSchema.safeParse({ ...defaultSettings, breadcrumbPlacement: 'sidebar' }).success, false);
    assert.equal(layoutSettingsSchema.safeParse({ ...defaultSettings, layout: 'side2' }).success, false);
    assert.equal(layoutSettingsSchema.safeParse({ ...defaultSettings, layout: 'top', theme: 'auto' }).success, false);
  });

  void it('用当前默认值补齐合法的旧持久化设置', () => {
    assert.deepEqual(restoreLayoutSettings(defaultSettings, { theme: 'light' }), {
      ...defaultSettings,
      theme: 'light',
    });
  });

  void it('拒绝非对象、非法枚举和契约外字段', () => {
    assert.equal(restoreLayoutSettings(defaultSettings, null), null);
    assert.equal(restoreLayoutSettings(defaultSettings, { layout: 'side2' }), null);
    assert.equal(restoreLayoutSettings(defaultSettings, { unknownSetting: true }), null);
  });
});
