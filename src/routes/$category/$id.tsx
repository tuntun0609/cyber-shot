import { createFileRoute, Link } from "@tanstack/react-router";
import { ItemDetail } from "@/components/catalog/item-detail";
import { SiteHeader } from "@/components/site/site-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { loadCatalogItem } from "@/lib/catalog/catalog.functions";
import { CATEGORY_LABELS } from "@/lib/catalog/view";

function loadDetail({ params }: { params: { category: string; id: string } }) {
  return loadCatalogItem({ data: params });
}

export const Route = createFileRoute("/$category/$id")({
  component: ItemPage,
  head: ({ loaderData: item }) => ({
    meta: item
      ? [
          {
            title: `${item.name} · ${CATEGORY_LABELS[item.category]} · cyber-shot`,
          },
          { content: item.promptZh, name: "description" },
        ]
      : [],
  }),
  loader: loadDetail,
  staleTime: Number.POSITIVE_INFINITY,
});

function ItemPage() {
  const item = Route.useLoaderData();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/" />}>首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link to={item.category === "pose" ? "/pose" : "/hair"} />
                }
              >
                {CATEGORY_LABELS[item.category]}库
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{item.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ItemDetail item={item} />
      </main>
    </>
  );
}
