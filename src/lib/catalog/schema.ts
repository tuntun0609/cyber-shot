import { z } from "zod";

export const CATEGORIES = ["hair", "body", "pose"] as const;

export type Category = (typeof CATEGORIES)[number];

const ID_PREFIX: Record<Category, string> = {
  body: "b",
  hair: "h",
  pose: "p",
};

const baseItem = z.object({
  // 发布后 id 不可修改，只能弃用
  deprecated: z.boolean().optional(),
  gender: z.enum(["female", "male", "any"]),
  // 以 / 开头时读取 public 本地素材，否则作为远程对象 key
  image: z.string().min(1),
  imageAspectRatio: z.number().positive().optional(),
  name: z.string().min(1),
  promptEn: z.string().min(1),
  promptZh: z.string().min(1),
  tags: z.array(z.string().min(1)),
  thumb: z.string().min(1),
});

function itemSchema(category: Category) {
  const pattern = new RegExp(`^${ID_PREFIX[category]}-\\d{3}$`);
  const id = z
    .string()
    .regex(pattern, `id 必须形如 ${ID_PREFIX[category]}-001`);

  if (category === "pose") {
    return baseItem.extend({ id, skeleton: z.string().min(1).optional() });
  }
  return baseItem.extend({ id });
}

export const hairSchema = z.array(itemSchema("hair"));
export const bodySchema = z.array(itemSchema("body"));
export const poseSchema = z.array(itemSchema("pose"));

export type Item = z.infer<ReturnType<typeof itemSchema>> & {
  skeleton?: string;
};

export type CatalogItem = Item & { category: Category };
