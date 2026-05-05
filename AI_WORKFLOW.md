# AI_WORKFLOW.md

# スマホクラーベ AI開発運用ルール

Claude Code、Codex、ローカルLLM、ChatGPTを使って、制作・チェック・修正サイクルを安定させるための説明書です。

## 1. 役割分担

```text
Claude Code：制作・修正担当
Codex：レビュー・別視点チェック担当
ローカルLLM：軽量チェック・差分要約担当
ChatGPT：全体設計・プロンプト作成・最終判断担当
```

## 2. 基本サイクル

```text
1. 作業内容を決める
2. mainから作業ブランチを切る
3. Claude Codeに制作させる
4. npm run validate / npm run build
5. Codexに差分レビューさせる
6. ローカルLLMに軽量チェックさせる
7. 必要ならClaude Codeに修正させる
8. ChatGPTに結果を貼って最終確認
9. mainへ反映
10. Vercelで本番確認
11. メモ・リレーmd更新
```

## 3. Git運用

```bash
git checkout main
git pull
git checkout -b feature/add-iphone-14-pro
```

作業後:

```bash
npm run validate
npm run build
git status
git diff --stat
```

コミット:

```bash
git add .
git commit -m "Add iPhone 14 Pro models"
git push -u origin feature/add-iphone-14-pro
```

## 4. Claude Codeの使い方

Claude Codeは「制作・修正」に使います。

向いている作業:

- 機種JSON追加
- 既存JSON修正
- sitemap.ts / robots.ts追加
- OGP metadata追加
- 軽いUI修正
- 未使用変数Warning修正
- validateエラー修正

慎重に扱う作業:

- 広告配置の大量追加
- 比較UIの大改修
- 型定義の大変更
- バンド互換ロジック変更
- SEO目的の大量ページ生成

### Claude Codeへの基本プロンプト

```text
CLAUDE.mdを読んだうえで、スマホクラーベの作業をしてください。

今回の作業:
【ここに作業内容を書く】

重要ルール:
- mainに直接作業せず、可能なら作業ブランチで行う
- UI大改修はしない
- AdSense審査中なので未完成ページを増やさない
- 既存JSON構造・型定義に完全準拠する
- 不明情報は無理に埋めず、既存ルールに従って null または注記にする
- 型やキーを勝手に増やさない
- 作業後に必ず npm run validate と npm run build を実行する
- エラーが出た場合は最小限の修正だけ行う

最後に報告してください:
- 作成/変更したファイル
- 実行したコマンド
- validate結果
- build結果
- 未確定情報
- pushしてよいか
```

## 5. Codexの使い方

Codexは最初は「レビュー専用」として使います。

```text
スマホクラーベの差分レビューをしてください。

目的:
Claude Codeが行った変更について、実装ミス・JSON構造の不整合・型崩れ・AdSense審査中に危険な変更がないか確認してください。

確認してほしいこと:
- JSON構造が既存機種と一致しているか
- Device型と矛盾していないか
- SpecKeyにないキーを増やしていないか
- 旧名称SpecDBがUIやmetadataに復活していないか
- AdSense審査中に危険な変更がないか
- 未完成ページやTODO文言が混ざっていないか
- 機種スペックに明らかな単位ミスや矛盾がないか

出力形式:
1. 判定: 問題なし / 要修正 / 危険
2. 必ず直すべき点
3. 後回しでよい点
4. 追加確認すべきファイル
5. mainに反映してよいか
```

## 6. ローカルLLMの使い方

ローカルLLMは、軽い定型チェックに使います。

向いている作業:

- git diffの要約
- 旧名称SpecDBの残存チェック
- TODO / FIXME / 追記してください の検出
- JSONの表記ゆれチェック
- mdメモ作成
- 作業ログ整理

```text
以下のgit diffを軽量レビューしてください。

確認対象:
- 旧名称SpecDBの復活
- TODO / FIXME / 追記してください の残存
- 未完成文言
- 広告審査上危険な表現
- JSONの明らかな構文ミス
- 表記ゆれ

大きな設計改善提案は不要です。
出力は以下だけにしてください。

1. 問題
2. 該当箇所
3. 修正案
```

## 7. 毎回実行するチェック

```bash
npm run validate
npm run build
git status
git diff --stat
grep -R "SpecDB" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git || true
grep -R "TODO\|FIXME\|追記してください" app components data README.md || true
```

## 8. リレーmd更新ルール

以下の節目で必ずメモを作ります。

- 機種追加後
- デプロイ後
- AdSense関連の状態変更後
- Cloudflare / Vercel / Search Console設定変更後
- チャット上限が近づいた時
- Claude Codeの大きな作業後
