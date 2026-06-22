"use client";

import { useState, useTransition } from "react";
import type { OwnedItem, OwnedItemFormData } from "@/types";
import {
  createOwnedItem,
  updateOwnedItem,
  deleteOwnedItem,
} from "@/actions/items";
import { ItemCard } from "@/components/items/ItemCard";
import { OwnedItemForm } from "@/components/items/OwnedItemForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/constants";
import { Plus, Package } from "lucide-react";

interface OwnedItemsManagerProps {
  initialItems: OwnedItem[];
}

export function OwnedItemsManager({ initialItems }: OwnedItemsManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<OwnedItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [, startTransition] = useTransition();

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const handleCreate = async (data: OwnedItemFormData) => {
    await createOwnedItem(data);
    startTransition(() => {
      window.location.reload();
    });
  };

  const handleUpdate = async (data: OwnedItemFormData) => {
    if (!editingItem) return;
    await updateOwnedItem(editingItem.id, data);
    startTransition(() => {
      window.location.reload();
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このアイテムを削除しますか？")) return;
    await deleteOwnedItem(id);
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="すべて"
          />
          {CATEGORIES.map((c) => (
            <FilterButton
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              label={`${c.icon} ${c.label}`}
            />
          ))}
        </div>
        {!showForm && !editingItem && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            追加
          </Button>
        )}
      </div>

      {(showForm || editingItem) && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? "アイテムを編集" : "所有物を登録"}
          </h2>
          <OwnedItemForm
            initialData={editingItem ?? undefined}
            onSubmit={editingItem ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </Card>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8 text-slate-400" />}
          title="所有物がありません"
          description="所有しているアイテムを登録して、AI診断の精度を高めましょう"
          action={
            !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                最初のアイテムを登録
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="owned"
              onEdit={() => {
                setEditingItem(item);
                setShowForm(false);
              }}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
