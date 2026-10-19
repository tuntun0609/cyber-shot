# 动作参考图生成与入库流程

本文件供 AI 执行：将用户提供的人物图片转换为黑线白底、无身份特征、无服装分界的白模动作稿，并加入 cyber-shot 的动作素材库。以本次已收录的 `p-008`～`p-012` 为实践参考。

## 1. 下次如何使用

提供图片，并附上本文件或引用 `docs/pose-reference-workflow.md`，发送：

> 按这份文档处理我提供的全部图片，生成动作参考图并加入项目动作数据。保留原图姿势、透视、手部和遮挡，不突出或保留服装；使用真实比例、连续白模轮廓、纯黑线和纯白底。完成后交付图片、入库编号及检查结果。

这条指令授权完成生成、有限修复、导出、更新本地动作数据和验证，不需要在各阶段重复确认。若只需要图片，可改为“按这份文档生成全部动作参考图，暂不入库”。提交 Git、推送或部署不属于此流程。

用户当次明确要求优先；读取当前项目的 `AGENTS.md` 和数据结构后执行，不假定历史编号、素材数量或实现一直不变。

## 2. 输入范围与准备

1. 默认处理用户本次提供的全部姿势图片，按提供顺序建立编号清单。一张源图对应一张独立成品，不拼成多姿势画布，不主动提供多版候选。
2. 用户提供网页或笔记链接时，先确认属于该笔记的图片总数并读取全部图片；排除推荐流、头像、缩略图和轮播的重复节点。不能只处理首图，也不能把页面上所有图片都当成输入。
3. 图片无法取得或链接需要登录时，如实报告缺少哪些输入；不凭标题猜姿势，不用其他照片替代。
4. 查看每张原图。本地图片先用 `view_image` 查看，再交给内置 imagegen。需要浏览网页时使用当前可用的浏览工具，并遵循相应技能。
5. 如环境中可用，读取 `generate-pose-mannequin-lineart`、`imagegen` 技能及其提示词配方；找不到技能时使用本文的完整规范，不假称已读取。
6. 为每张图明确参考角色：人物照片控制姿势与几何；额外线稿只控制画风，不能改变原图姿势、左右关系与裁切。
7. 遵循项目的成年人素材规范，只提取动作，不保留人物身份或模仿名人、知名角色。

生成前为每张图记录：画幅与裁切、人物位置、头部转向和俯仰、肩线高低、躯干倾斜、重心、四肢方向、近大远小，以及逐只手的可见范围、手指数、指序、弯曲和遮挡。不确定的隐藏结构保持隐藏。

## 3. 成品硬性要求

| 项目 | 要求 |
| --- | --- |
| 比例 | 默认真实比例，保留原图肢体长度、体块和透视缩短；仅在用户明确要求时改为修长时装人台 |
| 姿势 | 保留头部角度、肩线、关节位置、手腕方向、腿部交叉、接触点与遮挡顺序；不镜像、不正面化、不对称化 |
| 裁切 | 保留原图可见范围，不擅自补全画外的手、脚或头顶，不为了居中移动人物 |
| 头部 | 光滑、无发型、无耳朵、无五官；无内部辅助线；通过头颅与下颌轮廓表达原有朝向 |
| 身体 | 中性、无明确性征的基础白模体块；颈、肩、臂、躯干、腰、胯与腿连续衔接 |
| 手部 | 保留所有实际可见手指的数量、指序、间隙、弯曲、掌缘与重叠；不增删、不粘连、不复制，不补隐藏手指；删除指甲、戒指与无关掌纹 |
| 线条 | 平滑、连续、粗细稳定的纯黑轮廓；保留必要的肢体遮挡线、腋下短线、腿部分界和手指边界 |
| 白底 | 人物内部与背景均为纯白 `#FFFFFF`，无灰色铺底、阴影、纹理、排线、填色或黑色实心块；正常边缘抗锯齿不视为灰色填充 |
| 其他 | 删除文字、水印、饰品、环境和无关道具；默认不保留道具，用户明确要求保留参与动作的道具时才保留其抽象轮廓与接触关系 |

### 服装处理是重点

不能只去掉颜色、文字或褶皱。成品应当是连续的人台，不能仍读成穿背心、短裤或连体衣。

- 删除领口、高领圈、肩带、袖口、袖窿、衣摆、腰带、裤腰、裤口、接缝和布料褶皱。
- 删除围绕肩根、上臂根部的大段封闭弧线，它们容易被读成无袖上衣的袖窿。肩臂内部保持空白，只保留真实腋下遮挡所需的短线。
- 删除环绕大腿根的裤口环线、带状分界，腰胯与大腿自然衔接。
- 不把衣服的鼓起、厚度或边缘当成人体结构照描。
- 不以新增肌肉线、锁骨线、躯干分块或关节圆替代服装线。
- 同时保留真实的交叠边界：例如前景大腿遮住腰胯的轮廓，不能因为去衣服而被误删。

## 4. 生成提示词模板

先把每张原图的观察填入以下模板，再调用内置 imagegen。所有占位符必须替换为该图的实际内容；左右统一写成“画面左侧／右侧”，避免混淆人物自身左右。

