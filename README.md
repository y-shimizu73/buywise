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
3. 既存DBを使っている場合は `supabase/migrations/20250620_owned_item_images.sql` も実行
4. Authentication > Providers で **Google** を有効化
5. Google Cloud Console で OAuth 2.0 クライアント ID を作成し、Supabase に設定
6. Redirect URL: `http://localhost:3000/auth/callback`

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

## Architecture

```
Next.js (App Router)
  ├── Supabase Auth      … Google ログイン
  ├── Supabase PostgreSQL … データ保存 + RLS
  └── Gemini 3.5 Flash   … AI 診断（Server Actions）
```

認証・データベースは **Supabase** に集約し、行単位のアクセス制御は PostgreSQL RLS で実装しています。

## デプロイ (Vercel)

アプリは Vercel にホストし、データは Supabase に置いたまま接続します（データ移行は不要）。

### 1. リポジトリを Vercel にインポート

1. [Vercel](https://vercel.com) に GitHub でログイン
2. **Add New → Project** で本リポジトリを選択（Framework は Next.js が自動検出）

### 2. 環境変数を設定

Vercel の **Settings → Environment Variables** に以下を登録:

| 変数名 | 値 |
|--------|----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `GEMINI_API_KEY` | Gemini API キー |
| `NEXT_PUBLIC_SITE_URL` | 本番 URL（例: `https://buywise.vercel.app`） |
| `CRON_SECRET`（推奨） | keep-alive 用の共有シークレット（任意の長いランダム文字列） |

`NEXT_PUBLIC_SITE_URL` は OAuth コールバックに使用します。未設定の場合は Vercel のドメイン (`VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`) に自動フォールバックしますが、独自ドメイン利用時は明示設定を推奨します。

### Supabase の一時停止対策（keep-alive）

無料枠は約7日間アクセスがないとプロジェクトが一時停止します。Vercel Cron が毎日 `/api/keep-alive` を叩き、Supabase に軽いクエリを送って停止を防ぎます。

- スケジュール: 毎日 15:00 UTC（0:00 JST）
- 設定: `vercel.json` の `crons`
- 保護: `CRON_SECRET` を設定すると `Authorization: Bearer <CRON_SECRET>` が必須になります（Vercel Cron は自動で付与）

手動確認:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<本番ドメイン>/api/keep-alive
```

### 3. 認証 URL を本番に合わせる

- **Supabase** (Authentication → URL Configuration)
  - Site URL: `https://<本番ドメイン>`
  - Redirect URLs に `https://<本番ドメイン>/auth/callback` を追加
- **Google Cloud Console** (OAuth クライアント)
  - 承認済みリダイレクト URI に `https://<プロジェクトref>.supabase.co/auth/v1/callback`

### 4. DB / Storage の確認

本番 Supabase に `supabase/schema.sql` と `supabase/migrations/` を適用し、`owned-item-images` バケットが存在することを確認してください。

