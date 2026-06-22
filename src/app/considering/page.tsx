import { AppLayout } from "@/components/layout/AppLayout";
import { ConsideringItemsManager } from "@/components/items/ConsideringItemsManager";
import { getConsideringItems } from "@/actions/reviews";

export default async function ConsideringPage() {
  const items = await getConsideringItems();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Considering Items
          </h1>
          <p className="mt-1 text-slate-500">
            購入を検討している商品を管理
          </p>
        </div>
        <ConsideringItemsManager initialItems={items} />
      </div>
    </AppLayout>
  );
}
