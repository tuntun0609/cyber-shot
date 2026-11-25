import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  CatalogBrowser,
  CatalogBrowserFallback,
} from "@/components/catalog/catalog-browser";
import { loadCatalog } from "@/lib/catalog/catalog.functions";
import { validateCatalogSearch } from "@/lib/catalog/search";

export const Route = createFileRoute("/_catalog")({
  component: CatalogLayout,
  loader: () => loadCatalog(),
  pendingComponent: CatalogBrowserFallback,
  staleTime: Number.POSITIVE_INFINITY,
  validateSearch: validateCatalogSearch,
});

function CatalogLayout() {
  return (
    <>
      <CatalogBrowser items={Route.useLoaderData()} />
      <Outlet />
    </>
  );
}
