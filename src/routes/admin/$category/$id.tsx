import { createFileRoute, notFound } from "@tanstack/react-router";
import { ItemForm } from "@/components/admin/item-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { loadAdminItem, loadAdminItems } from "@/lib/admin/admin.functions";
import { CATEGORY_LABELS } from "@/lib/catalog/view";

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
    <div className="grid gap-6">
      <AdminPageHeader
        backTo={{
          category: item.category,
          label: `返回${CATEGORY_LABELS[item.category]}列表`,
        }}
        description={
          <>
            <span className="tabular-nums">#{item.id}</span> · {item.name}
          </>
        }
        title="编辑素材"
      />
      <ItemForm
        category={item.category}
        initial={item}
        key={`${item.id}-${item.name}`}
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
