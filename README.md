# BuyWise

購入を検討している商品について、所有物との相性・重複・満足度予測をAIで診断するWebアプリ。

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Database)
- **Google Gemini 3.5 Flash** (AI Diagnosis)

## Features

- Google ログイン
- 所有物登録（カテゴリ: 財布、バッグ、服、ガジェット、車）
- 検討中商品の追加
- AI 診断（相性・重複・満足度予測）
- 診断履歴保存
- レスポンシブ対応

## Setup

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.local.example` を `.env.local` にコピーして値を設定:

```bash
cp .env.local.example .env.local
```

### 3. Supabase セットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Authentication > Providers で **Google** を有効化
4. Google Cloud Console で OAuth 2.0 クライアント ID を作成し、Supabase に設定
5. Redirect URL: `http://localhost:3000/auth/callback`

### 4. Gemini API セットアップ

1. [Google AI Studio](https://aistudio.google.com/apikey) で API キーを発行
2. `.env.local` の `GEMINI_API_KEY` に設定
3. 使用モデル: `gemini-3.5-flash`

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## Project Structure

```
src/
├── actions/          # Server Actions
│   ├── auth.ts
│   ├── items.ts
│   └── reviews.ts
├── app/              # App Router pages
│   ├── dashboard/
│   ├── owned/
│   ├── considering/
│   ├── review/
│   └── history/
├── components/       # UI components
│   ├── auth/
│   ├── items/
│   ├── layout/
│   ├── reviews/
│   └── ui/
├── hooks/            # Custom hooks
├── lib/              # Utilities & clients (gemini, supabase)
└── types/            # TypeScript types
supabase/
└── schema.sql        # Database schema
```

## Pages

| Path | Description |
|------|-------------|
| `/` | ランディング / ログイン |
| `/dashboard` | ダッシュボード |
| `/owned` | 所有物管理 |
| `/considering` | 検討中商品 |
| `/review` | AI 診断 |
| `/history` | 診断履歴 |
