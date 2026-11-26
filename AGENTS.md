## 语言规范

- 默认使用中文回复。

## Git 提交约定

- commit message 只写实际改动内容，不添加 `Co-Authored-By` 等署名行，也不标注由哪个 Agent 编写。

## 开发约定

- 使用 Bun 管理依赖和运行脚本。
- 保持基础框架精简，按需添加业务功能和 UI 组件。
- 路由使用 TanStack Start 文件路由，构建使用 Rsbuild，生产运行在 Cloudflare Workers。
- `src/routeTree.gen.ts` 由路由插件生成，不手工修改。
- 检查规则以 `biome.json` 为准，修改代码后运行 `bun run check` 和 `bun run typecheck`。
- 使用 `bun run fix` 处理可自动修复的问题，不通过关闭规则规避检查。
- 素材数据（发型、身材、动作）存放在 D1 的 `catalog_items` 表，不再使用 `content/*.json`；表结构改动通过 drizzle 迁移完成。
