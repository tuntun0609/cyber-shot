export const CATEGORIES = ["hair", "body", "pose"] as const;

export type Category = (typeof CATEGORIES)[number];

// 客户端组件只依赖这个文件，避免把 zod 和 JSON 数据打进浏览器包
export const CATEGORY_ORDER: readonly Category[] = ["hair", "body", "pose"];

export const BROWSE_CATEGORY_ORDER = [
  "hair",
  "pose",
] as const satisfies readonly Category[];

export type BrowseCategory = (typeof BROWSE_CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  body: "身材",
  hair: "发型",
  pose: "动作",
};

export const GENDER_LABELS: Record<ItemView["gender"], string> = {
  any: "不限",
  female: "女",
  male: "男",
};

export interface ItemView {
  category: Category;
  deprecated: boolean;
  gender: "female" | "male" | "any";
  id: number;
  imageAspectRatio?: number;
  imageSrc: string;
  name: string;
  promptEn: string;
  promptZh: string;
  skeletonSrc?: string;
  tags: string[];
  thumbAspectRatio?: number;
  thumbSrc: string;
}

export function isCategory(value: string): value is Category {
  return (CATEGORY_ORDER as readonly string[]).includes(value);
}

export function isBrowseCategory(value: string): value is Category {
  return (BROWSE_CATEGORY_ORDER as readonly string[]).includes(value);
}
