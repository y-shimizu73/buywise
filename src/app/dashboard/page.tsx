import { AppLayout } from "@/components/layout/AppLayout";
import { getDashboardStats } from "@/actions/reviews";
import { Card } from "@/components/ui/Card";
import { HistoryCard } from "@/components/reviews/HistoryCard";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Sparkles,
  History,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            あなたの買い物診断の概要
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package className="h-5 w-5 text-indigo-600" />}
            label="所有物"
            value={stats.ownedCount}
            href="/owned"
          />
          <StatCard
            icon={<ShoppingBag className="h-5 w-5 text-purple-600" />}
            label="検討中"
            value={stats.consideringCount}
            href="/considering"
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-amber-600" />}
            label="AI診断"
            value={stats.diagnosisCount}
            href="/review"
          />
          <StatCard
            icon={<History className="h-5 w-5 text-emerald-600" />}
            label="履歴"
            value={stats.diagnosisCount}
            href="/history"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                クイックアクション
              </h2>
            </div>
            <div className="space-y-3">
              <QuickAction
                href="/owned"
                title="所有物を登録"
                description="AI診断の精度を高めるために所有物を追加"
              />
              <QuickAction
                href="/considering"
                title="検討中の商品を追加"
                description="購入を検討している商品を登録"
              />
              <QuickAction
                href="/review"
                title="AI診断を実行"
                description="相性・重複・満足度をAIが分析"
              />
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                最近の診断
              </h2>
              <Link
                href="/history"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                すべて見る
              </Link>
            </div>
            {stats.recentDiagnoses.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-8">
                  まだ診断履歴がありません。
                  <Link
                    href="/review"
                    className="text-indigo-600 hover:underline ml-1"
                  >
                    AI診断を試す
                  </Link>
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.recentDiagnoses.map((d) => (
                  <HistoryCard key={d.id} diagnosis={d} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card padding="sm" className="hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors group"
    >
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
    </Link>
  );
}
