import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getDiagnosis } from "@/actions/reviews";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VERDICT_LABELS } from "@/lib/constants";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HistoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params;
  const diagnosis = await getDiagnosis(id);

  if (!diagnosis) {
    notFound();
  }

  const verdict = VERDICT_LABELS[diagnosis.verdict];
  const date = new Date(diagnosis.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          履歴に戻る
        </Link>

        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {diagnosis.considering_item_name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{date}</p>
            </div>
            <Badge
              className={`${verdict.bg} ${verdict.color} text-sm px-4 py-1.5`}
            >
              {verdict.label}
            </Badge>
          </div>

          <p className="text-slate-700 leading-relaxed">{diagnosis.summary}</p>

          <div className="flex flex-wrap justify-center gap-8 py-4">
            <ScoreRing
              score={diagnosis.compatibility_score}
              label="相性スコア"
            />
            <ScoreRing
              score={diagnosis.duplication_score}
              label="重複度"
              invert
            />
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < diagnosis.satisfaction_prediction
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-500">
                満足度予測
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AnalysisBlock
              title="相性分析"
              content={diagnosis.compatibility_analysis}
            />
            <AnalysisBlock
              title="重複分析"
              content={diagnosis.duplication_analysis}
            />
            <AnalysisBlock
              title="満足度予測"
              content={diagnosis.satisfaction_analysis}
            />
          </div>

          <div className="rounded-xl bg-indigo-50 p-5">
            <h3 className="font-semibold text-indigo-900 mb-2">
              購入アドバイス
            </h3>
            <p className="text-sm text-indigo-800 leading-relaxed">
              {diagnosis.recommendation}
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function AnalysisBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
    </div>
  );
}
