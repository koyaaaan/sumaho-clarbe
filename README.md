# スマホクラーベ - 価格・サイズ・性能を比べて選べる

スマートフォンの価格・サイズ・性能を比べて選べるWebアプリケーション。

## 特徴

- **複数台同時比較** — 3台以上同時に比較可能
- **カテゴリON/OFF** — 表示項目をカスタマイズ
- **差分ハイライト** — 優劣を色分け表示
- **URL共有** — 比較結果をURLで共有
- **型安全** — SpecKeyリテラル型でtypoを防止

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で開きます。

## バリデーション

```bash
npm run validate:bands    # carrierBands / バンド表記の検証（バンド専用）
npm run validate:devices  # index.json ↔ devices/*.json 整合・必須項目・variant警告など
npm run validate          # 上記を両方実行（推奨）
```

> ⚠️ `validate:bands` はバンド表記専用です。devices全体の整合性は保証しません。  
> 新機種追加時は **必ず両方** 実行してください。

## フォルダ構成

```
specdb/
├── app/              ← Next.js App Router (1ページのみ)
├── components/       ← UIコンポーネント
├── lib/              ← ビジネスロジック（UI非依存）
│   ├── comparison.ts ← 差分計算（純粋関数）
│   ├── formatters.ts ← 表示フォーマット
│   ├── data.ts       ← データアクセス層（★移行時はここだけ差し替え）
│   └── url.ts        ← URLパラメータ同期
├── scripts/
│   ├── validate-bands.js   ← バンド表記専用バリデーター
│   └── validate-devices.js ← デバイスデータ整合バリデーター
├── store/            ← useReducer（不変設計）
├── types/            ← TypeScript型定義
└── data/             ← 静的JSONデータ
    ├── devices/      ← 1機種1ファイル
    ├── index.json    ← 機種一覧（軽量）
    └── spec-fields.ts ← スペック項目定義（型安全）
```

## 機種データを追加する

1. `data/devices/` に新しいJSONファイルを作成
2. `data/index.json` に軽量エントリを追加
3. `npm run validate` で両方の検証を通す
4. デプロイ（git push → Vercel自動ビルド）

### 機種追加時の注意

- スペック参照優先順位: メーカー公式 → キャリア公式PDF → 公式販売ページ → 有力メディア
- 未確認項目は `null`（勝手に推定値を補完しない）
- 非公式補完値を入れた場合は別メモで出典を管理すること
- `telephotoZoom` は望遠レンズ倍率のみ（クロップズーム・デジタルズームは含めない）
- `variant.*` は暫定設計（`"○"` / 店名 / `null` が混在する仕様）
- `imageUrl` を設定してもデプロイ前に実画像の存在を確認すること

## 技術スタック

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Vercel** (ホスティング)

## 設計方針

- `Object.assign` 禁止 — スプレッド構文による不変更新
- `lib/` はReact非依存 — 将来React Nativeで再利用可能
- `data.ts` がデータアクセス層 — Phase2でSupabaseに差し替え可能
- `spec-fields.ts` が表示定義 — JSONではなくTSで型安全を保証

## Phase2移行時

`lib/data.ts` の3関数をSupabase Client版に差し替えるだけ：
- `getDeviceList()` → Supabase query
- `getDevice(id)` → Supabase query
- `getSpecFields()` → Supabase query

コンポーネント・reducer・比較ロジックは変更不要。
