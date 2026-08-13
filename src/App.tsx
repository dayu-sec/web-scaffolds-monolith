import logger from '@seed-fe/logger';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router';

import { TooltipProvider } from '@/components/ui/tooltip';
import { appConfig } from '@/configs/app';
import { MenuProvider } from '@/contexts/MenuProvider';
import { appRouter, fileRoutes } from '@/routes';
import { fetchMenuConfig } from '@/services/menu/fetch';
import { validateMenuRouteCoverage } from '@/services/menu/routeCoverage';
import type { MenuConfig } from '@/services/menu/schema';
import { queryClient } from '@/services/request';
import { applyDocumentTheme } from '@/theme';
import { SHELL_AUTH_ERROR_EVENT, type ShellAuthErrorDetail, type ShellFallbackState } from '@/types/shell';
import { translateMenuConfig } from '@/utils/menuTranslator';
import { LayoutProvider, ShellFallback, useLayoutSettings } from '@/views/layout';

function isShellAuthErrorEvent(event: Event): event is CustomEvent<ShellAuthErrorDetail> {
  return 'detail' in event;
}

interface RuntimeState {
  loading: boolean;
  originalMenuConfig: MenuConfig | null;
  fallback: ShellFallbackState | null;
}

/** 将布局偏好映射到文档主题，并为所有 Base UI Tooltip 提供统一上下文。 */
function ShellThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useLayoutSettings();

  useEffect(() => applyDocumentTheme(settings), [settings]);

  return <TooltipProvider delay={250}>{children}</TooltipProvider>;
}

/**
 * 完成菜单初始化、菜单国际化、鉴权恢复和稳定 Router 装配。语言变化只更新
 * translatedMenuConfig，不重新初始化菜单、Router 或业务页面。
 */
function RuntimeApp() {
  const [attempt, setAttempt] = useState(0);
  const [runtime, setRuntime] = useState<RuntimeState>({
    fallback: null,
    loading: true,
    originalMenuConfig: null,
  });
  const { t } = useTranslation(['common', 'project-menu']);
  const translatedMenuConfig = useMemo(
    () => (runtime.originalMenuConfig ? translateMenuConfig(runtime.originalMenuConfig, t) : null),
    [runtime.originalMenuConfig, t]
  );

  useEffect(() => {
    const handleAuthError = (event: Event) => {
      if (!isShellAuthErrorEvent(event)) return;
      setRuntime((current) => ({
        ...current,
        fallback: {
          actionLabel: event.detail.kind === 'auth-expired' ? '恢复访问' : '返回入口',
          kind: event.detail.kind,
          message: event.detail.message,
          path: event.detail.recoveryUrl,
        },
      }));
    };
    window.addEventListener(SHELL_AUTH_ERROR_EVENT, handleAuthError);
    return () => {
      window.removeEventListener(SHELL_AUTH_ERROR_EVENT, handleAuthError);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function initializeApp(): Promise<void> {
      try {
        const menuConfig = await fetchMenuConfig(controller.signal);
        validateMenuRouteCoverage(menuConfig, fileRoutes);
        if (!controller.signal.aborted) {
          setRuntime({ fallback: null, loading: false, originalMenuConfig: menuConfig });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        logger.error('[shell] Failed to initialize menu:', error);
        setRuntime({
          fallback: { cause: error, kind: 'missing-menu', message: '菜单加载或契约校验失败。' },
          loading: false,
          originalMenuConfig: null,
        });
      }
    }

    void initializeApp();
    return () => {
      controller.abort();
    };
  }, [attempt]);

  useEffect(() => {
    if (runtime.originalMenuConfig && translatedMenuConfig) {
      logger.log('[菜单国际化] 翻译菜单已就绪，通过 MenuProvider 更新 Shell。');
    }
  }, [runtime.originalMenuConfig, translatedMenuConfig]);

  return (
    <ShellThemeProvider>
      {runtime.loading ? (
        <ShellFallback state={{ kind: 'loading', title: t('app_loading', '应用加载中') }} />
      ) : runtime.fallback ? (
        <ShellFallback
          state={runtime.fallback}
          onRetry={() => {
            if (runtime.fallback?.path) {
              window.location.assign(runtime.fallback.path);
            } else if (runtime.fallback?.kind === 'permission-denied') {
              window.location.assign(import.meta.env.BASE_URL);
            } else {
              setRuntime({ fallback: null, loading: true, originalMenuConfig: null });
              setAttempt((current) => current + 1);
            }
          }}
        />
      ) : runtime.originalMenuConfig ? (
        <MenuProvider originalMenuConfig={runtime.originalMenuConfig} translatedMenuConfig={translatedMenuConfig}>
          <RouterProvider router={appRouter} />
        </MenuProvider>
      ) : null}
    </ShellThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutProvider defaultCenterTopMenu={appConfig.centerTopMenu} defaultLayout={appConfig.defaultLayout}>
        <RuntimeApp />
      </LayoutProvider>
    </QueryClientProvider>
  );
}
