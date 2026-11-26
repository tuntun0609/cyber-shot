import {
  Link,
  linkOptions,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import {
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useMemo } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import type {
  CatalogSearch,
  Filters,
  GenderFilter,
} from "@/lib/catalog/search";
import {
  DEFAULT_FILTERS,
  GENDER_FILTERS,
  isGenderFilter,
  readFilters,
  writeFilters,
} from "@/lib/catalog/search";
import type { BrowseCategory, ItemView } from "@/lib/catalog/view";
import { CATEGORY_LABELS, GENDER_LABELS } from "@/lib/catalog/view";
import { CopyButton } from "./copy-button";
import { ItemImage } from "./item-image";

const GENDER_FILTER_LABELS: Record<GenderFilter, string> = {
  all: "全部",
  female: "女（含不限）",
  male: "男（含不限）",
};

const CATEGORY_PATHS = {
  hair: "/hair",
  pose: "/pose",
} as const satisfies Record<BrowseCategory, string>;

function matchesGender(item: ItemView, gender: GenderFilter) {
  return gender === "all" || item.gender === "any" || item.gender === gender;
}

function matchesQuery(item: ItemView, query: string) {
  if (!query) {
    return true;
  }
  const needle = query.toLowerCase();
  return [item.id, item.name, item.promptZh, item.promptEn, ...item.tags].some(
    (field) => field.toLowerCase().includes(needle)
  );
}

interface FilterPanelProps {
  category: BrowseCategory;
  categoryTags: string[];
  filters: Filters;
  idPrefix: string;
  onGender: (value: GenderFilter) => void;
  onTag: (value: string, checked: boolean) => void;
  tagCounts: Record<string, number>;
}

function TagOption({
  checked,
  count,
  id,
  onTag,
  value,
}: {
  checked: boolean;
  count: number;
  id: string;
  onTag: (value: string, checked: boolean) => void;
  value: string;
}) {
  const handleChange = useCallback(
    (next: boolean) => onTag(value, next),
    [onTag, value]
  );
  return (
    <div className="can-hover:hover:bg-muted flex min-h-9 items-center gap-3 rounded-lg px-2">
      <Checkbox checked={checked} id={id} onCheckedChange={handleChange} />
      <Label className="flex-1 cursor-pointer py-2 font-normal" htmlFor={id}>
        {value}
      </Label>
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {count}
      </span>
    </div>
  );
}

// 侧栏和移动端抽屉共用同一套筛选
function FilterPanel({
  category,
  categoryTags,
  filters,
  idPrefix,
  onGender,
  onTag,
  tagCounts,
}: FilterPanelProps) {
  const handleGender = useCallback(
    (value: unknown) => {
      if (typeof value === "string" && isGenderFilter(value)) {
        onGender(value);
      }
    },
    [onGender]
  );

  return (
    <div className="grid gap-6">
      {category === "hair" ? (
        <section aria-labelledby={`${idPrefix}-gender`} className="grid gap-2">
          <h2
            className="text-muted-foreground px-2 text-xs font-medium tracking-wide"
            id={`${idPrefix}-gender`}
          >
            性别
          </h2>
          <RadioGroup
            aria-labelledby={`${idPrefix}-gender`}
            className="gap-0"
            onValueChange={handleGender}
            value={filters.gender}
          >
            {GENDER_FILTERS.map((value) => (
              <div
                className="can-hover:hover:bg-muted flex min-h-9 items-center gap-3 rounded-lg px-2"
                key={value}
              >
                <RadioGroupItem id={`${idPrefix}-g-${value}`} value={value} />
                <Label
                  className="flex-1 cursor-pointer py-2 font-normal"
                  htmlFor={`${idPrefix}-g-${value}`}
                >
                  {GENDER_FILTER_LABELS[value]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>
      ) : null}

      {categoryTags.length > 0 ? (
        <>
          {category === "hair" ? <Separator /> : null}
          <section aria-labelledby={`${idPrefix}-tags`} className="grid gap-2">
            <h2
              className="text-muted-foreground px-2 text-xs font-medium tracking-wide"
              id={`${idPrefix}-tags`}
            >
              标签
            </h2>
            <div className="grid">
              {categoryTags.map((value) => (
                <TagOption
                  checked={filters.tags.includes(value)}
                  count={tagCounts[value] ?? 0}
                  id={`${idPrefix}-t-${value}`}
                  key={value}
                  onTag={onTag}
                  value={value}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}
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
    <Badge className="h-8 gap-1 pr-1 pl-3 text-sm" variant="outline">
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

function TagFilter({
  onRemove,
  value,
}: {
  onRemove: (value: string, checked: boolean) => void;
  value: string;
}) {
  const handleRemove = useCallback(
    () => onRemove(value, false),
    [onRemove, value]
  );
  return <ActiveFilter label={value} onRemove={handleRemove} />;
}

function ItemCard({ item, search }: { item: ItemView; search: CatalogSearch }) {
  const params = { category: item.category, id: item.id };
  const detailLink = linkOptions({
    mask: { params, search: {}, to: "/$category/$id", unmaskOnReload: true },
    params,
    resetScroll: false,
    search,
    to: "/catalog-modal/$category/$id",
  });
  const previewAspectRatio =
    item.category === "pose" ? (item.thumbAspectRatio ?? 3 / 4) : 4 / 5;
  const thumbAspectRatio = item.thumbAspectRatio ?? previewAspectRatio;
  return (
    <li className="min-w-0">
      <Card className="group can-hover:hover:ring-foreground/20 relative h-full gap-0 py-0 transition-shadow duration-200">
        <Link
          className="bg-muted relative block shrink-0 overflow-hidden"
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
        <CopyButton
          className="can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:data-copied:opacity-100 absolute top-2 right-2 shadow-sm transition-opacity duration-200 focus-visible:opacity-100"
          label="复制"
          size="sm"
          text={item.promptZh}
          variant="secondary"
        />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <Link
            className="can-hover:hover:text-primary min-w-0 truncate text-sm font-medium transition-colors"
            {...detailLink}
          >
            {item.name}
          </Link>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline">{GENDER_LABELS[item.gender]}</Badge>
          </div>
          <span className="text-muted-foreground mt-auto font-mono text-xs">
            {item.id.toUpperCase()}
          </span>
        </div>
      </Card>
    </li>
  );
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
  const { gender, query, tags } = filters;

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

  const live = useMemo(() => items.filter((item) => !item.deprecated), [items]);
  const matched = useMemo(
    () =>
      live.filter(
        (item) => matchesGender(item, gender) && matchesQuery(item, query)
      ),
    [gender, live, query]
  );
  const categoryTags = useMemo(
    () => [
      ...new Set(
        live
          .filter((item) => item.category === category)
          .flatMap((item) => item.tags)
      ),
    ],
    [category, live]
  );
  const tagCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const item of matched) {
      if (item.category === category) {
        for (const tag of item.tags) {
          result[tag] = (result[tag] ?? 0) + 1;
        }
      }
    }
    return result;
  }, [category, matched]);
  const visible = matched.filter(
    (item) =>
      item.category === category && tags.every((tag) => item.tags.includes(tag))
  );
  const hasFilters = gender !== "all" || tags.length > 0 || query !== "";
  const activeCount = tags.length + (gender === "all" ? 0 : 1);

  const handleGender = useCallback(
    (value: GenderFilter) => update((prev) => ({ ...prev, gender: value })),
    [update]
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
    (event: KeyboardEvent<HTMLInputElement>) => {
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
  const clearAll = useCallback(() => update(() => DEFAULT_FILTERS), [update]);

  const panelProps = {
    category,
    categoryTags,
    filters,
    onGender: handleGender,
    onTag: handleTag,
    tagCounts,
  };

  return (
    <>
      <SiteHeader wide />
      <div className="bg-background/85 sticky top-14 z-20 border-b backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4 md:gap-4 md:px-6">
          <div className="relative min-w-0 flex-1 md:max-w-md">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              aria-label="搜索素材"
              className="h-10 pr-10 pl-9"
              onChange={handleQuery}
              onKeyDown={handleQueryKey}
              placeholder="搜索名称、标签或提示词"
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

          <div className="ml-auto flex items-center gap-1">
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
                    {CATEGORY_LABELS[category]} · {visible.length} 项
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
      </div>

      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside
          aria-label="筛选"
          className="bg-sidebar text-sidebar-foreground sticky top-28 hidden h-[calc(100svh-7rem)] border-r md:block"
        >
          <ScrollArea className="h-full">
            <div className="p-3 pb-8">
              <FilterPanel idPrefix="side" {...panelProps} />
            </div>
          </ScrollArea>
        </aside>

        <main className="grid content-start gap-4 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {CATEGORY_LABELS[category]}
            </h1>
            <p aria-live="polite" className="text-muted-foreground text-sm">
              共{" "}
              <span className="text-foreground font-mono tabular-nums">
                {visible.length}
              </span>{" "}
              项
            </p>
            {hasFilters ? (
              <Button
                className="ml-auto"
                onClick={clearAll}
                size="sm"
                variant="ghost"
              >
                清除筛选
              </Button>
            ) : null}
          </div>

          {hasFilters ? (
            <ul aria-label="已选条件" className="flex flex-wrap gap-2">
              {gender === "all" ? null : (
                <li>
                  <ActiveFilter
                    label={`性别：${GENDER_LABELS[gender]}`}
                    onRemove={clearGender}
                  />
                </li>
              )}
              {tags.map((value) => (
                <li key={value}>
                  <TagFilter onRemove={handleTag} value={value} />
                </li>
              ))}
              {query ? (
                <li>
                  <ActiveFilter
                    label={`搜索：${query}`}
                    onRemove={clearQuery}
                  />
                </li>
              ) : null}
            </ul>
          ) : null}

          {visible.length > 0 ? (
            <ul className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((item) => (
                <ItemCard item={item} key={item.id} search={search} />
              ))}
            </ul>
          ) : (
            <div className="grid place-items-center gap-3 rounded-2xl border border-dashed px-6 py-20 text-center">
              <SearchXIcon className="text-muted-foreground size-8" />
              <p className="font-medium">没有符合条件的素材</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                {hasFilters
                  ? "当前的搜索词、性别或标签组合太窄了，放宽条件试试。"
                  : "这个类别暂时还没有素材。"}
              </p>
              {hasFilters ? (
                <Button className="mt-2" onClick={clearAll} size="lg">
                  清除筛选
                </Button>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export function CatalogBrowserFallback() {
  return (
    <div aria-busy="true">
      <SiteHeader wide />
      <div className="flex h-14 items-center gap-4 border-b px-4 md:px-6">
        <Skeleton className="h-10 flex-1 md:max-w-md" />
      </div>
      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden gap-2 border-r p-3 md:grid md:content-start">
          {Array.from({ length: 4 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 骨架屏没有业务 id
            <Skeleton className="h-9 rounded-lg" key={index} />
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-3 md:px-6 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 骨架屏没有业务 id
            <li className="overflow-hidden rounded-2xl" key={index}>
              <Skeleton className="aspect-4/5 rounded-none" />
              <Skeleton className="h-28 rounded-none" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
