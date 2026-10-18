import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getItem, getItems, toView } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/catalog/schema";
import { CATEGORY_LABELS, isCategory } from "@/lib/catalog/view";

interface Params {
  category: string;
  id: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CATEGORIES.flatMap((category) =>
    getItems(category).map((item) => ({ category, id: item.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, id } = await params;
  const item = isCategory(category) ? getItem(category, id) : undefined;
  if (!item) {
    return {};
  }
  return {
    description: item.promptZh,
    title: `${item.name} · ${CATEGORY_LABELS[item.category]} · cyber-shot`,
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, id } = await params;
  const item = isCategory(category) ? getItem(category, id) : undefined;
  if (!item) {
    notFound();
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link className="flex shrink-0 items-center gap-2" href="/">
            <span className="grid size-7 place-items-center rounded-lg bg-foreground font-mono font-semibold text-background text-xs">
              cs
            </span>
            <span className="hidden font-mono font-semibold tracking-tight sm:inline">
              cyber-shot
            </span>
          </Link>
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink render={<Link href="/" />}>
                  素材库
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={`/?c=${item.category}`} />}>
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
        <ItemDetail item={toView(item)} />
      </main>
    </>
  );
}
