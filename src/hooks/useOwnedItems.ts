"use client";

import { useCallback, useState } from "react";
import type { OwnedItem } from "@/types";
import { getOwnedItems } from "@/actions/items";

export function useOwnedItems(initialItems: OwnedItem[] = []) {
  const [items, setItems] = useState<OwnedItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnedItems();
      setItems(data as OwnedItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, refresh, setItems };
}
