import type { CategoryType } from "@/types";

export const APP_NAME = "BuyWise";

export const CATEGORIES: {
  id: CategoryType;
  label: string;
  icon: string;
}[] = [
  { id: "bag", label: "バッグ・財布", icon: "👜" },
  { id: "clothes", label: "服・靴", icon: "👔" },
  { id: "phone", label: "スマホ・タブレット", icon: "📱" },
  { id: "computer", label: "PC・周辺機器", icon: "💻" },
  { id: "audio", label: "オーディオ・イヤホン", icon: "🎧" },
  { id: "camera", label: "カメラ", icon: "📷" },
  { id: "wearable", label: "ウェアラブル", icon: "⌚" },
  { id: "game", label: "ゲーム", icon: "🎮" },
  { id: "gadget", label: "その他ガジェット", icon: "🔌" },
  { id: "car", label: "車", icon: "🚗" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryType, (typeof CATEGORIES)[number]>;

export const VERDICT_LABELS: Record<
  "buy" | "caution" | "skip",
  { label: string; color: string; bg: string }
> = {
  buy: { label: "購入推奨", color: "text-emerald-700", bg: "bg-emerald-100" },
  caution: {
    label: "要検討",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  skip: { label: "見送り推奨", color: "text-rose-700", bg: "bg-rose-100" },
};

export const PRIORITY_LABELS: Record<
  "high" | "medium" | "low",
  { label: string; color: string; bg: string }
> = {
  high: { label: "優先度高", color: "text-rose-700", bg: "bg-rose-100" },
  medium: { label: "優先度中", color: "text-amber-700", bg: "bg-amber-100" },
  low: { label: "優先度低", color: "text-slate-700", bg: "bg-slate-100" },
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/owned", label: "Owned Items", icon: "Package" },
  { href: "/considering", label: "Considering Items", icon: "ShoppingBag" },
  { href: "/recommendations", label: "Recommendations", icon: "Lightbulb" },
  { href: "/review", label: "AI Review", icon: "Sparkles" },
  { href: "/history", label: "History", icon: "History" },
] as const;
