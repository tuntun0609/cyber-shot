import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Undo2Icon,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ItemImage } from "@/components/catalog/item-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadAdminItems, setDeprecated } from "@/lib/admin/admin.functions";
import type { AdminSearch, StatusFilter } from "@/lib/admin/search";
import {
  isStatusFilter,
  STATUS_LABELS,
  validateAdminSearch,
} from "@/lib/admin/search";
import type { Category, ItemView } from "@/lib/catalog/view";
import { CATEGORY_LABELS, GENDER_LABELS } from "@/lib/catalog/view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/$category/")({
  component: AdminCatalogList,
  loader: () => loadAdminItems(),
  validateSearch: validateAdminSearch,
});

const GENDER_ITEMS = { all: "全部性别", ...GENDER_LABELS };
const ACTION_BUTTON_CLASS = "w-7 px-0 xl:w-auto xl:min-w-20 xl:px-3";
const ACTION_LABEL_CLASS = "hidden xl:inline";
const ACTION_COLUMN_CLASS =
  "sticky right-0 z-10 w-24 bg-card shadow-[inset_1px_0_0_var(--border)] transition-colors group-hover/row:bg-muted/50 xl:w-48";

function matches(
  item: ItemView,
  category: Category,
  search: AdminSearch,
  status: StatusFilter
) {
  const query = (search.q ?? "").trim().toLowerCase();
  if (item.category !== category) {
    return false;
  }
  if (search.g && search.g !== "all" && item.gender !== search.g) {
    return false;
  }
  if (status === "live" && item.deprecated) {
    return false;
  }
  if (status === "off" && !item.deprecated) {
    return false;
  }
  if (!query) {
    return true;
  }
  return [item.name, item.promptZh, item.promptEn, ...item.tags].some((text) =>
    text.toLowerCase().includes(query)
  );
}

function ToggleButton({
  item,
  onToggle,
}: {
  item: ItemView;
  onToggle: (item: ItemView) => void;
}) {
  const handleClick = useCallback(() => onToggle(item), [item, onToggle]);
  const Icon = item.deprecated ? Undo2Icon : EyeOffIcon;
  const label = item.deprecated ? "恢复" : "下架";
  return (
    <Button
      aria-label={label}
      className={cn(ACTION_BUTTON_CLASS, "text-foreground")}
      onClick={handleClick}
      size="sm"
      title={label}
      variant="outline"
    >
      <Icon />
      <span className={ACTION_LABEL_CLASS}>{label}</span>
    </Button>
  );
}

function AdminCatalogList() {
  const items = Route.useLoaderData();
  const search = Route.useSearch();
  const { category } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const status: StatusFilter = isStatusFilter(search.s) ? search.s : "all";
  const visible = useMemo(
    () => items.filter((item) => matches(item, category, search, status)),
    [items, category, search, status]
  );

  const update = useCallback(
    (patch: AdminSearch) =>
      navigate({ replace: true, search: (prev) => ({ ...prev, ...patch }) }),
    [navigate]
  );
  const handleQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      update({ q: event.target.value || undefined }),
    [update]
  );
  const handleGender = useCallback(
    (value: string | null) =>
      update({ g: value === "all" ? undefined : (value ?? undefined) }),
    [update]
  );
  const handleStatus = useCallback(
    (value: string | null) =>
      update({ s: value === "all" ? undefined : (value ?? undefined) }),
    [update]
  );

  const toggle = useCallback(
    async (item: ItemView) => {
      try {
        await setDeprecated({
          data: { deprecated: !item.deprecated, id: item.id },
        });
        toast.success(item.deprecated ? "已恢复上架" : "已下架");
        await router.invalidate();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "操作失败");
      }
    },
    [router]
  );

  const total = items.filter((item) => item.category === category).length;
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={
          <Link
            className={cn(buttonVariants())}
            params={{ category }}
            to="/admin/$category/new"
          >
            <PlusIcon />
            新增素材
          </Link>
        }
        description={
          <>
            共 <span className="tabular-nums">{visible.length}</span> 条
            {visible.length === total ? null : (
              <>
                （全部 <span className="tabular-nums">{total}</span> 条）
              </>
            )}
          </>
        }
        title={`${CATEGORY_LABELS[category]}素材`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            className="pl-8"
            onChange={handleQuery}
            placeholder="搜索名称、提示词、标签"
            type="search"
            value={search.q ?? ""}
          />
        </div>
        <Select
          items={GENDER_ITEMS}
          onValueChange={handleGender}
          value={search.g ?? "all"}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GENDER_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={STATUS_LABELS}
          onValueChange={handleStatus}
          value={status}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="gap-0 py-0">
        <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground w-16 text-xs">
                图片
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                名称
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                性别
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                标签
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                状态
              </TableHead>
              <TableHead
                className={cn(
                  ACTION_COLUMN_CLASS,
                  "text-muted-foreground text-right text-xs"
                )}
              >
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((item) => (
              <TableRow
                className={cn(
                  "group/row",
                  item.deprecated && "text-muted-foreground"
                )}
                key={`${item.category}-${item.id}`}
              >
                <TableCell>
                  <div
                    className={cn(
                      "bg-muted ring-foreground/8 dark:ring-foreground/10 relative size-12 overflow-hidden rounded-2xl ring-1",
                      item.deprecated && "opacity-60"
                    )}
                  >
                    <ItemImage
                      alt={item.name}
                      aspectRatio={1}
                      sizes="48px"
                      src={item.thumbSrc}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    className="font-medium hover:underline"
                    params={{ category, id: String(item.id) }}
                    to="/admin/$category/$id"
                  >
                    {item.name}
                  </Link>
                  <div className="text-muted-foreground text-xs tabular-nums">
                    #{item.id}
                  </div>
                </TableCell>
                <TableCell>{GENDER_LABELS[item.gender]}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(item.deprecated && "text-muted-foreground")}
                    variant={item.deprecated ? "outline" : "secondary"}
                  >
                    {item.deprecated ? "已下架" : "上架中"}
                  </Badge>
                </TableCell>
                <TableCell className={ACTION_COLUMN_CLASS}>
                  <div className="flex justify-end gap-1.5">
                    <Link
                      aria-label="编辑"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "secondary" }),
                        ACTION_BUTTON_CLASS
                      )}
                      params={{ category, id: String(item.id) }}
                      title="编辑"
                      to="/admin/$category/$id"
                    >
                      <PencilIcon />
                      <span className={ACTION_LABEL_CLASS}>编辑</span>
                    </Link>
                    <ToggleButton item={item} onToggle={toggle} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="text-muted-foreground h-32 text-center"
                  colSpan={6}
                >
                  没有符合条件的素材
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
