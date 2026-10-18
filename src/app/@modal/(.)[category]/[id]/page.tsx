import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/catalog/item-detail";
import { Modal } from "@/components/catalog/modal";
import { getItem, getItems, toView } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/catalog/schema";
import { isCategory } from "@/lib/catalog/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    getItems(category).map((item) => ({ category, id: item.id }))
  );
}

export default async function ItemModal({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const item = isCategory(category) ? getItem(category, id) : undefined;
  if (!item) {
    notFound();
  }

  return (
    <Modal title={item.name}>
      <ItemDetail item={toView(item)} />
    </Modal>
  );
}
