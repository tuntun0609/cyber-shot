import { z } from "zod";
import { CATEGORIES } from "../catalog/view";

// 前后端共用的校验规则：客户端提交前校验，服务端写入前再校验一遍
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_EXTENSIONS = ["png", "jpg", "webp"] as const;

export type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

const NAME_MAX = 50;
const PROMPT_MAX = 1000;
const TAG_MAX = 20;
const TAGS_MAX = 10;

// 只接受上传接口生成的对象 key，避免请求里带任意 key 指向 bucket 里的其他文件
const UPLOAD_KEY_PATTERN =
  /^cyber-shot\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:png|jpg|webp)$/u;

export const uploadKeySchema = z.string().regex(UPLOAD_KEY_PATTERN);

const requiredText = (max: number) => z.string().trim().min(1).max(max);

// 去重后保存，顺序保持用户输入顺序
const tagsSchema = z
  .array(requiredText(TAG_MAX))
  .max(TAGS_MAX)
  .transform((tags) => [...new Set(tags)]);

// thumb 复用 image 的 key，所以只需要一份宽高比
const uploadedImageSchema = z.object({
  aspectRatio: z.number().positive(),
  key: uploadKeySchema,
});

const fields = {
  gender: z.enum(["female", "male", "any"]),
  name: requiredText(NAME_MAX),
  promptEn: requiredText(PROMPT_MAX),
  promptZh: requiredText(PROMPT_MAX),
  tags: tagsSchema,
};

export const createItemSchema = z
  .object({
    ...fields,
    category: z.enum(CATEGORIES),
    image: uploadedImageSchema,
    skeleton: uploadKeySchema.nullish(),
  })
  .refine((value) => !value.skeleton || value.category === "pose", {
    message: "只有动作可以设置骨架图",
    path: ["skeleton"],
  });

// 类别创建后不可改；image 不传表示保留原图，skeleton 不传保留、null 表示清除
export const updateItemSchema = z.object({
  ...fields,
  id: z.number().int().positive(),
  image: uploadedImageSchema.optional(),
  skeleton: uploadKeySchema.nullable().optional(),
});

export const setDeprecatedSchema = z.object({
  deprecated: z.boolean(),
  id: z.number().int().positive(),
});

export type CreateItemInput = z.input<typeof createItemSchema>;
export type UpdateItemInput = z.input<typeof updateItemSchema>;
