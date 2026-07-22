import { getDySecAntdMenuTheme } from '@lrd/dy-sec-bizcom-theme';
import { ConfigProvider, Menu, type MenuProps } from 'antd';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { NavigationItem, NavigationMatch } from '@/types/navigation';

import ShellMenuIcon from './ShellMenuIcon';

type ShellNavigationMenuMode = 'horizontal' | 'inline';

interface ShellNavigationMenuProps {
  /**
   * 折叠态仅用于 inline 菜单，horizontal 菜单会忽略该值。
   */
  collapsed?: boolean;
  /**
   * 附加到 AntD Menu 的样式类。
   */
  className?: string;
  /**
   * 规范化后的导航树。
   */
  items: NavigationItem[];
  /**
   * 当前路径匹配结果。
   */
  match: NavigationMatch;
  /**
   * 菜单渲染模式。
   */
  mode: ShellNavigationMenuMode;
  /**
   * 触发导航的回调。
   */
  onNavigate: (item: NavigationItem) => void;
}

function hasChildren(item: NavigationItem): boolean {
  return Boolean(item.children && item.children.length > 0);
}

function createMenuItems(items: NavigationItem[], popupClassName: string): MenuProps['items'] {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon || item.iconName ? <ShellMenuIcon icon={item.icon} iconName={item.iconName} /> : undefined,
    label: item.label,
    disabled: item.disabled === true || (!item.path && !item.href && !hasChildren(item)),
    popupClassName: item.children ? popupClassName : undefined,
    children: item.children ? createMenuItems(item.children, popupClassName) : undefined,
  }));
}

function createItemMap(items: NavigationItem[]): Map<string, NavigationItem> {
  const itemMap = new Map<string, NavigationItem>();

  for (const item of items) {
    itemMap.set(item.key, item);

    if (item.children) {
      for (const [key, child] of createItemMap(item.children)) {
        itemMap.set(key, child);
      }
    }
  }

  return itemMap;
}

function mergeOpenKeys(manualOpenKeys: string[] | null, matchedOpenKeys: string[]): string[] {
  return manualOpenKeys ?? matchedOpenKeys;
}

interface ManualOpenState {
  /**
   * 手动展开态生效时对应的当前选中菜单签名。
   */
  selectedKeySignature: string;
  /**
   * 用户手动展开或收起后的菜单 key。
   */
  openKeys: string[] | null;
}

/**
 * 渲染 Shell 纵向或横向导航菜单，并统一菜单项转换和路由点击行为。
 */
export default function ShellNavigationMenu({
  collapsed = false,
  className,
  items,
  match,
  mode,
  onNavigate,
}: ShellNavigationMenuProps) {
  const { settings } = useLayoutSettings();
  const [manualOpenState, setManualOpenState] = useState<ManualOpenState>({
    selectedKeySignature: '',
    openKeys: null,
  });
  const popupClassName = `dy-sec-shell-menu-popup dy-sec-shell-menu-popup--${mode} dy-sec-shell-menu-popup--${settings.theme}`;
  const menuItems = useMemo(() => createMenuItems(items, popupClassName), [items, popupClassName]);
  const itemMap = useMemo(() => createItemMap(items), [items]);
  const selectedKeySignature = match.selectedKeys.join('|');
  const manualOpenKeys =
    manualOpenState.selectedKeySignature === selectedKeySignature ? manualOpenState.openKeys : null;
  const openKeys = useMemo(() => mergeOpenKeys(manualOpenKeys, match.openKeys), [manualOpenKeys, match.openKeys]);
  const menuTheme = useMemo(() => getDySecAntdMenuTheme(settings.theme), [settings.theme]);
  const isInline = mode === 'inline';

  const handleOpenChange = useCallback(
    (keys: string[]) => {
      if (collapsed || !isInline) {
        return;
      }

      setManualOpenState({
        selectedKeySignature,
        openKeys: keys,
      });
    },
    [collapsed, isInline, selectedKeySignature]
  );
  // AntD horizontal Menu 只要收到 inlineCollapsed prop 就会报警，因此仅在 inline 模式下传入。
  const inlineMenuProps = isInline
    ? {
        inlineCollapsed: collapsed,
        onOpenChange: collapsed ? undefined : handleOpenChange,
        openKeys: collapsed ? undefined : openKeys,
      }
    : {};

  return (
    <ConfigProvider theme={menuTheme}>
      <Menu
        className={className}
        items={menuItems}
        mode={mode}
        overflowedIndicator={<MoreHorizontal className="dy-sec-shell-action-icon" size="1em" />}
        selectedKeys={match.selectedKeys}
        theme={settings.theme}
        {...inlineMenuProps}
        onClick={({ key }) => {
          const item = itemMap.get(key);

          if (item) {
            onNavigate(item);
          }
        }}
      />
    </ConfigProvider>
  );
}
