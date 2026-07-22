import { z } from 'zod';

const menuTargetSchema = z.enum(['_self', '_blank']);

const internalSelectRuleSchema = z.strictObject({
  path: z.string().trim().min(1).startsWith('/'),
  target: menuTargetSchema.optional(),
});

const externalSelectRuleSchema = z.strictObject({
  href: z.string().trim().min(1),
  target: menuTargetSchema.optional(),
});

const baseMenuNodeSchema = z.strictObject({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1),
  icon: z.string().trim().min(1).optional(),
  disabled: z.boolean().optional(),
  selectRule: z.union([internalSelectRuleSchema, externalSelectRuleSchema]).optional(),
  // 以下字段来自旧菜单契约，单体 v1 只保留数据兼容，不据此加载 sitemap。
  sitemapNodeKey: z.string().trim().min(1).optional(),
  highlightSitemapNodeKeys: z.array(z.string().trim().min(1)).optional(),
  hideTopItem: z.boolean().optional(),
});

export const menuNodeSchema = baseMenuNodeSchema.extend({
  get children() {
    return z.array(menuNodeSchema).optional();
  },
});

export type MenuNode = z.output<typeof menuNodeSchema>;

function collectDuplicateKeys(nodes: MenuNode[], seen: Set<string>, duplicates: Set<string>): void {
  for (const node of nodes) {
    if (seen.has(node.key)) {
      duplicates.add(node.key);
    }
    seen.add(node.key);
    collectDuplicateKeys(node.children ?? [], seen, duplicates);
  }
}

/**
 * 菜单 Schema 是运行时配置的唯一结构真源，并在整棵树范围内约束 key 唯一。
 */
export const menuConfigSchema = z.array(menuNodeSchema).superRefine((nodes, context) => {
  const duplicates = new Set<string>();
  collectDuplicateKeys(nodes, new Set<string>(), duplicates);

  for (const duplicate of duplicates) {
    context.addIssue({
      code: 'custom',
      message: `菜单 key 重复: ${duplicate}`,
    });
  }
});

export type MenuConfig = z.output<typeof menuConfigSchema>;
export type MenuSelectRule = NonNullable<MenuNode['selectRule']>;
export type MenuTarget = z.output<typeof menuTargetSchema>;

/** 按契约解析未知 JSON；不提供字段别名或第二结构兜底。 */
export function parseMenuConfig(input: unknown): MenuConfig {
  return menuConfigSchema.parse(input);
}
