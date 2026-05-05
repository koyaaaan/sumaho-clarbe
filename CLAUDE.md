# CLAUDE.md

## プロジェクト概要

このプロジェクトは、スマートフォン比較アプリ「スマホクラーベ」です。

- 正式名称: スマホクラーベ
- サブタイトル: 価格・サイズ・性能を比べて選べる
- 公開URL: https://www.sumahoclarbe.com
- 技術構成: Next.js / TypeScript / 静的JSON / Vercel / Cloudflare DNS

## 重要方針

- Phase1ではバックエンド・DB・認証は不要
- 現在AdSense審査待ちのため、サイト構造を大きく壊す変更は禁止
- UI大改修より、安定稼働とデータ追加を優先
- 旧名称「SpecDB」はユーザー向けUI・metadata・README見出しに復活させない
- `SpecKey` や内部的な `spec` という語は必要なら残してよい
- 実ファイルを正とし、古いmdや過去の説明を優先しない
- 変更後は必ず validate / build を通す

## 毎回必ず実行するコマンド

```bash
npm run validate
npm run build
```

必要に応じて以下も実行する。

```bash
git status
git diff --stat
grep -R "SpecDB" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git || true
grep -R "TODO\|FIXME\|追記してください" app components data README.md || true
```

## 機種JSON追加ルール

- 既存JSON構造に完全準拠する
- 型やキーを勝手に増やさない
- Device型と矛盾させない
- 不明情報は既存ルールに合わせて `null` または注記にする
- カメラセンサー、販路、OS更新期間、バンド、バンドロックを落とさない
- 国内版 / 海外版の差異が分かる場合は既存形式に合わせて記載する
- B18/B26などの同義バンド処理ロジックは勝手に変更しない
- `types/device.ts`、`data/spec-fields.ts`、既存の同ブランド機種を確認してから追加する

## AdSense審査中の禁止事項

- 広告枠を大量追加しない
- 未完成ページを増やさない
- 比較表の中に広告を置かない
- 機種追加ボタン付近、URLコピー付近、stickyヘッダー内に広告を置かない
- 「広告をクリックしてください」などのクリック誘導文言を入れない
- プライバシーポリシーやお問い合わせページを壊さない
- 公開中サイトが404やForbiddenになる変更をしない

## UI修正ルール

- 大規模リファクタより、問題箇所の最小修正を優先
- スマホ幅での表示崩れを重視
- HTML試作時に良かった情報量を落とさない
- 販路表示、カメラセンサー、OSアップデート期間、詳細バンド、バンドロックは重要項目として維持する

## 作業報告形式

作業後は必ず以下を報告する。

```text
- 作成したファイル
- 変更したファイル
- 実行したコマンド
- validate結果
- build結果
- 未確定情報
- pushしてよいか
```
