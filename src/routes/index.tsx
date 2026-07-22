import { createBrowserRouter } from 'react-router';

import NotFoundPage from '@/views/fallback/NotFoundPage';
import MainLayout from '@/views/layout/MainLayout';

import { fileRoutes } from './fileRoutes';
import PageErrorBoundary from './PageErrorBoundary';

export { fileRoutes } from './fileRoutes';

function normalizeBasename(base: string): string {
  const pathname = new URL(base, window.location.origin).pathname;
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

/** 创建应用唯一 Router；业务路由全部来自文件路由生成结果。 */
export function createAppRouter() {
  return createBrowserRouter(
    [
      {
        path: '/',
        element: <MainLayout />,
        errorElement: <PageErrorBoundary />,
        children: [...fileRoutes, { path: '*', element: <NotFoundPage /> }],
      },
    ],
    { basename: normalizeBasename(import.meta.env.BASE_URL) }
  );
}

export const appRouter = createAppRouter();
