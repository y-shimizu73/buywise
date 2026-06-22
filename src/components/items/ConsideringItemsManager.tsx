"use client";

import { useState, useTransition } from "react";
import type { ConsideringItem, ConsideringItemFormData } from "@/types";
import {
  createConsideringItem,
  updateConsideringItem,
  deleteConsideringItem,
} from "@/actions/reviews";
import { ItemCard } from "@/components/items/ItemCard";
import { ConsideringItemForm } from "@/components/items/ConsideringItemForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Plus, ShoppingBag } from "lucide-react";

interface ConsideringItemsManagerProps {
  initialItems: ConsideringItem[];
}

export function ConsideringItemsManager({
  initialItems,
}: ConsideringItemsManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsideringItem | null>(null);
  const [, startTransition] = useTransition();

  const handleCreate = async (data: ConsideringItemFormData) => {
    await createConsideringItem(data);
    startTransition(() => {
      window.location.reload();
    });
  };

  const handleUpdate = async (data: ConsideringItemFormData) => {
    if (!editingItem) return;
    await updateConsideringItem(editingItem.id, data);
    startTransition(() => {
      window.location.reload();
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このアイテムを削除しますか？")) return;
    await deleteConsideringItem(id);
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!showForm && !editingItem && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            商品を追加
          </Button>
        )}
      </div>

      {(showForm || editingItem) && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? "商品を編集" : "検討中の商品を追加"}
          </h2>
          <ConsideringItemForm
            initialData={editingItem ?? undefined}
            onSubmit={editingItem ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-slate-400" />}
          title="検討中の商品がありません"
          description="購入を検討している商品を追加して、AI診断を受けましょう"
          action={
            !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                商品を追加
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              type="considering"
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
