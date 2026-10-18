import { Suspense } from "react";
import {
  CatalogBrowser,
  CatalogBrowserFallback,
} from "@/components/catalog/catalog-browser";
import { getAllViews } from "@/lib/catalog";

export default function Page() {
  return (
    // 筛选状态来自地址栏，需要 Suspense 才能静态预渲染
    <Suspense fallback={<CatalogBrowserFallback />}>
      <CatalogBrowser items={getAllViews()} />
    </Suspense>
  );
}
