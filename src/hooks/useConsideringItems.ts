"use client";

import { useCallback, useState } from "react";
import type { ConsideringItem } from "@/types";
import { getConsideringItems } from "@/actions/reviews";

export function useConsideringItems(initialItems: ConsideringItem[] = []) {
  const [items, setItems] = useState<ConsideringItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConsideringItems();
      setItems(data as ConsideringItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, refresh, setItems };
}
