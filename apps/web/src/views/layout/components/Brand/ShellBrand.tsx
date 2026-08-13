import type { ReactNode } from 'react';

import ShellLogo from './ShellLogo';
import ShellTitle from './ShellTitle';

type ShellBrandPlacement = 'header' | 'aside';

interface ShellBrandProps {
  /**
   * 是否隐藏应用切换和标题，通常用于侧边栏折叠态。
   */
  collapsed: boolean;
  /**
   * 品牌区所在区域，用于调整对齐方式。
   */
  placement?: ShellBrandPlacement;
  /**
   * 品牌 Logo 地址。
   */
  logo?: string;
  /**
   * 品牌或当前项目标题。
   */
  title?: string;
  /**
   * 左侧应用切换入口。
   */
  appSwitch?: ReactNode | false;
}

/** 组合 Shell 品牌区，可用于侧边栏或顶部栏。 */
export default function ShellBrand({ appSwitch, collapsed, placement = 'aside', logo, title }: ShellBrandProps) {
  return (
    <div className={`dy-sec-shell-brand dy-sec-shell-brand--${placement}`} data-collapsed={collapsed}>
      {!collapsed && appSwitch && <div className="dy-sec-shell-brand__app-switch">{appSwitch}</div>}
      <ShellLogo logo={logo} title={title} />
      {!collapsed && <ShellTitle title={title} />}
    </div>
  );
}
