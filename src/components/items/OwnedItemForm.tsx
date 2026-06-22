"use client";

import { useEffect, useState } from "react";
import type { CategoryType, OwnedItem } from "@/types";
import { extractOwnedItemFromPhoto } from "@/actions/items";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CategorySelect } from "@/components/items/CategorySelect";
import { MAX_OWNED_ITEM_IMAGE_BYTES } from "@/lib/owned-item-image-constants";
import { Sparkles } from "lucide-react";

interface OwnedItemFormProps {
  initialData?: OwnedItem;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

export function OwnedItemForm({
  initialData,
  onSubmit,
  onCancel,
}: OwnedItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState<CategoryType | "">(
    initialData?.category ?? "",
  );
  const [brand, setBrand] = useState(initialData?.brand ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [satisfaction, setSatisfaction] = useState(
    initialData?.satisfaction?.toString() ?? "",
  );
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchase_date ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.image_display_url ?? null,
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [extractMessage, setExtractMessage] = useState<string | null>(null);

  const canExtractFromPhoto =
    Boolean(imageFile) ||
    Boolean(initialData?.image_url && !removeImage && !imageFile);

  useEffect(() => {
    if (!imageFile) return;

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleImageChange = (file: File | null) => {
    setImageError(null);
    setExtractMessage(null);

    if (!file) {
      setImageFile(null);
      setPreviewUrl(initialData?.image_display_url ?? null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("JPEG / PNG / WebP 形式の画像のみアップロードできます");
      return;
    }

    if (file.size > MAX_OWNED_ITEM_IMAGE_BYTES) {
      setImageError("画像は 4MB 以下にしてください");
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
  };

  const handleExtractFromPhoto = async () => {
    if (!canExtractFromPhoto) return;

    setExtracting(true);
    setImageError(null);
    setExtractMessage(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.set("image", imageFile);
      } else if (initialData?.id) {
        formData.set("itemId", initialData.id);
      }

      const result = await extractOwnedItemFromPhoto(formData);
      setName(result.name);
      setCategory(result.category);
      setBrand(result.brand ?? "");
      setDescription(result.description);
      setExtractMessage("AIの推測を入力しました。内容を確認してから登録してください。");
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "写真から情報を取得できませんでした",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("category", category);
      formData.set("brand", brand);
      formData.set("description", description);
      formData.set("satisfaction", satisfaction);
      formData.set("purchase_date", purchaseDate);
      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeImage) {
        formData.set("removeImage", "true");
      }

      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">写真</label>
        {previewUrl && !removeImage && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${name || "所有物"}の写真`}
              className="h-40 w-full object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="text-xs text-slate-500">
          写真を選んでから自動入力できます（JPEG / PNG / WebP、4MB以下）
        </p>
        {canExtractFromPhoto && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={extracting}
            onClick={handleExtractFromPhoto}
          >
            <Sparkles className="h-4 w-4" />
            写真から情報を取得
          </Button>
        )}
        {extractMessage && (
          <p className="text-xs text-emerald-600">{extractMessage}</p>
        )}
        {imageError && <p className="text-xs text-rose-600">{imageError}</p>}
        {initialData?.image_url && !imageFile && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(e) => {
                setRemoveImage(e.target.checked);
                setExtractMessage(null);
                if (e.target.checked) {
                  setPreviewUrl(null);
                } else {
                  setPreviewUrl(initialData.image_display_url ?? null);
                }
              }}
            />
            現在の写真を削除する
          </label>
        )}
      </div>
      <Input
        label="アイテム名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="例: トートバッグ"
      />
      <CategorySelect
        value={category}
        onChange={(v) => setCategory(v as CategoryType)}
        required
      />
      <Input
        label="ブランド"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="例: PORTER"
      />
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="色、素材、使用感など"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="満足度 (1-5)"
          type="number"
          min={1}
          max={5}
          value={satisfaction}
          onChange={(e) => setSatisfaction(e.target.value)}
        />
        <Input
          label="購入日"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
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
