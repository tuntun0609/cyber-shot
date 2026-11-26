import { createFileRoute } from "@tanstack/react-router";
import { ItemForm } from "@/components/admin/item-form";
import { loadAdminItems } from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/admin/$category/new")({
  component: NewItemPage,
  loader: () => loadAdminItems(),
});

function NewItemPage() {
  const items = Route.useLoaderData();
  const { category } = Route.useRouteContext();
  const tagSuggestions = [...new Set(items.flatMap((item) => item.tags))];
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">新增素材</h1>
      <ItemForm category={category} tagSuggestions={tagSuggestions} />
    </div>
  );
}
