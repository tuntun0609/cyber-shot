import { createServerFn } from "@tanstack/react-start";
import type { CatalogItem } from ".";
import { getItems, toView } from ".";
import type { ItemView } from "./view";

type HomeCategory = "hair" | "pose";

// 落地页精选：写死 id，保证构图稳定；id 不存在或已下架时由同类别其他条目补位
const FEATURED_IDS: Record<HomeCategory, readonly number[]> = {
  hair: [1, 2, 17, 25],
  pose: [39, 46, 47, 53],
};
const FEATURED_SIZE = 4;
const TAG_LIMIT = 4;

export interface HomeSection {
  count: number;
  items: ItemView[];
  tags: string[];
}

async function getLive(category: HomeCategory): Promise<CatalogItem[]> {
  const items = await getItems(category);
  return items.filter((item) => !item.deprecated);
}

function pickFeatured(category: HomeCategory, live: CatalogItem[]) {
  const picked = FEATURED_IDS[category]
    .map((id) => live.find((item) => item.id === id))
    .filter((item): item is CatalogItem => item !== undefined);
  const rest = live.filter((item) => !picked.includes(item));
  return [...picked, ...rest].slice(0, FEATURED_SIZE).map(toView);
}

function topTags(live: CatalogItem[]) {
  const counts = new Map<string, number>();
  for (const item of live) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TAG_LIMIT)
    .map(([tag]) => tag);
}

async function buildSection(category: HomeCategory): Promise<HomeSection> {
  const live = await getLive(category);
  return {
    count: live.length,
    items: pickFeatured(category, live),
    tags: topTags(live),
  };
}

export const loadHome = createServerFn().handler(async () => {
  const [hair, pose] = await Promise.all([
    buildSection("hair"),
    buildSection("pose"),
  ]);
  return { hair, pose };
});
