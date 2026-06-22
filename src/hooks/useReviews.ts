"use client";

import { useCallback, useState } from "react";
import type { Diagnosis } from "@/types";
import { getDiagnoses } from "@/actions/reviews";

export function useReviews(initialDiagnoses: Diagnosis[] = []) {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialDiagnoses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiagnoses();
      setDiagnoses(data as Diagnosis[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  return { diagnoses, loading, error, refresh, setDiagnoses };
}
