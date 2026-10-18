import bodies from "../../../content/bodies.json";
import hairstyles from "../../../content/hairstyles.json";
import poses from "../../../content/poses.json";
import {
  bodySchema,
  type CatalogItem,
  type Category,
  hairSchema,
  poseSchema,
} from "./schema";
import { CATEGORY_ORDER, type ItemView } from "./view";

const TRAILING_SLASH = /\/$/;

function withCategory(category: Category, items: object[]): CatalogItem[] {
  return items.map((item) => ({ ...item, category }) as CatalogItem);
}

function assertUniqueIds(items: CatalogItem[]) {
  const seen = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) {
      throw new Error(`素材 id 重复：${id}`);
    }
    seen.add(id);
  }
}

// 模块加载时校验，构建阶段数据有误会直接报错
const catalog: Record<Category, CatalogItem[]> = {
  body: withCategory("body", bodySchema.parse(bodies)),
  hair: withCategory("hair", hairSchema.parse(hairstyles)),
  pose: withCategory("pose", poseSchema.parse(poses)),
};

assertUniqueIds(Object.values(catalog).flat());

export function getItems(category: Category): CatalogItem[] {
  return catalog[category];
}

export function getItem(
  category: Category,
  id: string
): CatalogItem | undefined {
  return catalog[category].find((item) => item.id === id);
}

// 本地路径直接使用；对象 key 配置域名后从远程读取，否则从 public 读取
export function imageUrl(key: string): string {
  if (key.startsWith("/")) {
    return key;
  }
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!base) {
    return `/${key}`;
  }
  return `${base.replace(TRAILING_SLASH, "")}/${key}`;
}

export function toView(item: CatalogItem): ItemView {
  return {
    category: item.category,
    deprecated: item.deprecated ?? false,
    gender: item.gender,
    id: item.id,
    imageAspectRatio: item.imageAspectRatio,
    imageSrc: imageUrl(item.image),
    name: item.name,
    promptEn: item.promptEn,
    promptZh: item.promptZh,
    skeletonSrc: item.skeleton ? imageUrl(item.skeleton) : undefined,
    tags: item.tags,
    thumbSrc: imageUrl(item.thumb),
  };
}

export function getAllViews(): ItemView[] {
  return CATEGORY_ORDER.flatMap((category) => catalog[category].map(toView));
}
