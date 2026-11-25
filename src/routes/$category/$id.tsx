import { createFileRoute, Link } from "@tanstack/react-router";
import { ItemDetail } from "@/components/catalog/item-detail";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
      <header className="bg-background/85 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link className="flex shrink-0 items-center gap-2" to="/">
            <span className="bg-foreground text-background grid size-7 place-items-center rounded-lg font-mono text-xs font-semibold">
              cs
            </span>
            <span className="hidden font-mono font-semibold tracking-tight sm:inline">
              cyber-shot
            </span>
          </Link>
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink render={<Link to="/" />}>素材库</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={<Link search={{ c: item.category }} to="/" />}
                >
                  {CATEGORY_LABELS[item.category]}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {item.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <ItemDetail item={item} />
      </main>
    </>
  );
}
