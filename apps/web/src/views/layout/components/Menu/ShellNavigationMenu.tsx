import { Button } from '@workspace/ui/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@workspace/ui/components/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { NavigationItem, NavigationMatch } from '@/types/navigation';
import ShellMenuIcon from './ShellMenuIcon';

type ShellNavigationMenuMode = 'horizontal' | 'inline';

interface ShellNavigationMenuProps {
  collapsed?: boolean;
  className?: string;
  items: NavigationItem[];
  match: NavigationMatch;
  mode: ShellNavigationMenuMode;
  onNavigate: (item: NavigationItem) => void;
}

interface ManualOpenState {
  selectedKeySignature: string;
  openKeys: string[] | null;
}

function hasChildren(item: NavigationItem): boolean {
  return Boolean(item.children?.length);
}

function isDisabled(item: NavigationItem): boolean {
  return item.disabled === true || (!item.path && !item.href && !hasChildren(item));
}

function MenuLabel({ item }: { item: NavigationItem }) {
  return (
    <>
      {item.icon || item.iconName ? <ShellMenuIcon icon={item.icon} iconName={item.iconName} /> : null}
      <span className="dy-sec-shell-menu__label">{item.label}</span>
    </>
  );
}

function DropdownItems({ items, onNavigate }: { items: NavigationItem[]; onNavigate: (item: NavigationItem) => void }) {
  return (
    <DropdownMenuGroup>
      {items.map((item) =>
        hasChildren(item) ? (
          <DropdownMenuSub key={item.key}>
            <DropdownMenuSubTrigger disabled={isDisabled(item)}>
              <MenuLabel item={item} />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownItems items={item.children ?? []} onNavigate={onNavigate} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            key={item.key}
            disabled={isDisabled(item)}
            onClick={() => {
              onNavigate(item);
            }}
          >
            <MenuLabel item={item} />
          </DropdownMenuItem>
        )
      )}
    </DropdownMenuGroup>
  );
}

function HorizontalItem({
  active,
  item,
  onNavigate,
}: {
  active: boolean;
  item: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
}) {
  if (hasChildren(item)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="dy-sec-shell-menu__item"
          data-active={active}
          disabled={isDisabled(item)}
          render={<Button size="sm" variant="ghost" />}
        >
          <MenuLabel item={item} />
          <ChevronDown aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8}>
          <DropdownItems items={item.children ?? []} onNavigate={onNavigate} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      className="dy-sec-shell-menu__item"
      data-active={active}
      disabled={isDisabled(item)}
      size="sm"
      variant="ghost"
      onClick={() => {
        onNavigate(item);
      }}
    >
      <MenuLabel item={item} />
    </Button>
  );
}

function CollapsedItem({
  active,
  item,
  onNavigate,
}: {
  active: boolean;
  item: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
}) {
  const icon =
    item.icon || item.iconName ? <ShellMenuIcon icon={item.icon} iconName={item.iconName} /> : <MoreHorizontal />;

  if (hasChildren(item)) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            aria-label={item.label}
            className="dy-sec-shell-menu__item dy-sec-shell-menu__item--collapsed"
            data-active={active}
            disabled={isDisabled(item)}
            render={<DropdownMenuTrigger render={<Button size="icon" variant="ghost" />} />}
          >
            {icon}
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" side="right" sideOffset={8}>
          <DropdownItems items={item.children ?? []} onNavigate={onNavigate} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={item.label}
        className="dy-sec-shell-menu__item dy-sec-shell-menu__item--collapsed"
        data-active={active}
        disabled={isDisabled(item)}
        onClick={() => {
          onNavigate(item);
        }}
        render={<Button size="icon" variant="ghost" />}
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function InlineItems({
  depth = 0,
  items,
  onNavigate,
  onOpenChange,
  openKeys,
  selectedKeys,
}: {
  depth?: number;
  items: NavigationItem[];
  onNavigate: (item: NavigationItem) => void;
  onOpenChange: (key: string, open: boolean) => void;
  openKeys: string[];
  selectedKeys: string[];
}) {
  return items.map((item) => {
    const active = selectedKeys.includes(item.key);
    const childActive = openKeys.includes(item.key);

    if (!hasChildren(item)) {
      return (
        <Button
          key={item.key}
          className="dy-sec-shell-menu__item"
          data-active={active}
          data-depth={depth}
          disabled={isDisabled(item)}
          variant="ghost"
          onClick={() => {
            onNavigate(item);
          }}
        >
          <MenuLabel item={item} />
        </Button>
      );
    }

    const open = openKeys.includes(item.key);
    return (
      <Collapsible
        key={item.key}
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(item.key, nextOpen);
        }}
      >
        <CollapsibleTrigger
          className="dy-sec-shell-menu__item"
          data-active={active || childActive}
          data-depth={depth}
          disabled={isDisabled(item)}
          render={<Button variant="ghost" />}
        >
          <MenuLabel item={item} />
          <ChevronRight className="dy-sec-shell-menu__chevron" data-open={open} />
        </CollapsibleTrigger>
        <CollapsibleContent className="dy-sec-shell-menu__sub">
          <InlineItems
            depth={depth + 1}
            items={item.children ?? []}
            onNavigate={onNavigate}
            onOpenChange={onOpenChange}
            openKeys={openKeys}
            selectedKeys={selectedKeys}
          />
        </CollapsibleContent>
      </Collapsible>
    );
  });
}

/** 渲染 Shell 纵向或横向导航菜单，并统一路由点击、展开和折叠态。 */
export default function ShellNavigationMenu({
  collapsed = false,
  className,
  items,
  match,
  mode,
  onNavigate,
}: ShellNavigationMenuProps) {
  const [manualOpenState, setManualOpenState] = useState<ManualOpenState>({
    selectedKeySignature: '',
    openKeys: null,
  });
  const selectedKeySignature = match.selectedKeys.join('|');
  const manualOpenKeys =
    manualOpenState.selectedKeySignature === selectedKeySignature ? manualOpenState.openKeys : null;
  const openKeys = useMemo(() => manualOpenKeys ?? match.openKeys, [manualOpenKeys, match.openKeys]);

  const handleOpenChange = (key: string, open: boolean) => {
    const nextOpenKeys = open ? [...new Set([...openKeys, key])] : openKeys.filter((openKey) => openKey !== key);
    setManualOpenState({ openKeys: nextOpenKeys, selectedKeySignature });
  };

  if (mode === 'horizontal') {
    return (
      <nav aria-label="顶部导航" className={cn(className, 'dy-sec-shell-menu--horizontal')}>
        {items.map((item) => (
          <HorizontalItem
            key={item.key}
            active={match.selectedKeys.includes(item.key) || match.openKeys.includes(item.key)}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="侧边导航" className={cn(className, 'dy-sec-shell-menu--inline')} data-collapsed={collapsed}>
      {collapsed ? (
        items.map((item) => (
          <CollapsedItem
            key={item.key}
            active={match.selectedKeys.includes(item.key) || match.openKeys.includes(item.key)}
            item={item}
            onNavigate={onNavigate}
          />
        ))
      ) : (
        <InlineItems
          items={items}
          onNavigate={onNavigate}
          onOpenChange={handleOpenChange}
          openKeys={openKeys}
          selectedKeys={match.selectedKeys}
        />
      )}
    </nav>
  );
}
