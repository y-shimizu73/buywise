"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentUserProfile } from "@/lib/supabase/ensure-profile";
import {
  deleteOwnedItemImage,
  downloadOwnedItemImageForAi,
  fileToOwnedItemInlineImage,
  getOwnedItemImageSignedUrl,
  uploadOwnedItemImage,
} from "@/lib/supabase/owned-item-images";
import { extractOwnedItemFromImage } from "@/lib/gemini";
import type {
  CategoryType,
  OwnedItem,
  OwnedItemExtractionResult,
  OwnedItemFormData,
} from "@/types";

async function attachImageDisplayUrls(items: OwnedItem[]): Promise<OwnedItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (!item.image_url) return item;

      try {
        const image_display_url = await getOwnedItemImageSignedUrl(
          item.image_url,
        );
        return { ...item, image_display_url };
      } catch {
        return item;
      }
    }),
  );
}

function parseOwnedItemFormData(formData: FormData): OwnedItemFormData {
  const satisfactionRaw = formData.get("satisfaction");
  const satisfaction =
    typeof satisfactionRaw === "string" && satisfactionRaw !== ""
      ? Number(satisfactionRaw)
      : undefined;

  return {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? "") as CategoryType,
    brand: String(formData.get("brand") ?? ""),
    description: String(formData.get("description") ?? ""),
    satisfaction,
    purchase_date: String(formData.get("purchase_date") ?? ""),
    removeImage: formData.get("removeImage") === "true",
  };
}

function getImageFile(formData: FormData) {
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    return image;
  }
  return null;
}

export async function getOwnedItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("owned_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return attachImageDisplayUrls((data ?? []) as OwnedItem[]);
}

export async function createOwnedItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  await ensureCurrentUserProfile();

  const parsed = parseOwnedItemFormData(formData);
  const imageFile = getImageFile(formData);
  const image_url = imageFile
    ? await uploadOwnedItemImage(user.id, imageFile)
    : null;

  const { error } = await supabase.from("owned_items").insert({
    user_id: user.id,
    name: parsed.name,
    category: parsed.category,
    brand: parsed.brand || null,
    description: parsed.description || null,
    satisfaction: parsed.satisfaction ?? null,
    purchase_date: parsed.purchase_date || null,
    image_url,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/owned");
  revalidatePath("/dashboard");
}

export async function updateOwnedItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const parsed = parseOwnedItemFormData(formData);
  const imageFile = getImageFile(formData);

  const { data: existingItem, error: existingError } = await supabase
    .from("owned_items")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existingItem) {
    throw new Error("アイテムが見つかりません");
  }

  let image_url = existingItem.image_url;

  if (parsed.removeImage) {
    await deleteOwnedItemImage(existingItem.image_url);
    image_url = null;
  }

  if (imageFile) {
    if (existingItem.image_url) {
      await deleteOwnedItemImage(existingItem.image_url);
    }
    image_url = await uploadOwnedItemImage(user.id, imageFile);
  }

  const { error } = await supabase
    .from("owned_items")
    .update({
      name: parsed.name,
      category: parsed.category,
      brand: parsed.brand || null,
      description: parsed.description || null,
      satisfaction: parsed.satisfaction ?? null,
      purchase_date: parsed.purchase_date || null,
      image_url,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/owned");
  revalidatePath("/dashboard");
}

export async function deleteOwnedItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { data: existingItem, error: existingError } = await supabase
    .from("owned_items")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (existingError) throw new Error(existingError.message);

  const { error } = await supabase
    .from("owned_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  await deleteOwnedItemImage(existingItem?.image_url);

  revalidatePath("/owned");
  revalidatePath("/dashboard");
}

export async function getOwnedItemsByCategory(category?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("owned_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return attachImageDisplayUrls((data ?? []) as OwnedItem[]);
}

export async function extractOwnedItemFromPhoto(
  formData: FormData,
): Promise<OwnedItemExtractionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const imageFile = getImageFile(formData);
  const itemId = formData.get("itemId");

  let inlineImage;

  if (imageFile) {
    inlineImage = await fileToOwnedItemInlineImage(imageFile);
  } else if (typeof itemId === "string" && itemId) {
    const { data: item, error } = await supabase
      .from("owned_items")
      .select("image_url")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (error || !item?.image_url) {
      throw new Error("写真が見つかりません");
    }

    inlineImage = await downloadOwnedItemImageForAi(item.image_url);
    if (!inlineImage) {
      throw new Error("写真を読み込めませんでした");
    }
  } else {
    throw new Error("写真を選択してください");
  }

  return extractOwnedItemFromImage(inlineImage);
}
