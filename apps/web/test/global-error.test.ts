import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeError } from '@dayu-sec/bizlib-request';

import { setupGlobalErrorMonitor } from '../src/configs/global-error.ts';

// `configs/request.ts` 读取 Vite `define` 注入的 __APP_NAME__；node:test 直接运行时没有这个
// 构建期全局，动态 import 前手动补一个测试专用值，不影响生产构建。
Object.assign(globalThis, { __APP_NAME__: 'test-app' });
const { requestConfig } = await import('../src/configs/request.ts');

class ListenerTrackingWindow extends EventTarget {
  readonly registrations = new Map<string, number>();
  readonly removals = new Map<string, number>();

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean
  ): void {
    this.registrations.set(type, (this.registrations.get(type) ?? 0) + 1);
    super.addEventListener(type, callback, options);
  }

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void {
    this.removals.set(type, (this.removals.get(type) ?? 0) + 1);
    super.removeEventListener(type, callback, options);
  }
}

void test('request-side rejection delegates directly to normalizeError; response side normalizes after auth handling', () => {
  assert.equal(requestConfig.interceptors.request.onError, normalizeError);
  assert.notEqual(requestConfig.interceptors.response.onError, normalizeError);
});

void test('global error monitor owns error and unhandledrejection listeners with one cleanup', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const fakeWindow = new ListenerTrackingWindow();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });

  try {
    const cleanup = setupGlobalErrorMonitor();
    assert.equal(fakeWindow.registrations.get('error'), 1);
    assert.equal(fakeWindow.registrations.get('unhandledrejection'), 1);

    cleanup();
    assert.equal(fakeWindow.removals.get('error'), 1);
    assert.equal(fakeWindow.removals.get('unhandledrejection'), 1);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
