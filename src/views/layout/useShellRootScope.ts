import { type CSSProperties, useLayoutEffect } from 'react';

import type { LayoutSettings } from '@/contexts/LayoutContext';

import type { ShellLayoutMode } from './types';

type ShellRootScopeStyle = CSSProperties & Record<`--dy-sec-shell-${string}`, string>;
type ShellRootScopeStyleHost =
  | {
      sheet: CSSStyleSheet;
      type: 'adopted';
    }
  | {
      element: HTMLStyleElement;
      type: 'element';
    };

interface ShellRootScopeOptions {
  /**
   * 当前 Shell 布局模式，用于调试和样式分支定位。
   */
  layoutMode: ShellLayoutMode;
  /**
   * 需要挂载到主应用根节点的 Shell 变量。
   */
  style: ShellRootScopeStyle;
  /**
   * 当前主题，用于主应用根节点主题上下文。
   */
  theme: LayoutSettings['theme'];
}

const SHELL_ROOT_ID = 'app-root';
const SHELL_ROOT_WRAPPER_CLASS = 'dy-sec-shell-wrapper';
const SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS = 'dy-sec-container-theme-scope';
const SHELL_ROOT_SELECTOR = `#${SHELL_ROOT_ID}.${SHELL_ROOT_WRAPPER_CLASS}.${SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS}`;
const SHELL_ROOT_STYLE_ELEMENT_ID = 'dy-sec-shell-root-scope-style';

/**
 * 返回主应用 Shell 变量的唯一作用域选择器，布局 wrapper 和主题 scope 必须同时存在。
 */
export function getShellRootScopeSelector(): string {
  return SHELL_ROOT_SELECTOR;
}

/**
 * 将 Shell 变量序列化为 root scope 下的 CSS 规则。
 */
export function createShellRootScopeCssText(selector: string, style: ShellRootScopeStyle): string {
  const declarations = Object.entries(style).map(([key, value]) => `  ${key}: ${String(value)};`);

  return [`${selector} {`, ...declarations, '}'].join('\n');
}

/**
 * 优先使用 Constructable Stylesheet，减少运行时频繁创建 DOM 节点。
 */
function canUseAdoptedStyleSheets(): boolean {
  return (
    typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in document && 'replaceSync' in CSSStyleSheet.prototype
  );
}

/**
 * 挂载 Shell root scope 样式。现代浏览器走 CSSOM，旧环境回退到单个 style 标签。
 */
function mountShellRootScopeStyle(cssText: string): ShellRootScopeStyleHost {
  if (canUseAdoptedStyleSheets()) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

    return {
      sheet,
      type: 'adopted',
    };
  }

  document.getElementById(SHELL_ROOT_STYLE_ELEMENT_ID)?.remove();

  const element = document.createElement('style');
  element.id = SHELL_ROOT_STYLE_ELEMENT_ID;
  element.textContent = cssText;
  document.head.append(element);

  return {
    element,
    type: 'element',
  };
}

/**
 * 卸载本次 Hook 创建的样式资源，避免布局切换后残留旧变量。
 */
function unmountShellRootScopeStyle(host: ShellRootScopeStyleHost): void {
  if (host.type === 'adopted') {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== host.sheet);
    return;
  }

  host.element.remove();
}

/**
 * 将 Shell 主题变量挂载到独立 stylesheet，避免把变量写进 root 节点的 inline style。
 */
export default function useShellRootScope({ layoutMode, style, theme }: ShellRootScopeOptions): void {
  useLayoutEffect(() => {
    const rootElement = document.getElementById(SHELL_ROOT_ID);

    if (!rootElement) {
      return;
    }

    rootElement.classList.add(SHELL_ROOT_WRAPPER_CLASS, SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS);
    rootElement.dataset.dySecLayout = layoutMode;
    rootElement.dataset.dySecTheme = theme;

    const styleHost = mountShellRootScopeStyle(createShellRootScopeCssText(getShellRootScopeSelector(), style));

    return () => {
      unmountShellRootScopeStyle(styleHost);
      rootElement.classList.remove(SHELL_ROOT_WRAPPER_CLASS);
      rootElement.classList.remove(SHELL_ROOT_CONTAINER_THEME_SCOPE_CLASS);
      delete rootElement.dataset.dySecLayout;
      delete rootElement.dataset.dySecTheme;
    };
  }, [layoutMode, style, theme]);
}
