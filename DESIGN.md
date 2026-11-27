# cyber-shot 设计系统

本文只约束视觉样式。token 的唯一事实来源是 `src/styles/globals.css`；组件必须使用语义 token 和既有材料预设，不直接写 hex、rgb、hsl 色值。

## 颜色

定义方式参考 Vercel Geist：颜色按用途映射到语义层级，浅色和深色共享同一套 token。

| Token                    | 浅色                  | 深色                     | 用途                                            |
| ------------------------ | --------------------- | ------------------------ | ----------------------------------------------- |
| `--background`           | `#ffffff`             | `#0a0a0a`                | 页面底色                                        |
| `--foreground`           | `#17181a`             | `#ffffff`                | 一级文字、标题、主要图标                        |
| `--card`                 | `#f7f7f6`             | `#0f0f0f`                | 卡片、营销面板、低风险内容容器                  |
| `--card-foreground`      | `#17181a`             | `#ffffff`                | 卡片内一级文字                                  |
| `--popover`              | `#ffffff`             | `#181818`                | 菜单、Dialog、Sheet、Toast                      |
| `--popover-foreground`   | `#17181a`             | `#ffffff`                | 浮层内一级文字                                  |
| `--primary`              | `#0e0f11`             | `#ffffff`                | 实心主按钮、选中态、高对比标记                  |
| `--primary-foreground`   | `#f4f3f1`             | `#000000`                | 放在 `--primary` 上的文字                       |
| `--secondary`            | `#f1f1f0`             | `#181818`                | 次要按钮、标签填充、弱背景                      |
| `--secondary-foreground` | `#3c3b37`             | `#b4b4b4`                | 次要填充上的文字                                |
| `--muted`                | `#f1f1f0`             | `#181818`                | hover 背景、骨架屏、图像占位                    |
| `--muted-foreground`     | `#6f6e68`             | `#9a9a9a`                | 二级文字、说明、计数、placeholder               |
| `--accent`               | `#ecebe7`             | `#202020`                | 菜单项 focus、激活态、较强填充                  |
| `--accent-foreground`    | `#17181a`             | `#ffffff`                | accent 上的文字                                 |
| `--destructive`          | `#e5484d`             | `#ff6369`                | 危险文字、错误边框、破坏性操作                  |
| `--success`              | `#18794e`             | `#3dd68c`                | 正向状态、恢复或启用类操作                      |
| `--border`               | `rgb(23 24 26 / 10%)` | `rgb(255 255 255 / 10%)` | 结构性 1px 分隔线                               |
| `--input`                | `rgb(23 24 26 / 12%)` | `rgb(255 255 255 / 14%)` | 输入控件 alpha 填充基色，通常写作 `bg-input/50` |
| `--ring`                 | `#0d99ff`             | `#3aa9ff`                | 焦点环；不作为品牌蓝色使用                      |

补充规则：

- 侧边栏使用 `--sidebar-*` 镜像 token，与全局同层级，不单独创造风格。
- `--chart-1` 到 `--chart-5` 只用于数据可视化。
- 卡片和 Dialog 用 `ring-1`：浅色 `ring-foreground/8`，深色 `dark:ring-foreground/10`。
- 弹出菜单用更轻的 ring：浅色 `ring-foreground/5`，深色 `dark:ring-foreground/10`。
- 控件 focus 用 `ring-ring/30`；全局 `:focus-visible` 用 `outline-ring`。

## 字体与排版

| 角色             | 字体栈                                                               | 用途                         |
| ---------------- | -------------------------------------------------------------------- | ---------------------------- |
| `--font-sans`    | Inter → system-ui → PingFang SC / Hiragino Sans GB / Microsoft YaHei | 正文、控件、表格、数字       |
| `--font-heading` | Plus Jakarta Sans → Inter → system-ui → 中文系统字体                 | 标题、品牌名、卡片标题       |
| `--font-mono`    | 兼容别名，实际仍回退到 UI 字体                                       | 不使用；不要新增 `font-mono` |

