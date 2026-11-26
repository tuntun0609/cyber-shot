import { createServerFn } from "@tanstack/react-start";
import { getItems, toView } from ".";
import type { CatalogItem } from "./schema";
import type { ItemView } from "./view";

type HomeCategory = "hair" | "pose";

// 落地页精选：写死 id，保证构图稳定；id 不存在或已下架时由同类别其他条目补位
const FEATURED_IDS: Record<HomeCategory, readonly string[]> = {
  hair: ["h-001", "h-002", "h-017", "h-025"],
  pose: ["p-006", "p-013", "p-014", "p-020"],
};
const FEATURED_SIZE = 4;
const TAG_LIMIT = 4;

export interface HomeSection {
  count: number;
  items: ItemView[];
  tags: string[];
}

function getLive(category: HomeCategory): CatalogItem[] {
  return getItems(category).filter((item) => !item.deprecated);
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

function buildSection(category: HomeCategory): HomeSection {
  const live = getLive(category);
  return {
    count: live.length,
    items: pickFeatured(category, live),
    tags: topTags(live),
  };
}

export const loadHome = createServerFn().handler(() => ({
  hair: buildSection("hair"),
  pose: buildSection("pose"),
}));
