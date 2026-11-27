import { createFileRoute } from "@tanstack/react-router";
import { ItemForm } from "@/components/admin/item-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { loadAdminItems } from "@/lib/admin/admin.functions";
import { CATEGORY_LABELS } from "@/lib/catalog/view";

export const Route = createFileRoute("/admin/$category/new")({
  component: NewItemPage,
  loader: () => loadAdminItems(),
});

function NewItemPage() {
  const items = Route.useLoaderData();
  const { category } = Route.useRouteContext();
  const tagSuggestions = [...new Set(items.flatMap((item) => item.tags))];
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        backTo={{
          category,
          label: `返回${CATEGORY_LABELS[category]}列表`,
        }}
        description={`类别：${CATEGORY_LABELS[category]}`}
        title="新增素材"
      />
      <ItemForm category={category} tagSuggestions={tagSuggestions} />
    </div>
  );
}
