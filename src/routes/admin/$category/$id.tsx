import { createFileRoute, notFound } from "@tanstack/react-router";
import { ItemForm } from "@/components/admin/item-form";
import { loadAdminItem, loadAdminItems } from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/admin/$category/$id")({
  component: EditItemPage,
  loader: async ({ params }) => {
    const id = Number(params.id);
    const [item, items] = await Promise.all([
      loadAdminItem({ data: id }),
      loadAdminItems(),
    ]);
    if (item.category !== params.category) {
      throw notFound();
    }
    return {
      item,
      tagSuggestions: [...new Set(items.flatMap((entry) => entry.tags))],
    };
  },
});

function EditItemPage() {
  const { item, tagSuggestions } = Route.useLoaderData();
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">编辑素材 #{item.id}</h1>
      <ItemForm
        category={item.category}
        initial={item}
        key={`${item.id}-${item.name}`}
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
