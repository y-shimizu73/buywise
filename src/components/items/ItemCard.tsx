import Image from "next/image";
import { CATEGORY_MAP } from "@/lib/constants";
import type { ConsideringItem, OwnedItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Star, ExternalLink } from "lucide-react";

interface ItemCardProps {
  item: OwnedItem | ConsideringItem;
  type: "owned" | "considering";
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ item, type, onEdit, onDelete }: ItemCardProps) {
  const category = CATEGORY_MAP[item.category];
  const ownedItem = type === "owned" ? (item as OwnedItem) : null;
  const consideringItem =
    type === "considering" ? (item as ConsideringItem) : null;
  const imageUrl = ownedItem?.image_display_url ?? null;

  return (
    <Card padding="sm" className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {imageUrl ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={imageUrl}
                alt={`${item.name}の写真`}
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
              {category.icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">
              {item.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge>{category.label}</Badge>
              {item.brand && (
                <span className="text-xs text-slate-500">{item.brand}</span>
              )}
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                {item.description}
              </p>
            )}
            {ownedItem?.satisfaction && (
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < ownedItem.satisfaction! ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                ))}
              </div>
            )}
            {consideringItem?.price && (
              <p className="mt-2 text-sm font-medium text-indigo-600">
                ¥{Number(consideringItem.price).toLocaleString()}
              </p>
            )}
            {consideringItem?.product_url && (
              <a
                href={consideringItem.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                商品ページを開く
              </a>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                編集
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-700"
              >
                削除
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
