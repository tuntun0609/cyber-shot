export interface HairLength {
  height: number;
  label: string;
  tag: string;
}

export const HAIR_LENGTHS: readonly HairLength[] = [
  { height: 4, label: "超短", tag: "超短发" },
  { height: 10, label: "短", tag: "短发" },
  { height: 12, label: "齐耳", tag: "齐耳" },
  { height: 14, label: "下巴", tag: "下巴" },
  { height: 16, label: "齐颈", tag: "齐颈" },
  { height: 19, label: "锁骨", tag: "锁骨发" },
  { height: 21, label: "齐肩", tag: "齐肩" },
  { height: 24, label: "中长", tag: "中长发" },
  { height: 30, label: "长", tag: "长发" },
];

export interface HairTagGroup {
  key: string;
  label: string;
  tags: readonly string[];
}

export const HAIR_TAG_GROUPS: readonly HairTagGroup[] = [
  { key: "length", label: "长度", tags: HAIR_LENGTHS.map(({ tag }) => tag) },
  {
    key: "bangs",
    label: "刘海",
    tags: [
      "齐刘海",
      "八字刘海",
      "空气刘海",
      "法式刘海",
      "碎刘海",
      "卷刘海",
      "短刘海",
      "微厚刘海",
      "无刘海",
      "露额",
    ],
  },
  {
    key: "parting",
    label: "分缝",
    tags: ["中分", "侧分", "微分", "无明显分缝"],
  },
  {
    key: "curl",
    label: "卷度",
    tags: [
      "直发",
      "内扣",
      "外翘",
      "微卷",
      "大波浪",
      "水波纹",
      "连续波纹",
      "法式卷",
      "慵懒卷",
      "木马卷",
      "羊毛卷",
      "芭比卷",
      "螺旋卷",
      "密集小卷",
      "蓬松",
    ],
  },
  {
    key: "cut",
    label: "剪裁",
    tags: [
      "低层次",
      "层次",
      "高层次",
      "碎剪",
      "齐切",
      "渐变",
      "波波头",
      "狼尾",
      "碎盖",
      "微分碎盖",
      "短碎发",
      "栗子头",
      "圆寸",
      "板寸",
      "平顶",
      "精灵短发",
    ],
  },
  {
    key: "style",
    label: "风格与其他",
    tags: ["日系", "中性", "男孩风", "黑发", "披发", "露耳"],
  },
];

export function hairGroupOf(tag: string): string {
  for (const group of HAIR_TAG_GROUPS) {
    if (group.tags.includes(tag)) {
      return group.key;
    }
  }
  return "other";
}

export function primaryLength(tags: readonly string[]): string | undefined {
  let best: string | undefined;
  for (const { tag } of HAIR_LENGTHS) {
    if (tags.includes(tag) && !(tag === "短发" && best)) {
      best = tag;
    }
  }
  return best;
}

export interface HairBucket {
  key: string;
  label: string;
  lengths: readonly string[];
}

export const HAIR_BUCKETS: readonly HairBucket[] = [
  { key: "very-short", label: "超短发", lengths: ["超短发"] },
  {
    key: "short",
    label: "短发 · 齐耳到齐颈",
    lengths: ["短发", "齐耳", "下巴", "齐颈"],
  },
  {
    key: "medium",
    label: "中长发 · 锁骨到齐肩",
    lengths: ["锁骨发", "齐肩", "中长发"],
  },
  { key: "long", label: "长发", lengths: ["长发"] },
  { key: "other", label: "其他", lengths: [] },
];

export function hairBucketOf(tags: readonly string[]): string {
  const length = primaryLength(tags);
  for (const bucket of HAIR_BUCKETS) {
    if (length && bucket.lengths.includes(length)) {
      return bucket.key;
    }
  }
  return "other";
}

export function hairKeyLine(tags: readonly string[]): string {
  const bangs = HAIR_TAG_GROUPS.find((group) => group.key === "bangs")?.tags;
  const curl = HAIR_TAG_GROUPS.find((group) => group.key === "curl")?.tags;
  const bang =
    tags.find((tag) => bangs?.includes(tag)) ??
    tags.find((tag) => ["中分", "侧分", "微分"].includes(tag));
  const curlTag = tags.find((tag) => curl?.includes(tag));
  return [primaryLength(tags), bang, curlTag]
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");
}
