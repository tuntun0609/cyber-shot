import {
  Link,
  linkOptions,
  useNavigate,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
import {
  ChevronDownIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  HAIR_BUCKETS,
  HAIR_LENGTHS,
  HAIR_TAG_GROUPS,
  hairBucketOf,
  hairGroupOf,
  hairKeyLine,
} from "@/lib/catalog/hair-facets";
import type {
  CatalogSearch,
  CatalogView,
  Filters,
  GenderFilter,
} from "@/lib/catalog/search";
import {
  DEFAULT_FILTERS,
  isGenderFilter,
  matchesQueryWords,
  matchesTagGroups,
  readFilters,
  writeFilters,
} from "@/lib/catalog/search";
import type { BrowseCategory, ItemView } from "@/lib/catalog/view";
import { CATEGORY_LABELS, GENDER_LABELS } from "@/lib/catalog/view";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { HairLengthIcon } from "./hair-length-icon";
import { ItemImage } from "./item-image";

const CATEGORY_PATHS = {
  hair: "/hair",
  pose: "/pose",
} as const satisfies Record<BrowseCategory, string>;

const BROWSER_TITLES: Record<BrowseCategory, string> = {
  hair: "发型库",
  pose: "姿势库",
};

const VIEW_LABELS: Record<CatalogView, string> = {
  flat: "平铺",
  grouped: "按长度分组",
};

const MODAL_PATH_PATTERN = /^\/catalog-modal\/[^/]+\/\d+\/?$/u;

interface ActiveCondition {
  key: string;
  label: string;
  remove: () => void;
}

interface FacetGroup {
  defaultCollapsed?: boolean;
  key: string;
  label: string;
  tags: readonly string[];
}

function matchesGender(item: ItemView, gender: GenderFilter) {
  return gender === "all" || item.gender === "any" || item.gender === gender;
}

function matchesQuery(item: ItemView, query: string) {
  return matchesQueryWords(query, [
    String(item.id),
    item.name,
    item.promptZh,
    item.promptEn,
    ...item.tags,
  ]);
}

function TagToggle({
  count,
  onTag,
  selected,
  value,
}: {
  count: number;
  onTag: (value: string, checked: boolean) => void;
  selected: boolean;
  value: string;
}) {
  const handlePressedChange = useCallback(
    (pressed: boolean) => onTag(value, pressed),
    [onTag, value]
  );
  const disabled = count === 0 && !selected;
  return (
    <Toggle
      aria-pressed={selected}
      className={cn(
        "h-auto min-h-7 gap-1 rounded-full px-2.5 py-1 text-xs font-normal",
        selected &&
          "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background",
        disabled && "opacity-35"
      )}
      disabled={disabled}
      onPressedChange={handlePressedChange}
      pressed={selected}
      size="sm"
      variant="outline"
    >
      <span>{value}</span>
      <span
        className={cn(
          "text-muted-foreground text-[11px] tabular-nums",
          selected && "text-background/70"
        )}
      >
        {count}
      </span>
    </Toggle>
  );
}

function FilterGroup({
  counts,
  filters,
  group,
  idPrefix,
  onTag,
}: {
  counts: Record<string, number>;
  filters: Filters;
  group: FacetGroup;
  idPrefix: string;
  onTag: (value: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(!group.defaultCollapsed);
  const selectedCount = group.tags.filter((tag) =>
    filters.tags.includes(tag)
  ).length;
  const toggleOpen = useCallback(() => setOpen((value) => !value), []);
  const headingId = `${idPrefix}-group-${group.key}`;

  return (
    <section className="border-b pb-3 last:border-b-0">
      <button
        aria-controls={`${headingId}-content`}
        aria-expanded={open}
        className="flex min-h-8 w-full items-center gap-1 rounded-lg px-1 text-left text-[13px] font-semibold"
        id={headingId}
        onClick={toggleOpen}
        type="button"
      >
        {group.label}
        {selectedCount > 0 ? (
          <span className="text-primary text-xs font-normal">
            已选 {selectedCount}
          </span>
        ) : null}
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground ml-auto size-4 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open ? (
        <div
          className="flex flex-wrap gap-1.5 px-1 pt-1"
          id={`${headingId}-content`}
        >
          {group.tags.map((value) => (
            <TagToggle
              count={counts[value] ?? 0}
              key={value}
              onTag={onTag}
              selected={filters.tags.includes(value)}
              value={value}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FilterPanel({
  category,
  facetCounts,
  filters,
  groups,
  idPrefix,
  onTag,
}: {
  category: BrowseCategory;
  facetCounts: Record<string, Record<string, number>>;
  filters: Filters;
  groups: FacetGroup[];
  idPrefix: string;
  onTag: (value: string, checked: boolean) => void;
}) {
  return (
    <div className="grid gap-3">
      {category === "hair" ? (
        <p className="text-muted-foreground px-1 text-xs leading-relaxed">
          同组多选为“或”，不同组为“且”
        </p>
      ) : null}
      {groups.map((group) => (
        <FilterGroup
          counts={facetCounts[group.key] ?? {}}
          filters={filters}
          group={group}
          idPrefix={idPrefix}
          key={group.key}
          onTag={onTag}
        />
      ))}
    </div>
  );
}

function ActiveFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge className="h-7 gap-1 pr-1 pl-2.5 text-xs" variant="outline">
      {label}
      <Button
        aria-label={`移除 ${label}`}
        className="rounded-full"
        onClick={onRemove}
        size="icon-xs"
        variant="ghost"
      >
        <XIcon />
      </Button>
    </Badge>
  );
}

function itemLinkOptions(item: ItemView, search: CatalogSearch) {
  const params = { category: item.category, id: String(item.id) };
  return linkOptions({
    mask: { params, search: {}, to: "/$category/$id", unmaskOnReload: true },
    params,
    resetScroll: false,
    search,
    to: "/catalog-modal/$category/$id",
  });
}

function ItemCard({ item, search }: { item: ItemView; search: CatalogSearch }) {
  const detailLink = itemLinkOptions(item, search);
  const previewAspectRatio =
    item.category === "pose" ? (item.thumbAspectRatio ?? 3 / 4) : 4 / 5;
  const thumbAspectRatio = item.thumbAspectRatio ?? previewAspectRatio;
  const keyLine =
    item.category === "hair"
      ? hairKeyLine(item.tags)
      : item.tags.slice(0, 3).join(" · ");

  return (
    <li className="min-w-0">
      <Card className="group can-hover:hover:ring-foreground/20 can-hover:hover:-translate-y-0.5 relative h-full gap-0 py-0 transition duration-200">
        <div className="relative shrink-0">
          <Link
            className="bg-muted relative block overflow-hidden"
            style={{ aspectRatio: previewAspectRatio }}
            {...detailLink}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                transform: `scale(${Math.max(1, previewAspectRatio / thumbAspectRatio) * 1.1})`,
              }}
            >
              <ItemImage
                alt=""
                aspectRatio={thumbAspectRatio}
                className="object-cover opacity-70 blur-2xl"
                sizes="64px"
                src={item.thumbSrc}
              />
            </div>
            {/* 有效画面完整居中显示，同图模糊铺底填满剩余空间。 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative shrink-0"
                style={{
                  height: `${Math.min(1, previewAspectRatio / thumbAspectRatio) * 100}%`,
                  width: `${Math.min(1, thumbAspectRatio / previewAspectRatio) * 100}%`,
                }}
              >
                <ItemImage
                  alt={item.name}
                  aspectRatio={thumbAspectRatio}
                  className="object-cover"
                  sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 28vw, (min-width: 640px) 33vw, 50vw"
                  src={item.thumbSrc}
                />
              </div>
            </div>
          </Link>
          {item.gender === "male" ? (
            <Badge
              className="absolute top-2 left-2 rounded-md bg-white/90 px-1.5 text-[11px] text-black shadow-sm"
              variant="secondary"
            >
              男
            </Badge>
          ) : null}
          <CopyButton
            className="can-hover:hidden absolute top-2 right-2 shadow-sm"
            label="复制"
            size="sm"
            text={item.promptZh}
            variant="secondary"
          />
          <div className="can-hover:group-hover:pointer-events-auto can-hover:group-hover:opacity-100 can-hover:focus-within:pointer-events-auto can-hover:focus-within:opacity-100 pointer-events-none absolute inset-x-0 bottom-0 flex gap-2 bg-linear-to-t from-black/55 to-transparent p-2 pt-8 opacity-0 transition-opacity">
            <CopyButton
              className="flex-1 border-0 bg-white/95 text-black shadow-none hover:bg-white"
              label="复制中文"
              size="xs"
              text={item.promptZh}
              variant="secondary"
            />
            <CopyButton
              className="flex-1 border-0 bg-white/95 text-black shadow-none hover:bg-white"
              label="复制 EN"
              size="xs"
              text={item.promptEn}
              variant="secondary"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <Link
            className="can-hover:hover:text-primary min-w-0 truncate text-sm font-medium transition-colors"
            {...detailLink}
          >
            {item.name}
          </Link>
          <p className="text-muted-foreground truncate text-xs">
            {keyLine || " "}
          </p>
        </div>
      </Card>
    </li>
  );
}

function ItemsGrid({
  items,
  search,
}: {
  items: ItemView[];
  search: CatalogSearch;
}) {
  return (
    <ul className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ItemCard item={item} key={item.id} search={search} />
      ))}
    </ul>
  );
}

function LengthButton({
  count,
  height,
  label,
  onTag,
  selected,
  tag,
}: {
  count: number;
  height: number;
  label: string;
  onTag: (value: string, checked: boolean) => void;
  selected: boolean;
  tag: string;
}) {
  const disabled = count === 0 && !selected;
  const handleClick = useCallback(
    () => onTag(tag, !selected),
    [onTag, selected, tag]
  );
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "border-input bg-background flex min-w-16 flex-none flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 text-xs transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "can-hover:hover:bg-muted",
        disabled && "opacity-40"
      )}
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      <HairLengthIcon height={height} tag={tag} />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground text-[11px] leading-none tabular-nums">
        {count}
      </span>
    </button>
  );
}

function ResultsContent({
  activeConditions,
  clearAll,
  groupedSections,
  hasFilters,
  search,
  visible,
}: {
  activeConditions: ActiveCondition[];
  clearAll: () => void;
  groupedSections: { items: ItemView[]; key: string; label: string }[];
  hasFilters: boolean;
  search: CatalogSearch;
  visible: ItemView[];
}) {
  if (visible.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed px-6 py-20 text-center">
        <SearchXIcon className="text-muted-foreground size-8" />
        <p className="font-medium">没有符合条件的素材</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          {hasFilters
            ? "当前的搜索词、性别或标签组合太窄了，放宽条件试试。"
            : "这个类别暂时还没有素材。"}
        </p>
        {activeConditions.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-muted-foreground text-xs">试试去掉：</span>
            {activeConditions.slice(-2).map((condition) => (
              <ActiveFilter
                key={condition.key}
                label={condition.label}
                onRemove={condition.remove}
              />
            ))}
          </div>
        ) : null}
        {hasFilters ? (
          <Button className="mt-2" onClick={clearAll} size="lg">
            清除筛选
          </Button>
        ) : null}
      </div>
    );
  }

  if (groupedSections.length > 0) {
    return (
      <div className="grid gap-5">
        {groupedSections.map((section) => (
          <section className="grid gap-2.5" key={section.key}>
            <h2 className="flex items-baseline gap-2 text-sm font-semibold">
              {section.label}
              <span className="text-muted-foreground text-xs font-normal">
                {section.items.length} 款
              </span>
            </h2>
            <ItemsGrid items={section.items} search={search} />
          </section>
        ))}
      </div>
    );
  }

  return <ItemsGrid items={visible} search={search} />;
}

export function CatalogBrowser({
  category,
  items,
}: {
  category: BrowseCategory;
  items: ItemView[];
}) {
  const search = useSearch({ from: "/_catalog" });
  const navigate = useNavigate();
  const filters = readFilters(search);
  const { gender, query, tags, view } = filters;
  const isHair = category === "hair";

  const update = useCallback(
    (patch: (prev: Filters) => Filters) => {
      navigate({
        replace: true,
        resetScroll: false,
        search: (previous) => writeFilters(patch(readFilters(previous))),
        to: CATEGORY_PATHS[category],
      });
    },
    [category, navigate]
  );

  const groupOf = useCallback(
    (tag: string) => (isHair ? hairGroupOf(tag) : tag),
    [isHair]
  );
  const live = useMemo(() => items.filter((item) => !item.deprecated), [items]);
  const categoryLive = useMemo(
    () => live.filter((item) => item.category === category),
    [category, live]
  );
  const baseMatched = useMemo(
    () =>
      categoryLive.filter(
        (item) => matchesGender(item, gender) && matchesQuery(item, query)
      ),
    [categoryLive, gender, query]
  );
  const visible = useMemo(
    () =>
      baseMatched.filter((item) => matchesTagGroups(item.tags, tags, groupOf)),
    [baseMatched, groupOf, tags]
  );
  const categoryTags = useMemo(
    () => [...new Set(categoryLive.flatMap((item) => item.tags))],
    [categoryLive]
  );

  const filterGroups = useMemo<FacetGroup[]>(() => {
    if (!isHair) {
      return [{ key: "tags", label: "标签", tags: categoryTags }];
    }
    const groups: FacetGroup[] = HAIR_TAG_GROUPS.filter(
      (group) => group.key !== "length"
    )
      .map((group) => ({
        defaultCollapsed: group.key === "style",
        key: group.key,
        label: group.label,
        tags: group.tags.filter((tag) => categoryTags.includes(tag)),
      }))
      .filter((group) => group.tags.length > 0);
    const otherTags = categoryTags.filter(
      (tag) => hairGroupOf(tag) === "other"
    );
    if (otherTags.length > 0) {
      groups.push({ key: "other", label: "其他", tags: otherTags });
    }
    return groups;
  }, [categoryTags, isHair]);

  const countGroups = useMemo<FacetGroup[]>(() => {
    if (!isHair) {
      return filterGroups;
    }
    return [
      {
        key: "length",
        label: "长度",
        tags: HAIR_LENGTHS.map(({ tag }) => tag),
      },
      ...filterGroups,
    ];
  }, [filterGroups, isHair]);

  const facetCounts = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    for (const group of countGroups) {
      const outsideGroup = tags.filter((tag) => groupOf(tag) !== group.key);
      const groupItems = baseMatched.filter((item) =>
        matchesTagGroups(item.tags, outsideGroup, groupOf)
      );
      const counts: Record<string, number> = {};
      for (const tag of group.tags) {
        counts[tag] = 0;
      }
      for (const item of groupItems) {
        for (const tag of item.tags) {
          if (tag in counts) {
            counts[tag] += 1;
          }
        }
      }
      result[group.key] = counts;
    }
    return result;
  }, [baseMatched, countGroups, groupOf, tags]);

  const groupedSections = useMemo(() => {
    if (!isHair || view === "flat") {
      return [];
    }
    const byBucket = new Map<string, ItemView[]>(
      HAIR_BUCKETS.map((bucket) => [bucket.key, []])
    );
    for (const item of visible) {
      byBucket.get(hairBucketOf(item.tags))?.push(item);
    }
    return HAIR_BUCKETS.map((bucket) => ({
      ...bucket,
      items: byBucket.get(bucket.key) ?? [],
    })).filter((bucket) => bucket.items.length > 0);
  }, [isHair, view, visible]);

  const displayItems = useMemo(
    () =>
      groupedSections.length > 0
        ? groupedSections.flatMap((section) => section.items)
        : visible,
    [groupedSections, visible]
  );

  const hasFilters = gender !== "all" || tags.length > 0 || query !== "";
  const activeCount =
    tags.length + (gender === "all" ? 0 : 1) + (query ? 1 : 0);

  const handleGender = useCallback(
    (value: GenderFilter) => update((prev) => ({ ...prev, gender: value })),
    [update]
  );
  const handleGenderSegment = useCallback(
    (next: unknown[]) => {
      const [first] = next;
      if (typeof first === "string" && isGenderFilter(first)) {
        handleGender(first);
      }
    },
    [handleGender]
  );
  const handleTag = useCallback(
    (value: string, checked: boolean) =>
      update((prev) => ({
        ...prev,
        tags: checked
          ? [...new Set([...prev.tags, value])]
          : prev.tags.filter((tag) => tag !== value),
      })),
    [update]
  );
  const handleQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      update((prev) => ({ ...prev, query: value }));
    },
    [update]
  );
  const clearQuery = useCallback(
    () => update((prev) => ({ ...prev, query: "" })),
    [update]
  );
  const handleQueryKey = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        clearQuery();
      }
    },
    [clearQuery]
  );
  const clearGender = useCallback(
    () => update((prev) => ({ ...prev, gender: "all" })),
    [update]
  );
  const clearAll = useCallback(
    () => update((prev) => ({ ...DEFAULT_FILTERS, view: prev.view })),
    [update]
  );
  const handleView = useCallback(
    (next: unknown[]) => {
      const [first] = next;
      if (first === "flat" || first === "grouped") {
        update((prev) => ({ ...prev, view: first }));
      }
    },
    [update]
  );

  const activeConditions = useMemo(
    () => [
      ...(gender === "all"
        ? []
        : [
            {
              key: "gender",
              label: `性别：${GENDER_LABELS[gender]}`,
              remove: clearGender,
            },
          ]),
      ...tags.map((value) => ({
        key: `tag-${value}`,
        label: value,
        remove: () => handleTag(value, false),
      })),
      ...(query
        ? [{ key: "query", label: `搜索：“${query}”`, remove: clearQuery }]
        : []),
    ],
    [clearGender, clearQuery, gender, handleTag, query, tags]
  );

  const modalItemId = useRouterState({
    select: (state) => {
      const modalMatch = state.matches.find((match) =>
        match.routeId.includes("catalog-modal")
      );
      const params = modalMatch?.params as
        | { category?: string; id?: string }
        | undefined;
      if (params?.category === category && params.id) {
        return Number(params.id);
      }
      if (!MODAL_PATH_PATTERN.test(state.location.pathname)) {
        return;
      }
      const parts = state.location.pathname.split("/");
      return parts[2] === category ? Number(parts[3]) : undefined;
    },
  });

  useEffect(() => {
    if (modalItemId === undefined) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      const { target } = event;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      const index = displayItems.findIndex((item) => item.id === modalItemId);
      const next = displayItems[index + (event.key === "ArrowRight" ? 1 : -1)];
      if (!next) {
        return;
      }
      event.preventDefault();
      navigate({
        ...itemLinkOptions(next, search),
        replace: true,
      });
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [displayItems, modalItemId, navigate, search]);

  const panelProps = {
    category,
    facetCounts,
    filters,
    groups: filterGroups,
    onTag: handleTag,
  };
  const lengthCounts = facetCounts.length;
  const searchPlaceholder = isHair
    ? "搜索发型名、标签或提示词"
    : "搜索名称、标签或提示词";

  return (
    <>
      <SiteHeader wide />
      <div className="bg-background/85 sticky top-14 z-20 border-b backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 md:flex-nowrap md:gap-4 md:px-6">
          <div className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              {BROWSER_TITLES[category]}
            </h1>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              共{" "}
              <span className="text-foreground tabular-nums">
                {categoryLive.length}
              </span>{" "}
              款
            </span>
          </div>

          <div className="relative order-3 min-w-0 flex-1 basis-full md:order-0 md:max-w-md md:basis-auto">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              aria-label="搜索素材"
              className="h-10 pr-10 pl-9"
              onChange={handleQuery}
              onKeyDown={handleQueryKey}
              placeholder={searchPlaceholder}
              type="search"
              value={query}
            />
            {query ? (
              <Button
                aria-label="清空搜索"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={clearQuery}
                size="icon"
                variant="ghost"
              >
                <XIcon />
              </Button>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isHair ? (
              <ToggleGroup
                aria-label="性别"
                onValueChange={handleGenderSegment}
                spacing={0}
                value={[gender]}
                variant="outline"
              >
                <ToggleGroupItem value="all">全部</ToggleGroupItem>
                <ToggleGroupItem value="female">女</ToggleGroupItem>
                <ToggleGroupItem value="male">男</ToggleGroupItem>
              </ToggleGroup>
            ) : null}

            <Sheet>
              <SheetTrigger
                render={
                  <Button className="md:hidden" size="lg" variant="outline" />
                }
              >
                <SlidersHorizontalIcon />
                筛选
                {activeCount > 0 ? (
                  <Badge className="tabular-nums">{activeCount}</Badge>
                ) : null}
              </SheetTrigger>
              <SheetContent className="w-80" side="left">
                <SheetHeader>
                  <SheetTitle>筛选</SheetTitle>
                  <SheetDescription>
                    {CATEGORY_LABELS[category]} · 显示 {visible.length} 款
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="min-h-0 flex-1 px-4">
                  <FilterPanel idPrefix="sheet" {...panelProps} />
                </ScrollArea>
                <SheetFooter>
                  <Button
                    disabled={!hasFilters}
                    onClick={clearAll}
                    variant="outline"
                  >
                    清除筛选
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isHair ? (
          <div className="flex scrollbar-none gap-1.5 overflow-x-auto px-4 pb-2.5 md:px-6 [&::-webkit-scrollbar]:hidden">
            {HAIR_LENGTHS.map(({ height, label, tag }) => (
              <LengthButton
                count={lengthCounts[tag] ?? 0}
                height={height}
                key={tag}
                label={label}
                onTag={handleTag}
                selected={tags.includes(tag)}
                tag={tag}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside
          aria-label="筛选"
          className={cn(
            "bg-sidebar text-sidebar-foreground sticky hidden border-r md:block",
            isHair
              ? "top-51 h-[calc(100svh-12.75rem)]"
              : "top-29.25 h-[calc(100svh-7.3125rem)]"
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-3 pb-8">
              <FilterPanel idPrefix="side" {...panelProps} />
            </div>
          </ScrollArea>
        </aside>

        <main className="grid content-start gap-4 px-4 py-4 md:px-6 md:py-5">
          <div className="flex min-h-8 flex-wrap items-center gap-2">
            <p aria-live="polite" className="text-muted-foreground text-sm">
              显示{" "}
              <span className="text-foreground font-medium tabular-nums">
                {visible.length}
              </span>{" "}
              款
            </p>
            {activeConditions.map((condition) => (
              <ActiveFilter
                key={condition.key}
                label={condition.label}
                onRemove={condition.remove}
              />
            ))}
            {hasFilters ? (
              <Button
                className="text-muted-foreground h-7 px-1 text-xs underline underline-offset-4"
                onClick={clearAll}
                size="sm"
                variant="link"
              >
                清除全部
              </Button>
            ) : null}
            {isHair ? (
              <ToggleGroup
                aria-label="结果视图"
                className="ml-auto"
                onValueChange={handleView}
                spacing={0}
                value={[view]}
                variant="outline"
              >
                {(["grouped", "flat"] as const).map((value) => (
                  <ToggleGroupItem
                    className="text-xs"
                    key={value}
                    value={value}
                  >
                    {VIEW_LABELS[value]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : null}
          </div>

          <ResultsContent
            activeConditions={activeConditions}
            clearAll={clearAll}
            groupedSections={groupedSections}
            hasFilters={hasFilters}
            search={search}
            visible={visible}
          />
        </main>
      </div>
    </>
  );
}

export function CatalogBrowserFallback() {
  return (
    <div aria-busy="true">
      <SiteHeader wide />
      <div className="border-b">
        <div className="flex h-15 items-center gap-4 px-4 md:px-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 flex-1 md:max-w-md" />
          <Skeleton className="ml-auto h-9 w-36" />
        </div>
        <div className="flex gap-2 overflow-hidden px-4 pb-3 md:px-6">
          {Array.from({ length: 9 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 骨架屏没有业务 id
            <Skeleton className="h-16 w-16 flex-none rounded-xl" key={index} />
          ))}
        </div>
      </div>
      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden gap-2 border-r p-3 md:grid md:content-start">
          {Array.from({ length: 5 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 骨架屏没有业务 id
            <Skeleton className="h-24 rounded-lg" key={index} />
          ))}
        </div>
        <div className="grid content-start gap-4 px-4 py-5 md:px-6">
          <Skeleton className="h-8 w-64" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 骨架屏没有业务 id
              <li className="overflow-hidden rounded-2xl" key={index}>
                <Skeleton className="aspect-4/5 rounded-none" />
                <Skeleton className="h-16 rounded-none" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
