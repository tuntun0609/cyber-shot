import { createFileRoute, redirect } from "@tanstack/react-router";
import { ItemDetail } from "@/components/catalog/item-detail";
import { Modal } from "@/components/catalog/modal";
import { loadCatalogItem } from "@/lib/catalog/catalog.functions";

export const Route = createFileRoute("/_catalog/catalog-modal/$category/$id")({
  beforeLoad: ({ location, params }) => {
    if (!location.maskedLocation) {
      throw redirect({ params, to: "/$category/$id" });
    }
  },
  component: ItemModal,
  loader: ({ params }) => loadCatalogItem({ data: params }),
  staleTime: Number.POSITIVE_INFINITY,
});

function ItemModal() {
  const item = Route.useLoaderData();
  return (
    <Modal title={item.name}>
      <ItemDetail item={item} />
    </Modal>
  );
}
