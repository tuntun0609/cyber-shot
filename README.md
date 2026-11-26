# cyber-shot

人物写真素材库。提供发型、身材、动作三类素材，每条素材带预览图和中英文提示词，供用户浏览、复制提示词、下载参考图。本站不生成图片，也不提供登录、收费和搭配功能。

基于 TanStack Start、Rsbuild、React、TypeScript、Tailwind CSS v4 和 shadcn。由 Cloudflare Workers 在请求时渲染页面并运行服务端函数，图片和前端资源由 Workers Static Assets 提供。

## 开发

使用 Bun 1.4.0 和 Node.js 22.12+。

```bash
bun install
bun run dev
```

打开 http://localhost:3000，首页是导航落地页，发型库在 `/hair`，姿势库在 `/pose`。素材图片存放在远程对象存储，通过 `IMAGE_BASE_URL` 读取，并由 Cloudflare Images Transformations 按尺寸和格式自动优化。

当前收录 33 款发型，涵盖女生超短发、短发、中性中长狼尾、齐肩／锁骨发、长直发、卷发和男生超短发、碎发：使用无五官浅灰模特和写实发丝，原图包含正面、侧面、背面三视图，列表使用正面缩略图。身材暂未收录素材，展示空状态，不使用示例记录。

动作已收录 25 款，包含屈膝坐姿、扶眼镜、持瓶、双手比心、盘腿坐姿、展臂交叠腿坐姿、侧坐、弯指站姿、托颊近景、交叠腿站姿、头肩近景、单腿屈膝站姿、单臂支撑侧坐、屈膝并足坐姿近景、双手扶胯并足站姿和侧倚屈膝伸臂姿。使用黑线白底的无五官白模参考图，人物内部与背景统一为纯白，统一为 `3:4` 竖版（`1152×1536`），缩略图为 `384×512`；参与动作的眼镜和饮料瓶保留抽象轮廓。部分动作使用连续白模轮廓，不保留袖窿、裤口等服装分界。名称、中英文动作提示词、标签和图片路径保存在 D1 的 `catalog_items` 表中。

发型使用自然深棕发色，生成模板和逐款完整提示词保存在 `content/hairstyles-generation.json`；用于复制的中英文发型提示词、标签、性别和图片路径保存在 D1 的 `catalog_items` 表中。

## 环境变量

| 变量             | 说明                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `IMAGE_BASE_URL` | 远程素材对象 key 对应的图片域名，如 R2 的 `r2.dev` 地址或自定义域名。该域名需在 Cloudflare 启用 Images Transformations；留空则从站点根路径读取 |

### 管理方式

- 公开配置（如 `IMAGE_BASE_URL`）写入 `wrangler.jsonc` 的 `vars`，随代码提交；密钥不要写入该文件，用 `bun x wrangler secret put <NAME>` 设置。
- 本地只维护 `.env`（参考 `.env.example`）：`bun run dev` 直接读取，`bun run start` 会先把 `.env` 复制为 `.dev.vars`。`R2_*` 仅供本地脚本使用，不会上传到 Worker。
- 新增变量时：在 `src/lib/env.ts` 的 schema 中加一行，业务代码统一通过 `getEnv()` 读取；修改 `wrangler.jsonc` 后运行 `bun run cf-typegen` 更新 `worker-configuration.d.ts`。
- 每个变量只选一个来源，避免同时在控制台和 `wrangler.jsonc` 中配置。

## 素材数据

动作参考图的生成、服装分界清理、验收与入库流程见 [动作参考图生成与入库流程](docs/pose-reference-workflow.md)。下次可将图片与该文档一起提供，按相同流程处理。

发型、身材、动作三类素材存放在 Cloudflare D1（绑定名 `DB`）的 `catalog_items` 表中，用 `category`（`hair`、`body`、`pose`）区分类别，表结构定义在 `src/db/schema.ts`，迁移文件在 `drizzle/`。`content/` 下只保留 `faces.json` 和 `hairstyles-generation.json`：前者的面貌模块暂不启用，后者是生图用的模板数据，站点都不读取。

素材由后台维护（开发中），在此之前直接用 `wrangler d1 execute` 或 Cloudflare 控制台修改。写入没有应用层校验，只有表上的 CHECK 和 NOT NULL 约束兜底。

`catalog_items` 的主要字段：

