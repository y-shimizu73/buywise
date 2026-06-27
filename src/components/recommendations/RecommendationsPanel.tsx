"use client";

import { useState } from "react";
import Link from "next/link";
import type { OwnedItemRecommendationsResult } from "@/types";
import { getOwnedItemRecommendations } from "@/actions/recommendations";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_MAP, PRIORITY_LABELS } from "@/lib/constants";
import { Lightbulb, Package, Sparkles, Search } from "lucide-react";

interface RecommendationsPanelProps {
  ownedCount: number;
}

export function RecommendationsPanel({ ownedCount }: RecommendationsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OwnedItemRecommendationsResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const recommendations = await getOwnedItemRecommendations();
      setResult(recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "おすすめの取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  if (ownedCount === 0) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8 text-slate-400" />}
        title="所有物がありません"
        description="所有物を登録すると、AIが次に検討すべきアイテムを提案します"
        action={
          <Link href="/owned">
            <Button>所有物を登録する</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              所有物からおすすめを生成
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              登録済みの {ownedCount} 件の所有物をもとに、次に足すとよいアイテムの特徴を提案します
            </p>
          </div>
          <Button onClick={handleGenerate} loading={loading} size="lg">
            <Sparkles className="h-5 w-5" />
            おすすめを取得
          </Button>
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </p>
        )}
      </Card>

      {result && <RecommendationsResult result={result} />}
    </div>
  );
}

function RecommendationsResult({
  result,
}: {
  result: OwnedItemRecommendationsResult;
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">分析サマリー</h2>
        </div>
        <p className="text-slate-700 leading-relaxed">{result.summary}</p>
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            スタイル傾向
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {result.style_analysis}
          </p>
        </div>
        {result.gaps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              コレクションのギャップ
            </h3>
            <ul className="space-y-2">
              {result.gaps.map((gap) => (
                <li
                  key={gap}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                >
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          次に検討すべきアイテム
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {result.suggestions.map((suggestion) => {
            const category = CATEGORY_MAP[suggestion.category];
            const priority = PRIORITY_LABELS[suggestion.priority];

            return (
              <Card key={`${suggestion.category}-${suggestion.title}`} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      {category.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {suggestion.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge>{category.label}</Badge>
                        <Badge className={`${priority.bg} ${priority.color}`}>
                          {priority.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {suggestion.reason}
                </p>
                {suggestion.traits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestion.traits.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
                {suggestion.example_products.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-medium text-slate-500">
                      商品例（クリックで検索）
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.example_products.map((product) => (
                        <a
                          key={product}
                          href={`https://www.google.com/search?q=${encodeURIComponent(product)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Search className="h-3 w-3" />
                          {product}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-amber-50 border-amber-100">
        <p className="text-sm text-amber-900 leading-relaxed">
          商品例はAIが挙げたものです。実在・在庫・価格は未確認のため、検索リンクからご自身で確認してください。気になる項目は
          <Link href="/considering" className="font-medium underline mx-1">
            検討中リスト
          </Link>
          に追加し、AI Review で詳しく診断できます。
        </p>
      </Card>
    </div>
  );
}
