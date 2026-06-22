"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentUserProfile } from "@/lib/supabase/ensure-profile";
import { runDiagnosis } from "@/lib/gemini";
import { downloadOwnedItemImagesForAi } from "@/lib/supabase/owned-item-images";
import type {
  ConsideringItemFormData,
  Diagnosis,
  ConsideringItem,
} from "@/types";

export async function getConsideringItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("considering_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ConsideringItem[];
}

export async function createConsideringItem(formData: ConsideringItemFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  await ensureCurrentUserProfile();

  const { error } = await supabase.from("considering_items").insert({
    user_id: user.id,
    name: formData.name,
    category: formData.category,
    brand: formData.brand || null,
    description: formData.description || null,
    price: formData.price ?? null,
    purchase_reason: formData.purchase_reason || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/considering");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function updateConsideringItem(
  id: string,
  formData: ConsideringItemFormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("considering_items")
    .update({
      name: formData.name,
      category: formData.category,
      brand: formData.brand || null,
      description: formData.description || null,
      price: formData.price ?? null,
      purchase_reason: formData.purchase_reason || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/considering");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function deleteConsideringItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("considering_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/considering");
  revalidatePath("/dashboard");
  revalidatePath("/review");
}

export async function runAiDiagnosis(consideringItemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { data: consideringItem, error: itemError } = await supabase
    .from("considering_items")
    .select("*")
    .eq("id", consideringItemId)
    .eq("user_id", user.id)
    .single();

  if (itemError || !consideringItem) {
    throw new Error("検討中アイテムが見つかりません");
  }

  const { data: ownedItems, error: ownedError } = await supabase
    .from("owned_items")
    .select("*")
    .eq("user_id", user.id);

  if (ownedError) throw new Error(ownedError.message);

  const ownedItemImagePaths = (ownedItems ?? [])
    .map((item) => item.image_url)
    .filter((path): path is string => Boolean(path));
  const ownedItemImages = await downloadOwnedItemImagesForAi(
    ownedItemImagePaths,
  );

  const result = await runDiagnosis(
    consideringItem,
    ownedItems ?? [],
    ownedItemImages,
  );

  const { data: diagnosis, error: diagnosisError } = await supabase
    .from("diagnoses")
    .insert({
      user_id: user.id,
      considering_item_id: consideringItemId,
      considering_item_name: consideringItem.name,
      ...result,
    })
    .select()
    .single();

  if (diagnosisError) throw new Error(diagnosisError.message);

  revalidatePath("/history");
  revalidatePath("/dashboard");

  return diagnosis as Diagnosis;
}

export async function getDiagnoses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("diagnoses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Diagnosis[];
}

export async function getDiagnosis(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("diagnoses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data as Diagnosis;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ownedCount: 0,
      consideringCount: 0,
      diagnosisCount: 0,
      recentDiagnoses: [],
    };
  }

  const [owned, considering, diagnosisCount, recentDiagnoses] =
    await Promise.all([
      supabase
        .from("owned_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("considering_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("diagnoses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("diagnoses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  return {
    ownedCount: owned.count ?? 0,
    consideringCount: considering.count ?? 0,
    diagnosisCount: diagnosisCount.count ?? 0,
    recentDiagnoses: (recentDiagnoses.data ?? []) as Diagnosis[],
  };
}
