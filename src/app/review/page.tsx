import { AppLayout } from "@/components/layout/AppLayout";
import { ReviewPanel } from "@/components/reviews/ReviewPanel";
import {
  getConsideringItems,
  runAiDiagnosis,
} from "@/actions/reviews";

export default async function ReviewPage() {
  const items = await getConsideringItems();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Review</h1>
          <p className="mt-1 text-slate-500">
            所有物との相性・重複・満足度をAIが診断
          </p>
        </div>
        <ReviewPanel items={items} onRunDiagnosis={runAiDiagnosis} />
      </div>
    </AppLayout>
  );
}
