import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  CatalogBrowser,
  CatalogBrowserFallback,
} from "@/components/catalog/catalog-browser";
import { loadCatalog } from "@/lib/catalog/catalog.functions";
import { validateCatalogSearch } from "@/lib/catalog/search";
import type { BrowseCategory } from "@/lib/catalog/view";

// 列表页和弹窗路由共用本布局，类别由路径决定（弹窗路由的真实路径带 catalog-modal 前缀）
const POSE_PATH = /^\/(?:catalog-modal\/)?pose(?:\/|$)/u;

export const Route = createFileRoute("/_catalog")({
  component: CatalogLayout,
  loader: () => loadCatalog(),
  pendingComponent: CatalogBrowserFallback,
  staleTime: Number.POSITIVE_INFINITY,
  validateSearch: validateCatalogSearch,
});

function CatalogLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const category: BrowseCategory = POSE_PATH.test(pathname) ? "pose" : "hair";
  return (
    <>
      <CatalogBrowser category={category} items={Route.useLoaderData()} />
      <Outlet />
    </>
  );
}
