"use client";

import { useState } from "react";
import type {
  CategoryType,
  ConsideringItem,
  ConsideringItemFormData,
} from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CategorySelect } from "@/components/items/CategorySelect";

interface ConsideringItemFormProps {
  initialData?: ConsideringItem;
  onSubmit: (data: ConsideringItemFormData) => Promise<void>;
  onCancel: () => void;
}

export function ConsideringItemForm({
  initialData,
  onSubmit,
  onCancel,
}: ConsideringItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ConsideringItemFormData>({
    name: initialData?.name ?? "",
    category: initialData?.category ?? ("" as CategoryType),
    brand: initialData?.brand ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ? Number(initialData.price) : undefined,
    purchase_reason: initialData?.purchase_reason ?? "",
    product_url: initialData?.product_url ?? "",
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
        label="商品名"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        placeholder="例: AirPods Pro 2"
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
        placeholder="例: Apple"
      />
      <Input
        label="価格 (円)"
        type="number"
        value={form.price ?? ""}
        onChange={(e) =>
          setForm({
            ...form,
            price: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        placeholder="39800"
      />
      <Input
        label="商品リンク"
        type="url"
        value={form.product_url ?? ""}
        onChange={(e) => setForm({ ...form, product_url: e.target.value })}
        placeholder="https://example.com/product"
      />
      <Textarea
        label="商品説明"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        placeholder="スペック、特徴など"
      />
      <Textarea
        label="購入理由"
        value={form.purchase_reason}
        onChange={(e) =>
          setForm({ ...form, purchase_reason: e.target.value })
        }
        rows={2}
        placeholder="なぜ欲しいのか"
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? "更新" : "追加"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
