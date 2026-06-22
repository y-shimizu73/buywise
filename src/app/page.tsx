import { APP_NAME } from "@/lib/constants";
import { LoginButton } from "@/components/auth/LoginButton";
import { Sparkles, Shield, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl font-bold shadow-lg shadow-indigo-200">
            BW
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            購入を検討している商品について、所有物との相性・重複・満足度予測をAIが診断。
            <br className="hidden sm:block" />
            賢い買い物をサポートします。
          </p>
          <div className="mt-8">
            <LoginButton />
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-indigo-600" />}
            title="AI診断"
            description="所有物との相性や重複度をAIが分析し、購入判断をサポート"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-indigo-600" />}
            title="所有物管理"
            description="財布、バッグ、服、ガジェット、車などカテゴリ別に所有物を登録"
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
            title="満足度予測"
            description="過去の所有物の満足度から、購入後の満足度を予測"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
