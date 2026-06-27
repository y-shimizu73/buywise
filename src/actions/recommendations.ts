"use server";

import { createClient } from "@/lib/supabase/server";
import { getOwnedItems } from "@/actions/items";
import { runOwnedItemRecommendations } from "@/lib/gemini";
import { downloadOwnedItemImagesForAi } from "@/lib/supabase/owned-item-images";
import type { OwnedItemRecommendationsResult } from "@/types";

export async function getOwnedItemRecommendations(): Promise<OwnedItemRecommendationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("ログインが必要です");

  const ownedItems = await getOwnedItems();

  if (ownedItems.length === 0) {
    throw new Error("所有物を登録してからおすすめを取得してください");
  }

  const ownedItemImagePaths = ownedItems
    .map((item) => item.image_url)
    .filter((path): path is string => Boolean(path));
  const ownedItemImages = await downloadOwnedItemImagesForAi(
    ownedItemImagePaths,
  );

  return runOwnedItemRecommendations(ownedItems, ownedItemImages);
}
