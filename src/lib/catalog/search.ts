export type GenderFilter = "all" | "female" | "male";

export const GENDER_FILTERS: readonly GenderFilter[] = [
  "all",
  "female",
  "male",
];

export interface Filters {
  gender: GenderFilter;
  query: string;
  tags: string[];
}

export const DEFAULT_FILTERS: Filters = {
  gender: "all",
  query: "",
  tags: [],
};

export interface CatalogSearch {
  g?: string;
  q?: string;
  t?: string;
}

export function validateCatalogSearch(
  search: Record<string, unknown>
): CatalogSearch {
  const { g: gender, q: query, t: tags } = search;
  return {
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
  const { g: gender, q: query, t: tags } = search;
  return {
    gender: isGenderFilter(gender) ? gender : DEFAULT_FILTERS.gender,
    query: query ?? "",
    tags: tags?.split(",").filter(Boolean) ?? [],
  };
}

export function writeFilters(filters: Filters): CatalogSearch {
  return {
    g: filters.gender === "all" ? undefined : filters.gender,
    q: filters.query || undefined,
    t: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
  };
}
