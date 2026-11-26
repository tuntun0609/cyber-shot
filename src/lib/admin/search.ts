export type StatusFilter = "all" | "live" | "off";

export const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "全部状态",
  live: "上架中",
  off: "已下架",
};

// 筛选状态放在 URL 参数里：g 性别，s 状态，q 关键词；类别由路径决定
export interface AdminSearch {
  g?: string;
  q?: string;
  s?: string;
}

export function validateAdminSearch(
  search: Record<string, unknown>
): AdminSearch {
  const { g, q, s } = search;
  return {
    g: typeof g === "string" ? g : undefined,
    q: typeof q === "string" ? q : undefined,
    s: typeof s === "string" ? s : undefined,
  };
}

export function isStatusFilter(
  value: string | undefined
): value is StatusFilter {
  return value === "all" || value === "live" || value === "off";
}