| 字段                    | 说明                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                    | 自增整数主键，三类素材共用一个序列，用于详情页地址                                                                                                     |
| `name`                  | 中文名称                                                                                                                                               |
| `promptEn` / `promptZh` | 中英文提示词                                                                                                                                           |
| `tags`                  | 标签，JSON 数组文本，用于筛选                                                                                                                          |
| `gender`                | `female`、`male` 或 `any`                                                                                                                              |
| `image` / `thumb`       | 远程对象 key，如 `cyber-shot/xxx.webp`                                                                                                                 |
| `imageAspectRatio`      | 可选，原图宽高比，如三视图为 `1.5`；不填则按 `4 / 5` 展示                                                                                              |
| `thumbAspectRatio`      | 可选，缩略图有效画面的宽高比；列表据此裁掉原有侧边填充，将完整有效画面居中放入统一的 `4 / 5` 预览框，剩余空间用同图模糊背景铺满；不填则按 `4 / 5` 展示 |
| `skeleton`              | 仅动作类，可选                                                                                                                                         |
| `deprecated`            | 下架标记，默认 `0`，下架时设为 `1`                                                                                                                     |

列表按 `id` 升序展示。**id 不可修改，不物理删除，只把 `deprecated` 设为 `1`。** 每条素材有独立页面 `/<类别>/<id>`，类别与 id 不匹配时返回 404；旧的 `h-001` 形式地址已失效。

## 路由

- `/`：落地页，由 `index.tsx` 定义，`loadHome` 只取各类别条目数、精选条目和常用标签；精选 id 写在 `src/lib/catalog/home.functions.ts`。
- `/hair`、`/pose`：发型库和姿势库，由 `_catalog/hair.tsx`、`_catalog/pose.tsx` 定义，与弹窗共享 `_catalog/route.tsx` 提供的无路径布局。筛选条件保存在 `g`（性别）、`q`（搜索）、`t`（标签）参数中，姿势页不显示性别筛选。
- `/$category/$id`：由 `$category/$id.tsx` 定义，Worker 在请求时渲染详情；不存在的素材返回 404。
- 在 `/hair`、`/pose` 点击素材时，TanStack Router 通过路由掩码显示弹窗，地址栏仍使用独立详情页的地址。直接访问或刷新时打开独立页，关闭弹窗或后退会恢复列表筛选。

## 内容规范

- 只收录成年人，不模仿真实名人和知名角色。
- 不收录裸露或擦边内容，身材素材只用日常着装。
- 预览图统一构图、背景和光线。发型用头肩像，身材用全身像。
- 发型使用无五官中性模特，原图提供正面、侧面、背面三视图，缩略图使用正面视角；提示词描述发型本身，避免混入模特材质与拍摄布局。
- 仅添加已具备实际图片的素材记录，图片文件与数据一起入库。

## 命令

```bash
bun run check      # Ultracite / Biome 检查
bun run fix        # 自动修复格式和检查问题
bun run typecheck  # TypeScript 检查
bun run build     # 生产构建
bun run start     # 在 Wrangler 中运行已构建的 Worker
bun run deploy    # 构建并发布到 Cloudflare Workers
bun run db:generate        # 根据 src/db/schema.ts 生成迁移
bun run db:migrate:local   # 对本地 D1 应用迁移
bun run db:migrate:remote  # 对远程 D1 应用迁移
```

本地开发（`bun run dev`）通过 Wrangler 的平台代理读取 `.wrangler/state` 下的本地 D1，首次使用前先执行 `bun run db:migrate:local` 并导入素材。

`bun install` 会通过 Lefthook 安装提交前检查。VS Code 默认使用 Biome 扩展格式化。

UI 基于 shadcn（`base-rhea` 风格、`neutral` 基础色、lucide 图标），组件在 `src/components/ui/`。主题由 `next-themes` 管理，支持浅色、深色和跟随系统，颜色变量在 `src/styles/globals.css` 的 `:root` 与 `.dark` 中。新增组件：

```bash
bun x shadcn add button
```

## 部署到 Cloudflare

运行 `bun run build` 生成 `dist/client`（静态资源）和 `dist/server`（SSR）。`wrangler.jsonc` 将未匹配静态资源的请求交给 `worker.mjs`，再由 TanStack Start 处理页面、服务端函数和服务端路由。首次发布前用 `bun x wrangler login` 登录，确认 Worker 名称后运行 `bun run deploy`。

本地用 `bun run start` 验证 Worker；只检查发布打包、不上传时，可在构建后执行 `bun x wrangler deploy --dry-run`。
