export type CategoryType = "wallet" | "bag" | "clothes" | "gadget" | "car";

export type Verdict = "buy" | "caution" | "skip";

export interface Category {
  id: CategoryType;
  label_ja: string;
  icon: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnedItem {
  id: string;
  user_id: string;
  name: string;
  category: CategoryType;
  brand: string | null;
  description: string | null;
  satisfaction: number | null;
  purchase_date: string | null;
  image_url: string | null;
  image_display_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsideringItem {
  id: string;
  user_id: string;
  name: string;
  category: CategoryType;
  brand: string | null;
  description: string | null;
  price: number | null;
  purchase_reason: string | null;
  product_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  user_id: string;
  considering_item_id: string | null;
  considering_item_name: string;
  compatibility_score: number;
  duplication_score: number;
  satisfaction_prediction: number;
  summary: string;
  compatibility_analysis: string;
  duplication_analysis: string;
  satisfaction_analysis: string;
  recommendation: string;
  verdict: Verdict;
  created_at: string;
}

export interface DiagnosisResult {
  compatibility_score: number;
  duplication_score: number;
  satisfaction_prediction: number;
  summary: string;
  compatibility_analysis: string;
  duplication_analysis: string;
  satisfaction_analysis: string;
  recommendation: string;
  verdict: Verdict;
}

export interface OwnedItemFormData {
  name: string;
  category: CategoryType;
  brand?: string;
  description?: string;
  satisfaction?: number;
  purchase_date?: string;
  removeImage?: boolean;
}

export interface OwnedItemExtractionResult {
  name: string;
  category: CategoryType;
  brand: string | null;
  description: string;
}

export type RecommendationPriority = "high" | "medium" | "low";

export interface OwnedItemSuggestion {
  category: CategoryType;
  title: string;
  reason: string;
  priority: RecommendationPriority;
  traits: string[];
}

export interface OwnedItemRecommendationsResult {
  summary: string;
  style_analysis: string;
  gaps: string[];
  suggestions: OwnedItemSuggestion[];
}

export interface ConsideringItemFormData {
  name: string;
  category: CategoryType;
  brand?: string;
  description?: string;
  price?: number;
  purchase_reason?: string;
  product_url?: string;
}