排版尺度：

| 样式           | Tailwind 组合                                        | 用途                     |
| -------------- | ---------------------------------------------------- | ------------------------ |
| Hero           | `text-4xl sm:text-6xl font-semibold tracking-tight`  | 首页主标题               |
| Page title     | `text-2xl font-semibold tracking-tight`              | 列表页、后台页面标题     |
| Section title  | `text-xl` 或 `text-2xl font-semibold tracking-tight` | 区块标题、入口卡标题     |
| Card title     | `text-base font-medium`                              | 卡片标题、弹窗标题       |
| Body           | `text-sm`                                            | 组件正文、表格、描述     |
| Large body     | `text-base sm:text-lg`                               | hero 说明等重要短句      |
| Caption / meta | `text-xs text-muted-foreground`                      | 计数、辅助说明、免责声明 |
| Button / label | `text-sm font-medium`                                | 按钮、导航、表单标签     |

排版规则：

- `h1`–`h3` 使用 `--font-heading` 和 `letter-spacing: -0.02em`。
- 标题用 `font-semibold`；卡片和控件标题用 `font-medium`。
- 辅助信息统一 `text-muted-foreground`。
- 数字、ID、计数加 `tabular-nums`，不使用 mono 字体。

## 圆角与材料

基础半径 `--radius` 是 `0.75rem`（12px）。

| Token / 类名                   | 计算值 | 用途                                                                    |
| ------------------------------ | -----: | ----------------------------------------------------------------------- |
| `--radius-sm` / `rounded-sm`   |  7.2px | 极小内部元素，谨慎使用                                                  |
| `--radius-md` / `rounded-md`   |  9.6px | 小元素内部细节，谨慎使用                                                |
| `--radius-lg` / `rounded-lg`   |   12px | 紧凑列表行、小缩略图、骨架行                                            |
| `--radius-xl` / `rounded-xl`   | 16.8px | 菜单项、侧边栏菜单项                                                    |
| `--radius-2xl` / `rounded-2xl` | 21.6px | 图片预览、缩略图容器、空状态、小型浮层                                  |
| `--radius-3xl` / `rounded-3xl` | 26.4px | Textarea、菜单容器、营销面板、骨架块                                    |
| `--radius-4xl`                 | 31.2px | 不直接裸露使用，通常与 24px 上限组合                                    |
| `rounded-full`                 | 9999px | 按钮、输入框、Select、Badge、导航项、Toggle、Radio、Tooltip、圆形图标底 |

材料预设：

| 材料              | 形状与填充                                                                  | 用途                                         |
| ----------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| `control-pill`    | `rounded-full` + `bg-input/50` 或语义按钮填充                               | Button、Input、Select、Badge、Toggle、导航项 |
| `row-compact`     | `rounded-lg` 或 `rounded-xl` + hover `bg-muted`                             | 筛选项、菜单项、侧边栏菜单项                 |
| `media-tile`      | `rounded-2xl` + `bg-muted` + 轻 ring                                        | 后台缩略图、上传预览、图像占位               |
| `surface-block`   | `rounded-3xl` + `bg-card` 或 `bg-popover`                                   | 营销面板、Textarea、菜单容器、骨架屏         |
| `surface-panel`   | `rounded-[min(var(--radius-4xl),24px)]` + `bg-card`/`bg-popover` + `ring-1` | Card、Dialog                                 |
| `overlay-drawer`  | 直角贴边 + `bg-popover` + `shadow-xl`                                       | Sheet、移动端侧边栏                          |
| `tooltip-inverse` | `rounded-full` + `bg-foreground text-background`                            | Tooltip                                      |

功能性例外只留在组件内部：Checkbox 圆角 `5px`，Tooltip 箭头圆角 `2px`。

## 阴影与层级

