# cyber-shot

人物写真素材库。提供发型、身材、动作三类素材，每条素材带预览图和中英文提示词，供用户浏览、复制提示词、下载参考图。本站不生成图片，也不提供登录、收费和搭配功能。

基于 Next.js App Router、React、TypeScript、Tailwind CSS v4 和 shadcn 配置。

## 开发

使用 Bun 1.4.0 和 Node.js 20.9+。

```bash
bun install
bun run dev
```

打开 http://localhost:3000，首页默认展示发型。已收录素材直接读取本地图片，无需外部服务。

当前收录 32 款发型，涵盖女生超短发、短发、齐肩／锁骨发、长直发、卷发和男生超短发、碎发：使用无五官浅灰模特和写实发丝，原图包含正面、侧面、背面三视图，列表使用正面缩略图。身材暂未收录素材，展示空状态，不使用示例记录。

动作已收录 `p-001`～`p-022` 共 22 款，包含屈膝坐姿、扶眼镜、持瓶、双手比心、盘腿坐姿、展臂交叠腿坐姿、侧坐、弯指站姿、托颊近景、交叠腿站姿、头肩近景、单腿屈膝站姿和单臂支撑侧坐。使用黑线白底的无五官白模参考图，人物内部与背景统一为纯白，统一为 `3:4` 竖版（`1152×1536`），缩略图为 `384×512`；参与动作的眼镜和饮料瓶保留抽象轮廓。新增的 `p-008`～`p-012` 使用连续白模轮廓，不保留袖窿、裤口等服装分界。页面使用 `public/poses/` 下带 `-white` 后缀的校正原图及无损 WebP 缩略图，避免旧图缓存；名称、中英文动作提示词、标签和图片路径保存在 `content/poses.json`。

首批 30 款清单已补齐，`h-001` 沿用已确认成品；原清单的精灵短发、男孩风短发分别使用 `h-031`、`h-032`，保留原有 `h-002`、`h-003` 两款波波头的编号与素材。新增 29 款使用自然深棕发色，生成模板和逐款完整提示词保存在 `content/hairstyles-generation.json`；用于复制的中英文发型提示词、标签、性别和图片路径保存在 `content/hairstyles.json`。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | 远程素材对象 key 对应的图片域名，如 R2 的 `r2.dev` 地址或自定义域名。留空则从 `public/` 读取；以 `/` 开头的本地素材路径始终从 `public/` 读取 |

`next.config.ts` 会根据该变量生成 `images.remotePatterns`，切换域名不用改代码。

## 素材数据

动作参考图的生成、服装分界清理、验收与入库流程见 [动作参考图生成与入库流程](docs/pose-reference-workflow.md)。下次可将图片与该文档一起提供，按相同流程处理。

素材放在 `content/` 下，按类别分文件：

- `hairstyles.json`：发型，id 形如 `h-001`
- `bodies.json`：身材，id 形如 `b-001`
- `poses.json`：动作，id 形如 `p-001`，可带骨架图 `skeleton`

面貌模块暂不启用，`faces.json` 仅保留原始数据，不加载到素材库或生成详情页。

每条素材的字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 类别前缀加三位数字 |
| `name` | 中文名称 |
| `promptEn` / `promptZh` | 中英文提示词 |
| `tags` | 标签，用于首页筛选 |
| `gender` | `female`、`male` 或 `any` |
| `image` / `thumb` | 本地路径，如 `/hairstyles/h-001.png`，或远程对象 key，如 `hairstyles/h-001.webp` |
| `imageAspectRatio` | 可选，原图宽高比，如三视图为 `1.5`；不填则按 `4 / 5` 展示 |
| `thumbAspectRatio` | 可选，缩略图有效画面的宽高比；列表据此裁掉原有侧边填充，将完整有效画面居中放入统一的 `4 / 5` 预览框，剩余空间用同图模糊背景铺满；不填则按 `4 / 5` 展示 |
| `skeleton` | 仅动作类，可选 |
| `deprecated` | 可选，下架时设为 `true` |

数据在 `src/lib/catalog/schema.ts` 中用 zod 校验。格式错误或 id 重复会让构建直接报错。

**id 发布后不可修改，只能把 `deprecated` 设为 `true`。** 每条素材有独立页面 `/<类别>/<id>`，改 id 会产生死链。

## 路由

- `/`：首页，分类 Tab、标签筛选、素材网格。
- `/[category]/[id]`：素材独立页，构建时静态生成。
- `@modal/(.)[category]/[id]`：首页点击素材时的弹窗，与独立页共用同一个地址。

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
bun run typecheck  # 生成路由类型并检查 TypeScript
bun run build     # 生产构建
bun run start     # 启动生产服务
```

`bun install` 会通过 Lefthook 安装提交前检查。VS Code 默认使用 Biome 扩展格式化。

UI 基于 shadcn（`base-rhea` 风格、`neutral` 基础色、lucide 图标），组件在 `src/components/ui/`。主题由 `next-themes` 管理，支持浅色、深色和跟随系统，颜色变量在 `src/app/globals.css` 的 `:root` 与 `.dark` 中。新增组件：

```bash
bun x shadcn add button
```
