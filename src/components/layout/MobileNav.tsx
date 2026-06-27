"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  History,
  Lightbulb,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  History,
  Lightbulb,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href;
          const shortLabel = item.label.split(" ")[0];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors min-w-0",
                isActive ? "text-indigo-600" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
