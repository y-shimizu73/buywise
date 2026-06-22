import { AppLayout } from "@/components/layout/AppLayout";
import { HistoryCard } from "@/components/reviews/HistoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDiagnoses } from "@/actions/reviews";
import { History } from "lucide-react";

export default async function HistoryPage() {
  const diagnoses = await getDiagnoses();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History</h1>
          <p className="mt-1 text-slate-500">AI診断の履歴</p>
        </div>

        {diagnoses.length === 0 ? (
          <EmptyState
            icon={<History className="h-8 w-8 text-slate-400" />}
            title="診断履歴がありません"
            description="AI Reviewページで診断を実行すると、ここに履歴が表示されます"
          />
        ) : (
          <div className="space-y-3">
            {diagnoses.map((d) => (
              <HistoryCard key={d.id} diagnosis={d} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
