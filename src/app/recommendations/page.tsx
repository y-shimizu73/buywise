import { AppLayout } from "@/components/layout/AppLayout";
import { RecommendationsPanel } from "@/components/recommendations/RecommendationsPanel";
import { getOwnedItems } from "@/actions/items";

export default async function RecommendationsPage() {
  const ownedItems = await getOwnedItems();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recommendations</h1>
          <p className="mt-1 text-slate-500">
            所有物から、次に検討すべきアイテムをAIが提案
          </p>
        </div>
        <RecommendationsPanel ownedCount={ownedItems.length} />
      </div>
    </AppLayout>
  );
}
