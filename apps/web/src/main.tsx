import '@workspace/ui/globals.css';
import './styles/app.css';

import { createEventChannel } from '@seed-fe/event-channel';
import global from '@seed-fe/global';
import logger from '@seed-fe/logger';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ShellFallback } from '@/views/layout';

import App from './App';
import { setupUnhandledRejectionMonitor } from './configs/unhandledrejection';
import { initGlobalI18nAPI, setupI18n } from './locales';
import { initAppUpdateService } from './services/app-update';
import { configureRequest } from './services/request';
import { open } from './utils/route';

/** 按应用启动顺序初始化全局服务，再挂载唯一 React 根节点。 */
async function initializeApp(): Promise<void> {
  global.set('dy', 'eventChannel', createEventChannel());
  if (import.meta.env.DEV) logger.setLevel('TRACE', true);

  await setupI18n();
  configureRequest();
  setupUnhandledRejectionMonitor();
  initAppUpdateService();
  global.set('dy', 'shared', { open });
  global.set('dy', 'i18n', initGlobalI18nAPI());

  const rootElement = document.getElementById('app-root');
  if (!rootElement) {
    logger.error('未找到 id 为 app-root 的 DOM 元素，无法挂载应用。');
    throw new Error('App root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void initializeApp().catch((error: unknown) => {
  logger.error('[app] initialization failed:', error);
  const rootElement = document.getElementById('app-root');
  if (!rootElement) return;
  createRoot(rootElement).render(
    <StrictMode>
      <ShellFallback state={{ cause: error, kind: 'route-error', message: '应用基础服务初始化失败。' }} />
    </StrictMode>
  );
});
