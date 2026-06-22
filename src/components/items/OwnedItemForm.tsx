"use client";

import { useState } from "react";
import type { CategoryType, OwnedItem, OwnedItemFormData } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CategorySelect } from "@/components/items/CategorySelect";

interface OwnedItemFormProps {
  initialData?: OwnedItem;
  onSubmit: (data: OwnedItemFormData) => Promise<void>;
  onCancel: () => void;
}

export function OwnedItemForm({
  initialData,
  onSubmit,
  onCancel,
}: OwnedItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OwnedItemFormData>({
    name: initialData?.name ?? "",
    category: initialData?.category ?? ("" as CategoryType),
    brand: initialData?.brand ?? "",
    description: initialData?.description ?? "",
    satisfaction: initialData?.satisfaction ?? undefined,
    purchase_date: initialData?.purchase_date ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="アイテム名"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        placeholder="例: トートバッグ"
      />
      <CategorySelect
        value={form.category}
        onChange={(v) => setForm({ ...form, category: v as CategoryType })}
        required
      />
      <Input
        label="ブランド"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        placeholder="例: PORTER"
      />
      <Textarea
        label="説明"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        placeholder="色、素材、使用感など"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="満足度 (1-5)"
          type="number"
          min={1}
          max={5}
          value={form.satisfaction ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              satisfaction: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <Input
          label="購入日"
          type="date"
          value={form.purchase_date}
          onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? "更新" : "登録"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
