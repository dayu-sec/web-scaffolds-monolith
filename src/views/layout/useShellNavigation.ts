import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';

import { useMenu } from '@/hooks/useMenu';
import { fileRoutes } from '@/routes/fileRoutes';
import type { MenuConfig } from '@/services/menu/schema';
import { matchNavigation } from '@/services/navigation/match';
import { normalizeNavigationItems } from '@/services/navigation/normalize';
import { createProjectMenuNavigationSource } from '@/services/navigation/source';
import type { NavigationItem } from '@/types/navigation';
import { open, Target } from '@/utils/route';

import { resolveNavigationIntent } from './navigationProjection';

/** 为四种 Shell 布局统一准备导航树、匹配、面包屑和点击行为。 */
export function useShellNavigation(originalMenuConfig?: MenuConfig) {
  const location = useLocation();
  const { translatedMenuConfig } = useMenu();
  const effectiveMenuConfig = translatedMenuConfig ?? originalMenuConfig ?? null;
  const navigationSource = useMemo(() => createProjectMenuNavigationSource(effectiveMenuConfig), [effectiveMenuConfig]);
  const navigationItems = useMemo(() => normalizeNavigationItems(navigationSource), [navigationSource]);
  const navigationMatch = useMemo(
    () => matchNavigation(navigationItems, location.pathname, fileRoutes),
    [location.pathname, navigationItems]
  );
  const handleNavigate = useCallback((item: NavigationItem) => {
    const intent = resolveNavigationIntent(item);
    const destination = intent?.href ?? intent?.path;
    if (!intent || !destination) return;
    open(destination, intent.target === Target.Blank ? Target.Blank : Target.Self);
  }, []);

  return {
    handleNavigate,
    navigationItems,
    navigationMatch,
    navigationSource,
  };
}
