import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../db/client";
import type { CatalogRow } from "../../db/schema";
import { catalogItems } from "../../db/schema";
import { getEnv } from "../env";
import type { Category, ItemView } from "./view";
import { CATEGORY_ORDER } from "./view";

const TRAILING_SLASH = /\/$/u;

export type CatalogItem = CatalogRow;

// 列表顺序按自增 id 升序，与导入时的 JSON 数组顺序一致
export async function getItems(category: Category): Promise<CatalogItem[]> {
  const db = await getDb();
  return db
    .select()
    .from(catalogItems)
    .where(eq(catalogItems.category, category))
    .orderBy(asc(catalogItems.id));
}

// category 与行不一致时视为不存在，详情页据此返回 404
export async function getItem(
  category: Category,
  id: number
): Promise<CatalogItem | undefined> {
  const db = await getDb();
  const [item] = await db
    .select()
    .from(catalogItems)
    .where(and(eq(catalogItems.id, id), eq(catalogItems.category, category)))
    .limit(1);
  return item;
}

// 本地路径直接使用；对象 key 配置域名后从远程读取，否则从 public 读取
export function imageUrl(key: string): string {
  if (key.startsWith("/")) {
    return key;
  }
  const base = getEnv().IMAGE_BASE_URL;
  if (!base) {
    return `/${key}`;
  }
  return `${base.replace(TRAILING_SLASH, "")}/${key}`;
}

export function toView(item: CatalogItem): ItemView {
  return {
    category: item.category,
    deprecated: item.deprecated,
    gender: item.gender,
    id: item.id,
    imageAspectRatio: item.imageAspectRatio ?? undefined,
    imageSrc: imageUrl(item.image),
    name: item.name,
    promptEn: item.promptEn,
    promptZh: item.promptZh,
    skeletonSrc: item.skeleton ? imageUrl(item.skeleton) : undefined,
    tags: item.tags,
    thumbAspectRatio: item.thumbAspectRatio ?? undefined,
    thumbSrc: imageUrl(item.thumb),
  };
}

export async function getAllViews(): Promise<ItemView[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(catalogItems)
    .orderBy(asc(catalogItems.id));
  const order = new Map(
    CATEGORY_ORDER.map((category, index) => [category, index])
  );
  // 先按类别顺序（发型、身材、动作），同类别内保持 id 升序
  return rows
    .map((row, index) => ({ index, row }))
    .sort(
      (a, b) =>
        (order.get(a.row.category) ?? 0) - (order.get(b.row.category) ?? 0) ||
        a.index - b.index
    )
    .map(({ row }) => toView(row));
}