```text
Use case: style-transfer.
Output ONE final image, not variants or a contact sheet.
Image 1 is the ONLY exact pose, proportions, framing, crop, perspective,
hand geometry, contact and occlusion reference.

Convert the person into a neutral featureless white artist-mannequin
contour drawing with smooth pure black lines on a pure white background.
Use realistic source proportions.

GEOMETRY — highest priority:
Preserve [原始画幅、人物位置与裁切].
Preserve [头部转向、俯仰与侧倾].
Preserve [肩线、躯干、骨盆、四肢方向、重心与前后遮挡].
Keep the original limb lengths, contact points and foreshortening.
Do not mirror, center, straighten, frontalize or symmetrize.
Do not symmetrize.

HANDS — highest priority:
Preserve [逐只手的可见范围、可见手指、指序、弯曲、间隙与遮挡].
Keep each actually visible finger individually readable.
Do not add, remove, fuse or duplicate fingers. Do not invent hidden digits.
Preserve [画外或被遮挡的手、脚和其他局部].

CONTINUOUS MANNEQUIN — critical:
Keep a smooth blank head and a neutral, unmarked mannequin body.
Neck, shoulders, arms, torso, waist, hips and legs connect continuously.
No clothing boundaries: no collar, neckline band, shoulder strap, sleeve,
armhole arc, hem, waistband, shorts-leg opening, cuff, seam or fabric fold.
Shoulder surfaces stay blank; retain only short necessary armpit overlaps.
No closed arcs around shoulder roots and no garment rings around thighs.
Do not outline an outfit. Add no body-surface anatomy detail.

OUTPUT:
Pure black smooth continuous contours, consistent thin-to-medium weight.
Pure white (#FFFFFF) figure interiors and background.
Only outer contours and necessary limb-overlap and finger-boundary lines.
Preserve source aspect ratio and crop.

REMOVE:
Face, ears, hair, fingernails, jewelry, background, unrelated props, text,
watermark, shading, gray fills, hatching, texture, construction marks,
joint circles and internal head lines.
[若用户要求保留参与动作的道具，在这里明确唯一例外与接触关系。]
```

必须针对每张图单独写姿势与手部说明。双手不可见时明确写 `ZERO visible hands or fingers; do not add any`。风格参考只控制线宽、轮廓简化与内部线密度。

默认使用内置 imagegen，不因尺寸或保存路径切换到 CLI 或其他服务；工具不可用时如实说明。只有用户另行选择 CLI/API 路线后才使用对应流程，不在聊天中索取 API 密钥。

## 5. 检查与有限修复

每张源图先生成一张候选。查看结果并与原图逐项对照：姿势、头部角度、裁切、手部、遮挡、连续体块、服装分界、耳廓、指甲、背景与线条。合格即停止，不因轻微线宽差异反复生成。

当前白模技能的默认预算为：同一批任务在各图首轮调用之外，共享最多一次自动追加的图像调用，不按图片或缺陷分别累加。明确的后续用户修改要求视为新一轮任务；用户可另行指定重试预算。

| 问题 | 修复方式 |
| --- | --- |
| 姿势、手指几何、关节或遮挡错误 | 回到原始照片重新生成；错误稿不能作为姿势参考 |
| 姿势正确，仅有袖窿、裤口、耳廓、指甲等表面残留 | 对现有稿做局部编辑，指定要删除的线，保留所有姿势与手指几何 |
| 背景、灰度或纹理问题 | 优先定向修复；只需最终导出规范化时可用确定性处理，处理后检查细线 |

服装局部清理的提示词片段：

```text
Use case: precise-object-edit. Image 1 is the existing drawing to edit.
Make only this correction: [明确一处最影响使用的服装分界].
Erase the garment-like line and connect the mannequin surfaces smoothly.
Preserve true limb-overlap boundaries and all existing finger geometry.
Keep the exact crop, proportions, head angle, pose and line weight.
Do not redesign or symmetrize. Pure black contours and pure white interiors
and background. Output one edited final image.
```

服务调用失败或被拦截时，不把失败计作已生成。记录原因与缺失图片；如仍有追加调用预算，可对允许的中性白模任务作一次更局部、明确的重试，不绕过安全限制，不无限重试或自动切换服务。修复后仍有问题时说明残留，不称为全部通过。

未达到硬性门槛的稿件可作为待修候选交付，但默认不加入正式动作数据；不能为了凑齐数量静默收录。用户要求继续修复后再推进。

## 6. 保存与项目导出

### 生成成品

- 将每张最终选定成品保存到 `outputs/imagegen/<本批次描述>/`，按源图顺序编号并使用描述性文件名。
- 保留原始输入与最终成品的对应关系；不交付淘汰候选，不把用户的原始人物照片当作公开素材。
- 不覆盖同名文件；存在时使用 `-v2`、`-v3` 等后缀。批量任务提供成品 ZIP，并核对归档数量。
- 不承诺 imagegen 输出与源图具有完全相同的像素尺寸；核对实际格式、宽高和非零文件大小。

### 入库图片

