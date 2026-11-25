import type { Category } from "./schema";
import { isBrowseCategory } from "./view";

export type GenderFilter = "all" | "female" | "male";

export const GENDER_FILTERS: readonly GenderFilter[] = [
  "all",
  "female",
  "male",
];

export interface Filters {
  category: Category;
  gender: GenderFilter;
  query: string;
  tags: string[];
}

export const DEFAULT_FILTERS: Filters = {
  category: "hair",
  gender: "all",
  query: "",
  tags: [],
};

export interface CatalogSearch {
  c?: string;
  g?: string;
  q?: string;
  t?: string;
}

export function validateCatalogSearch(
  search: Record<string, unknown>
): CatalogSearch {
  const { c: category, g: gender, q: query, t: tags } = search;
  return {
    c: typeof category === "string" ? category : undefined,
    g: typeof gender === "string" ? gender : undefined,
    q: typeof query === "string" ? query : undefined,
    t: typeof tags === "string" ? tags : undefined,
  };
}

export function isGenderFilter(
  value: string | undefined
): value is GenderFilter {
  return GENDER_FILTERS.some((filter) => filter === value);
}

export function readFilters(search: CatalogSearch): Filters {
  const { c: category, g: gender, q: query, t: tags } = search;
  return {
    category:
      category && isBrowseCategory(category)
        ? category
        : DEFAULT_FILTERS.category,
    gender: isGenderFilter(gender) ? gender : DEFAULT_FILTERS.gender,
    query: query ?? "",
    tags: tags?.split(",").filter(Boolean) ?? [],
  };
}

export function writeFilters(filters: Filters): CatalogSearch {
  return {
    c:
      filters.category === DEFAULT_FILTERS.category
        ? undefined
        : filters.category,
    g: filters.gender === "all" ? undefined : filters.gender,
    q: filters.query || undefined,
    t: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
  };
}
