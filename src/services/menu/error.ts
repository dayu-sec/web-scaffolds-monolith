export type MenuConfigErrorKind = 'fetch' | 'parse' | 'contract' | 'route';

/** 表达菜单初始化失败的所属阶段，原始异常仅用于诊断，不直接作为用户文案。 */
export class MenuConfigError extends Error {
  readonly kind: MenuConfigErrorKind;
  override readonly cause?: unknown;

  constructor(kind: MenuConfigErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = 'MenuConfigError';
    this.kind = kind;
    this.cause = cause;
  }
}
