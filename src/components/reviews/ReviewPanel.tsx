"use client";

import { useState } from "react";
import type { ConsideringItem, Diagnosis } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VERDICT_LABELS, CATEGORY_MAP } from "@/lib/constants";
import { Sparkles, Star, ExternalLink } from "lucide-react";

interface ReviewPanelProps {
  items: ConsideringItem[];
  onRunDiagnosis: (itemId: string) => Promise<Diagnosis>;
}

export function ReviewPanel({ items, onRunDiagnosis }: ReviewPanelProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const diagnosis = await onRunDiagnosis(selectedId);
      setResult(diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "診断に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          診断する商品を選択
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            検討中アイテムがありません。先に商品を追加してください。
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setResult(null);
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selectedId === item.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">
                    {CATEGORY_MAP[item.category].icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {CATEGORY_MAP[item.category].label}
                    </p>
                    {item.product_url && (
                      <a
                        href={item.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        商品リンク
                      </a>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleDiagnose}
              loading={loading}
              disabled={!selectedId}
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              AI診断を実行
            </Button>
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
            {error}
          </p>
        )}
      </Card>

      {result && <DiagnosisResultCard diagnosis={result} />}
    </div>
  );
}

function DiagnosisResultCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const verdict = VERDICT_LABELS[diagnosis.verdict];

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {diagnosis.considering_item_name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">AI診断結果</p>
        </div>
        <Badge className={`${verdict.bg} ${verdict.color} text-sm px-4 py-1.5`}>
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
          color="indigo"
        />
        <AnalysisBlock
          title="重複分析"
          content={diagnosis.duplication_analysis}
          color="amber"
        />
        <AnalysisBlock
          title="満足度予測"
          content={diagnosis.satisfaction_analysis}
          color="emerald"
        />
      </div>

      <div className="rounded-xl bg-indigo-50 p-5">
        <h3 className="font-semibold text-indigo-900 mb-2">購入アドバイス</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          {diagnosis.recommendation}
        </p>
      </div>
    </Card>
  );
}

function AnalysisBlock({
  title,
  content,
  color,
}: {
  title: string;
  content: string;
  color: "indigo" | "amber" | "emerald";
}) {
  const colors = {
    indigo: "border-indigo-200 bg-indigo-50/50",
    amber: "border-amber-200 bg-amber-50/50",
    emerald: "border-emerald-200 bg-emerald-50/50",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
    </div>
  );
}
