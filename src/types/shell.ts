import type { ReactNode } from 'react';

export type ShellFallbackKind =
  'loading' | 'missing-menu' | 'not-found' | 'route-error' | 'auth-expired' | 'permission-denied' | 'resource-recovery';

export interface ShellFallbackState {
  /** 主应用降级态类别。 */
  kind: ShellFallbackKind;
  title?: string;
  message?: string;
  actionLabel?: string;
  path?: string;
  cause?: unknown;
}

export type ShellRecoveryTrigger =
  'menu-config' | 'auth' | 'permission' | 'route-render' | 'static-resource' | 'unknown-route';

export interface ShellRecoveryState {
  trigger: ShellRecoveryTrigger;
  fallback: ShellFallbackState;
  dedupeKey?: string;
  retryable: boolean;
}

export interface ShellAuthErrorDetail {
  kind: 'auth-expired' | 'permission-denied';
  status?: number;
  recoveryUrl?: string;
  message?: string;
}

export const SHELL_AUTH_ERROR_EVENT = 'shell:auth-error';

export interface ShellSiblingAppPortal {
  key: string;
  title: string;
  description?: string;
  url: string;
  target?: boolean;
  icon?: ReactNode;
}
