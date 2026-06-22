import type { Diagnosis } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VERDICT_LABELS } from "@/lib/constants";
import Link from "next/link";

interface HistoryCardProps {
  diagnosis: Diagnosis;
}

export function HistoryCard({ diagnosis }: HistoryCardProps) {
  const verdict = VERDICT_LABELS[diagnosis.verdict];
  const date = new Date(diagnosis.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/history/${diagnosis.id}`}>
      <Card
        padding="sm"
        className="hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {diagnosis.considering_item_name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{date}</p>
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {diagnosis.summary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge className={`${verdict.bg} ${verdict.color}`}>
              {verdict.label}
            </Badge>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>相性 {diagnosis.compatibility_score}</span>
              <span>重複 {diagnosis.duplication_score}</span>
              <span>満足度 {diagnosis.satisfaction_prediction}/5</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