| 用途 | 路径约定 | 规格 |
| --- | --- | --- |
| 正式原图 | `public/poses/p-NNN-white.png` | PNG，`1152×1536`，3:4 竖版 |
| 正式缩略图 | `public/poses/p-NNN-white.thumb.webp` | 无损 WebP，`384×512`，3:4 竖版 |

生成阶段保留源图比例和裁切；导出阶段再统一为项目画布。源图不是 3:4 时等比适配并加纯白留边，不拉伸、不裁掉已有肢体，也不补画隐藏部分。两种尺寸都应完整保留已选画面。

导出使用项目现有的 Bun 与 Sharp，无需为此新增框架或依赖。确定性处理只负责尺寸、颜色和格式，不负责改造手指或修正姿势。本次实践使用灰度化、轻微提升亮部至纯白、等比导出，再由正式 PNG 生成缩略图；具体亮度阈值根据当前图像检查，不能把细手指线一并洗掉。

如原图本身已经符合黑白规范，无需重复清理。导出后查看实际文件，确认背景和人物内部为纯白、黑线清晰、无色偏、无服装分界，缩略图中手势仍可辨认。

## 7. 加入动作数据

仅在任务包含入库时执行；“按本文生成并入库”已提供授权，不再为常规文件更新询问确认。

1. 读取 `content/poses.json`、`src/lib/catalog/schema.ts` 与现有图片，检查未提交改动，保留用户已有工作。
2. 查找当前所有已使用编号，按最大编号继续分配 `p-NNN`，包括已下架记录；检查文件名冲突。不写死本次之后的起始编号，也不重排旧记录。已发布 id 不修改、不复用。
3. 先准备已验收的正式原图和缩略图，再追加数据，避免出现空记录或失效图片。
4. 为每个动作填写中文名称、中英文提示词、标签、性别与图片字段，保持项目字段格式；默认 `gender: "any"`，除非动作确有必要区分且用户要求。
5. 只在有实际骨架图时填写 `skeleton`；不创建占位路径，也不为普通动作新增 schema 字段。
6. 更新 README 中的收录数量与动作范围，数量从当时的数据计算。
7. 单纯新增素材不改 UI、不新增路由或依赖。若确实需要编写 Next.js 代码，先读 `node_modules/next/dist/docs/` 对应本地版本文档。

以下仅为字段示例；`p-013` 不是固定可用编号，必须替换成当时分配的 id：

```json
{
  "id": "p-013",
  "name": "展臂垂手交叠腿坐姿",
  "promptEn": "Sit with both upper arms spread to the sides and the elbows bent, allowing the forearms and hands to hang naturally. Cross the thighs in the foreground, lower the chin slightly, and preserve the asymmetric hand positions and leg overlap.",
  "promptZh": "坐姿，双上臂向两侧展开并屈肘，前臂与双手自然下垂；大腿在前景交叠，下巴略收，保留双手位置的不对称与腿部遮挡。",
  "tags": ["坐姿", "展臂", "双手下垂", "交叠腿"],
  "gender": "any",
  "image": "/poses/p-013-white.png",
  "imageAspectRatio": 0.75,
  "thumb": "/poses/p-013-white.thumb.webp",
  "thumbAspectRatio": 0.75
}
```

### 提示词与标签规则

`promptZh` 和 `promptEn` 是用户将来复用的动作提示词，不是本次生成白模的完整指令。两种语言内容一致，只描述姿势、朝向、肢体、手势、接触点、遮挡和必要的裁切。

不混入服装、发型、人物身份、白模材质、黑白画风、软件名称或生成过程；不声称原图看不到的部位具有某种姿态。用户明确要求保留的动作道具可描述其握持与接触关系。

名称简短且能区分动作。标签优先复用现有词汇，例如坐姿、站姿、屈膝、展臂、低头、后仰、侧倾、交叠腿、近景、弯指；新增标签必须有可见依据，不把衣服或发型作为动作标签。

## 8. 验证与交付

入库后执行并确认结果：

```bash
bun run check
bun run typecheck
git diff --check
```

可自动修复的格式问题用 `bun run fix` 解决，不关闭规则；检查通过后再交付。若失败来自任务前已有问题，如实区分，不改动无关代码来掩盖失败。

同时验证：

- 数据通过项目的 Zod 校验，所有 id 唯一。
- 新增条数与通过验收的图片数相等，未覆盖原有记录和图片。
- 全部 `image`、`thumb` 路径真实存在，图片可读取且大小非零。
- 正式图与缩略图分别为 `1152×1536`、`384×512`，宽高比字段均为 `0.75`。
- 每条新增记录的名称、双语提示词、标签与实际图片对应。
- 导出图片黑白一致，白底无纹理；手部、裁切和服装清理未被导出处理破坏。
- ZIP 若提供，包含的最终图片数量正确、可正常解压。

最终简要报告：处理了多少张、是否有缺失或待修图、使用内置 imagegen、关键约束、成品或 ZIP 的绝对路径；已入库时再报告新增 id 范围、动作总数和实际通过的检查。不要把待修稿称为合格成品，也不要只给保存目录却未接入动作数据。