| 层级            | 规则                                             | 用途                            |
| --------------- | ------------------------------------------------ | ------------------------------- |
| Flat            | 无 shadow，`ring-1` + 低透明前景色               | Card、营销面板、入口卡          |
| Raised          | `shadow-lg` + `ring-1`                           | Dropdown、Select 菜单、小型浮层 |
| Modal           | `shadow-xl` + `ring-1`                           | Dialog、Sheet                   |
| Floating action | `shadow-sm`                                      | 图片上的复制按钮等临时浮动作    |
| Sticky chrome   | `bg-background/85 backdrop-blur-md` + `border-b` | 顶部导航、目录页工具栏          |

卡片默认不加阴影。hover 反馈优先增强 ring 或使用 1–2px 轻微位移。

## 布局

| 页面类型      | 宽度与间距                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| 首页 / 营销页 | `max-w-6xl`，水平 padding `px-4 sm:px-6`；hero 上方 `pt-12 sm:pt-20`        |
| 素材目录页    | 顶栏 `h-14` sticky；工具栏 `h-14` sticky 且 `top-14`；内容区 `px-4 md:px-6` |
| 目录筛选侧栏  | 桌面 `15rem`，大屏 `16rem`；高度用 `100svh` 计算，sticky 在工具栏下         |
| 后台          | Sidebar 桌面 `16rem`、移动 `18rem`；主内容 `p-4 sm:p-6`；移动端顶栏 `h-12`  |

网格规则：

- 素材卡片：`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`，`gap-3`，`auto-rows-fr`。
- 首页入口：`md:grid-cols-2`，`gap-5`。
- 特性卡片：`md:grid-cols-3`，`gap-5`。
- 卡片内部优先使用 `gap-2`–`gap-5`。
- 列表密集区域使用 `border-b` 或 `Separator`。

## 组件样式

| 组件                   | 约束                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Button                 | 药丸形；默认实心 `bg-primary`；outline 用 `border-foreground/12`；ghost/secondary 用中性填充 |
| Input / Select         | 药丸形；`bg-input/50`、透明 border；focus 用 `border-ring` + `ring-ring/30`；默认高度 `h-8`  |
| Textarea               | `rounded-3xl`；`bg-input/50` 和 focus ring                                                   |
| Badge                  | 药丸形、`h-5`、`text-xs`；标签多用 `secondary` 或 `outline`                                  |
| Card                   | `surface-panel`；`bg-card`、轻 ring、无 shadow                                               |
| Dialog                 | `surface-panel`；`bg-popover`、轻 ring、`shadow-xl`；宽度 `max-w-md`                         |
| Dropdown / Select menu | `surface-block`；`bg-popover`、`shadow-lg`、轻 ring；菜单项 `rounded-xl`                     |
| Sheet                  | 贴边抽屉；`bg-popover` + `shadow-xl`                                                         |
| Tooltip                | `tooltip-inverse`；短文本、小号字号                                                          |
| Checkbox / Radio       | 选中态 `bg-primary`；Checkbox 小方角，Radio 正圆                                             |
| Table                  | 行分隔 `border-b`；hover `bg-muted/50`；表头 `font-medium`                                   |
| Skeleton               | `bg-muted` + `animate-pulse`；块状 `rounded-3xl`，行状可 `rounded-lg`                        |
| Toast                  | 使用 popover 背景、边框和文字 token；底部居中                                                |
| Sidebar                | 使用 sidebar token；菜单项 `rounded-xl`；激活态 `bg-sidebar-accent`                          |

## 禁止

- 不在组件中写 hex、rgb、hsl 色值。
- 不把 `--ring` 的蓝色当品牌色或普通链接色。
- 不使用彩色渐变、发光、玻璃拟态、厚重阴影。
- 不新增 `font-mono` 用法。
- 不为同类控件创造新的圆角值。
- 不用 `outline-none` 取消焦点后不做补偿。

## 参考

- [Vercel Geist Colors](https://vercel.com/geist/colors)
- [Vercel Geist Typography](https://vercel.com/geist/typography)
- [Vercel Geist Materials](https://vercel.com/geist/materials)
