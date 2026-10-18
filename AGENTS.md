## 语言规范

- 默认使用中文回复。

## 开发约定

- 使用 Bun 管理依赖和运行脚本。
- 保持基础框架精简，按需添加业务功能和 UI 组件。
- 编写 Next.js 代码前，先阅读 `node_modules/next/dist/docs/` 中对应的本地版本文档。
- 检查规则以 `biome.json` 为准，修改代码后运行 `bun run check` 和 `bun run typecheck`。
- 使用 `bun run fix` 处理可自动修复的问题，不通过关闭规则规避检查。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
