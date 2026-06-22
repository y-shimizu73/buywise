import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
import type { OwnedItemInlineImage } from "@/lib/supabase/owned-item-images";
import type { ConsideringItem, DiagnosisResult, OwnedItem } from "@/types";
import { CATEGORY_MAP } from "@/lib/constants";

const GEMINI_MODEL = "gemini-3.5-flash";

const DIAGNOSIS_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    compatibility_score: {
      type: SchemaType.INTEGER,
      description: "所有物との相性スコア (0-100)",
    },
    duplication_score: {
      type: SchemaType.INTEGER,
      description: "重複度スコア (0-100)",
    },
    satisfaction_prediction: {
      type: SchemaType.INTEGER,
      description: "購入後の満足度予測 (1-5)",
    },
    summary: { type: SchemaType.STRING },
    compatibility_analysis: { type: SchemaType.STRING },
    duplication_analysis: { type: SchemaType.STRING },
    satisfaction_analysis: { type: SchemaType.STRING },
    recommendation: { type: SchemaType.STRING },
    verdict: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["buy", "caution", "skip"],
    },
  },
  required: [
    "compatibility_score",
    "duplication_score",
    "satisfaction_prediction",
    "summary",
    "compatibility_analysis",
    "duplication_analysis",
    "satisfaction_analysis",
    "recommendation",
    "verdict",
  ],
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildDiagnosisPrompt(
  consideringItem: ConsideringItem,
  ownedItems: OwnedItem[],
): string {
  let imageCounter = 0;
  const ownedList = ownedItems
    .map((item) => {
      const imageNote = item.image_url
        ? ` / 写真: 画像${(imageCounter += 1)}`
        : "";
      return `- ${item.name}（${CATEGORY_MAP[item.category].label}${item.brand ? ` / ${item.brand}` : ""}${imageNote}）満足度: ${item.satisfaction ?? "未評価"}/5${item.description ? ` — ${item.description}` : ""}`;
    })
    .join("\n");

  const imageSection =
    imageCounter > 0
      ? `\n## 所有物の写真\n添付画像は上記所有物の写真です。色・素材・デザイン・サイズ感・スタイルの重複を視覚的に分析し、診断に反映してください。\n`
      : "";

  return `あなたは購入アドバイザーAIです。ユーザーが検討中の商品について、所有物との相性・重複・満足度予測を診断してください。

## 検討中の商品
- 名前: ${consideringItem.name}
- カテゴリ: ${CATEGORY_MAP[consideringItem.category].label}
- ブランド: ${consideringItem.brand ?? "不明"}
- 価格: ${consideringItem.price ? `¥${consideringItem.price.toLocaleString()}` : "不明"}
- 説明: ${consideringItem.description ?? "なし"}
- 購入理由: ${consideringItem.purchase_reason ?? "なし"}

## 所有物一覧
${ownedList || "（所有物なし）"}${imageSection}
診断は具体的かつ実用的に行い、所有物との関係を踏まえた根拠を示してください。`;
}

function validateDiagnosisResult(data: DiagnosisResult): DiagnosisResult {
  const verdicts = ["buy", "caution", "skip"] as const;

  if (
    data.compatibility_score < 0 ||
    data.compatibility_score > 100 ||
    data.duplication_score < 0 ||
    data.duplication_score > 100 ||
    data.satisfaction_prediction < 1 ||
    data.satisfaction_prediction > 5 ||
    !verdicts.includes(data.verdict)
  ) {
    throw new Error("AI診断の結果形式が不正です");
  }

  return data;
}

export async function runDiagnosis(
  consideringItem: ConsideringItem,
  ownedItems: OwnedItem[],
  ownedItemImages: OwnedItemInlineImage[] = [],
): Promise<DiagnosisResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: DIAGNOSIS_SCHEMA,
    },
  });

  const prompt = buildDiagnosisPrompt(consideringItem, ownedItems);

  const contentParts: Array<string | OwnedItemInlineImage> = [
    prompt,
    ...ownedItemImages,
  ];

  const result = await model.generateContent(contentParts);

  const content = result.response.text();
  if (!content) {
    throw new Error("AI診断の結果を取得できませんでした");
  }

  return validateDiagnosisResult(JSON.parse(content) as DiagnosisResult);
}
