interface ShellLogoProps {
  /**
   * 品牌 Logo 地址。
   */
  logo?: string;
  /**
   * Logo 无障碍文本。
   */
  title?: string;
}

/**
 * 渲染左侧品牌 Logo。
 */
export default function ShellLogo({ logo, title }: ShellLogoProps) {
  if (!logo) {
    return null;
  }

  return <img className="dy-sec-shell-brand__logo" src={logo} alt={title ?? 'App Logo'} />;
}
