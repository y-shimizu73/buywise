"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OwnedItemFormData, OwnedItem } from "@/types";

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
  return (data ?? []) as OwnedItem[];
}

export async function createOwnedItem(formData: OwnedItemFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase.from("owned_items").insert({
    user_id: user.id,
    name: formData.name,
    category: formData.category,
    brand: formData.brand || null,
    description: formData.description || null,
    satisfaction: formData.satisfaction ?? null,
    purchase_date: formData.purchase_date || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/owned");
  revalidatePath("/dashboard");
}

export async function updateOwnedItem(
  id: string,
  formData: OwnedItemFormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("owned_items")
    .update({
      name: formData.name,
      category: formData.category,
      brand: formData.brand || null,
      description: formData.description || null,
      satisfaction: formData.satisfaction ?? null,
      purchase_date: formData.purchase_date || null,
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

  const { error } = await supabase
    .from("owned_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

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
  return (data ?? []) as OwnedItem[];
}
