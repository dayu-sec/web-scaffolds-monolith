import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EXCEPTION_FEEDBACK_MODE,
  shouldClearContentAlert,
  shouldRenderContentAlert,
  shouldRenderToast,
} from '../src/configs/exception-feedback.ts';

void test('uses a persistent content alert by default and clears it for a new view', () => {
  assert.equal(EXCEPTION_FEEDBACK_MODE, 'content-alert');
  assert.equal(shouldRenderContentAlert(), true);
  assert.equal(shouldRenderToast(), false);
  assert.equal(
    shouldClearContentAlert(
      { hash: '', pathname: '/projects', search: '?tenant=east' },
      { hash: '', pathname: '/projects', search: '?tenant=east' }
    ),
    false
  );
  assert.equal(
    shouldClearContentAlert(
      { hash: '', pathname: '/projects', search: '?tenant=east' },
      { hash: '#detail', pathname: '/projects', search: '?tenant=east' }
    ),
    true
  );
});
