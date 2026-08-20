import type { ShellLayoutMode } from '@/views/layout';

// public/ 资源不会参与 TypeScript 打包，使用 Vite base 拼接路径以兼容子路径部署。
const logo = `${import.meta.env.BASE_URL}logo.svg`;

export interface AppConfig {
  /** 应用品牌名称，仅用于当前单体应用展示。 */
  name: string;
  /** 随应用制品发布的 Logo。 */
  logo: string;
  /** 生产环境使用的默认布局；开发环境可临时覆盖。 */
  defaultLayout: ShellLayoutMode;
  /** mix 布局的顶部一级菜单默认排列方式。 */
  centerTopMenu: boolean;
}

// 默认使用顶栏 + 左侧菜单 + 右侧内容工作区；工作区占据剩余空间，不设内容最大宽度。
export const appConfig: AppConfig = {
  centerTopMenu: false,
  defaultLayout: 'side',
  logo,
  name: 'Web Project',
};
