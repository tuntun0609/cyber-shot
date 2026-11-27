const WHITESPACE_PATTERN = /\s+/u;

export type GenderFilter = "all" | "female" | "male";
export type CatalogView = "grouped" | "flat";

export const GENDER_FILTERS: readonly GenderFilter[] = [
  "all",
  "female",
  "male",
];

export interface Filters {
  gender: GenderFilter;
  query: string;
  tags: string[];
  view: CatalogView;
}

export const DEFAULT_FILTERS: Filters = {
  gender: "all",
  query: "",
  tags: [],
  view: "grouped",
};

export interface CatalogSearch {
  g?: string;
  q?: string;
  t?: string;
  v?: string;
}

export function validateCatalogSearch(
  search: Record<string, unknown>
): CatalogSearch {
  const { g: gender, q: query, t: tags, v: view } = search;
  return {
    g: typeof gender === "string" ? gender : undefined,
    q: typeof query === "string" ? query : undefined,
    t: typeof tags === "string" ? tags : undefined,
    v: typeof view === "string" ? view : undefined,
  };
}

export function isGenderFilter(
  value: string | undefined
): value is GenderFilter {
  return GENDER_FILTERS.some((filter) => filter === value);
}

export function readFilters(search: CatalogSearch): Filters {
  const { g: gender, q: query, t: tags, v: view } = search;
  return {
    gender: isGenderFilter(gender) ? gender : DEFAULT_FILTERS.gender,
    query: query ?? "",
    tags: tags?.split(",").filter(Boolean) ?? [],
    view: view === "flat" ? "flat" : DEFAULT_FILTERS.view,
  };
}

export function writeFilters(filters: Filters): CatalogSearch {
  return {
    g: filters.gender === "all" ? undefined : filters.gender,
    q: filters.query || undefined,
    t: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
    v: filters.view === "flat" ? "flat" : undefined,
  };
}

export function matchesTagGroups(
  itemTags: readonly string[],
  selectedTags: readonly string[],
  groupOf: (tag: string) => string
): boolean {
  const selectedByGroup = new Map<string, string[]>();
  for (const tag of selectedTags) {
    const group = groupOf(tag);
    selectedByGroup.set(group, [...(selectedByGroup.get(group) ?? []), tag]);
  }
  for (const groupTags of selectedByGroup.values()) {
    if (!groupTags.some((tag) => itemTags.includes(tag))) {
      return false;
    }
  }
  return true;
}

export function matchesQueryWords(
  query: string,
  fields: readonly string[]
): boolean {
  const words = query.toLowerCase().split(WHITESPACE_PATTERN).filter(Boolean);
  if (words.length === 0) {
    return true;
  }
  const haystack = fields.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}
