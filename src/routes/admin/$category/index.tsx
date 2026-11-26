import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ItemImage } from "@/components/catalog/item-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { GENDER_LABELS } from "@/lib/catalog/view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/$category/")({
  component: AdminCatalogList,
  loader: () => loadAdminItems(),
  validateSearch: validateAdminSearch,
});

const GENDER_ITEMS = { all: "全部性别", ...GENDER_LABELS };

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
  return (
    <Button onClick={handleClick} size="sm" variant="ghost">
      {item.deprecated ? "恢复" : "下架"}
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

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="w-56"
          onChange={handleQuery}
          placeholder="搜索名称、提示词、标签"
          value={search.q ?? ""}
        />
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
        <span className="text-muted-foreground text-sm">
          共 {visible.length} 条
        </span>
        <Link
          className={cn(buttonVariants({ size: "sm" }), "ml-auto")}
          params={{ category }}
          to="/admin/$category/new"
        >
          新增素材
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">图片</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>性别</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((item) => (
            <TableRow key={`${item.category}-${item.id}`}>
              <TableCell>
                <div className="bg-muted relative size-12 overflow-hidden rounded-lg">
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
                <div className="text-muted-foreground text-xs">#{item.id}</div>
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
                <Badge variant={item.deprecated ? "outline" : "default"}>
                  {item.deprecated ? "已下架" : "上架中"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ToggleButton item={item} onToggle={toggle} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visible.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          没有符合条件的素材
        </p>
      )}
    </div>
  );
}
