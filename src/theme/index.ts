import type { LayoutSettings } from '@/views/layout';

export const DEFAULT_PRIMARY_COLOR = '#2563EB';

const CUSTOM_PRIMARY_PROPERTIES = ['--primary', '--ring', '--sidebar-primary'] as const;

/** 把布局设置映射为文档级 shadcn 主题，确保挂载到 body 的浮层共享主题。 */
export function applyDocumentTheme({
  primaryColor,
  theme,
}: Pick<LayoutSettings, 'primaryColor' | 'theme'>): () => void {
  const root = document.documentElement;
  const usesDefaultPrimary = primaryColor.toUpperCase() === DEFAULT_PRIMARY_COLOR;

  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;

  for (const property of CUSTOM_PRIMARY_PROPERTIES) {
    if (usesDefaultPrimary) {
      root.style.removeProperty(property);
    } else {
      root.style.setProperty(property, primaryColor);
    }
  }

  return () => {
    root.classList.remove('dark');
    delete root.dataset.theme;
    for (const property of CUSTOM_PRIMARY_PROPERTIES) {
      root.style.removeProperty(property);
    }
  };
}
