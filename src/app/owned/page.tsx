import { AppLayout } from "@/components/layout/AppLayout";
import { OwnedItemsManager } from "@/components/items/OwnedItemsManager";
import { getOwnedItems } from "@/actions/items";

export default async function OwnedPage() {
  const items = await getOwnedItems();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owned Items</h1>
          <p className="mt-1 text-slate-500">
            所有しているアイテムを管理
          </p>
        </div>
        <OwnedItemsManager initialItems={items} />
      </div>
    </AppLayout>
  );
}
