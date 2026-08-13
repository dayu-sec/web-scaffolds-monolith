/**
 * 根路由故意不预置业务 DOM，避免脚手架把某种页面结构固化为生成范式。
 * Shell 内容区用于承载具体业务的功能、操作和内容呈现；真实视图应放入
 * `src/views/components/<domain>/`，本文件只保留文件路由入口职责。
 */
export default function IndexRoute(): null {
  return null;
}
