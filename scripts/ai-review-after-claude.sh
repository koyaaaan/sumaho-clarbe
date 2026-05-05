#!/usr/bin/env bash
set -u

mkdir -p reports

REPORT="reports/ai-review-latest.md"
TMP="reports/ai-review-input.txt"
RAW="reports/ai-review-raw.txt"

# validate/build/codex それぞれの終了コードを追跡
FINAL_EXIT=0

# ──────────────────────────────────────────
# レビュー入力ファイルを構築
# ──────────────────────────────────────────
echo "# AIレビュー入力" > "$TMP"
echo "" >> "$TMP"

echo "## 日時" >> "$TMP"
date >> "$TMP"
echo "" >> "$TMP"

echo "## git branch" >> "$TMP"
git branch --show-current >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git status" >> "$TMP"
git status --short >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git diff --stat (unstaged)" >> "$TMP"
git diff --stat >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git diff --cached --stat (staged)" >> "$TMP"
git diff --cached --stat >> "$TMP" 2>&1
echo "" >> "$TMP"

if git rev-parse origin/main >/dev/null 2>&1; then
  echo "## git diff origin/main...HEAD --stat (committed branch changes)" >> "$TMP"
  git diff origin/main...HEAD --stat >> "$TMP" 2>&1
  echo "" >> "$TMP"
else
  echo "## git diff origin/main...HEAD --stat (committed branch changes)" >> "$TMP"
  echo "(origin/main が存在しないためスキップ)" >> "$TMP"
  echo "" >> "$TMP"
fi

echo "## untracked files" >> "$TMP"
git ls-files --others --exclude-standard >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## validate result" >> "$TMP"
npm run validate >> "$TMP" 2>&1
VALIDATE_EXIT=$?
echo "validate_exit=$VALIDATE_EXIT" >> "$TMP"
echo "" >> "$TMP"
[ "$VALIDATE_EXIT" -ne 0 ] && FINAL_EXIT=1

echo "## build result" >> "$TMP"
npm run build >> "$TMP" 2>&1
BUILD_EXIT=$?
echo "build_exit=$BUILD_EXIT" >> "$TMP"
echo "" >> "$TMP"
[ "$BUILD_EXIT" -ne 0 ] && FINAL_EXIT=1

echo "## forbidden text check" >> "$TMP"
{
  grep -R "SpecDB" app components data README.md 2>/dev/null || true
  grep -R "TODO\|FIXME\|追記してください" app components data README.md 2>/dev/null || true
} >> "$TMP"
echo "" >> "$TMP"

echo "## git diff (unstaged)" >> "$TMP"
git diff >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git diff --cached (staged)" >> "$TMP"
git diff --cached >> "$TMP" 2>&1
echo "" >> "$TMP"

if git rev-parse origin/main >/dev/null 2>&1; then
  echo "## git diff origin/main...HEAD (committed branch changes)" >> "$TMP"
  git diff origin/main...HEAD >> "$TMP" 2>&1
  echo "" >> "$TMP"
fi

echo "## untracked file previews" >> "$TMP"
while IFS= read -r f; do
  if [ -f "$f" ]; then
    echo "" >> "$TMP"
    echo "### $f" >> "$TMP"
    sed -n '1,220p' "$f" >> "$TMP" 2>&1
  fi
done < <(git ls-files --others --exclude-standard)

# ──────────────────────────────────────────
# codex が使えない場合はフォールバックレポートを書いて終了
# ──────────────────────────────────────────
if ! command -v codex >/dev/null 2>&1; then
  {
    echo "# AIレビューレポート"
    echo ""
    echo "生成日時: $(date)"
    echo ""
    echo "## ステータス"
    echo ""
    echo "**Codex実行に失敗しました: codex コマンドが見つかりません**"
    echo ""
    echo "Codex CLIのインストールまたはログイン状態を確認してください。"
    echo ""
    echo "## validate/build"
    echo ""
    echo "- validate_exit=$VALIDATE_EXIT"
    echo "- build_exit=$BUILD_EXIT"
    echo ""
    echo "## 参考"
    echo ""
    echo "- レビュー入力: $TMP"
  } > "$REPORT"
  echo ""
  echo "Codex command not found. Input saved to: $TMP"
  echo "Review report saved to: $REPORT"
  exit 1
fi

# ──────────────────────────────────────────
# Codex を実行し raw 出力を保存
# ──────────────────────────────────────────
{
  cat prompts/codex-review.md
  echo ""
  echo "---"
  echo ""
  cat "$TMP"
} | codex exec - > "$RAW" 2>&1
CODEX_EXIT=$?

# ──────────────────────────────────────────
# マーカー間のレビュー結果を抽出
# ──────────────────────────────────────────
EXTRACTED=$(awk \
  '/<<<CODEX_REVIEW_RESULT_START>>>/{found=1; buf=""; next} \
   /<<<CODEX_REVIEW_RESULT_END>>>/{if(found){last=buf}; found=0; next} \
   found{buf=(buf==""?$0:buf"\n"$0)} \
   END{print last}' \
  "$RAW")

# ──────────────────────────────────────────
# レポートを構築（成否にかかわらず必ず書く）
# ──────────────────────────────────────────
{
  echo "# AIレビューレポート"
  echo ""
  echo "生成日時: $(date)"
  echo "入力ファイル: $TMP"
  echo "Codex raw output: $RAW"
  echo ""

  echo "## validate/build"
  echo ""
  echo "- validate_exit=$VALIDATE_EXIT"
  echo "- build_exit=$BUILD_EXIT"
  echo ""

  if [ "$CODEX_EXIT" -ne 0 ]; then
    echo "## ステータス"
    echo ""
    echo "**Codex実行に失敗しました (exit code: $CODEX_EXIT)**"
    echo ""
    echo "Codex raw output を確認してください: $RAW"
    echo ""
  fi

  if [ -n "$EXTRACTED" ]; then
    echo "## レビュー結果"
    echo ""
    echo "$EXTRACTED"
  else
    echo "## レビュー結果"
    echo ""
    echo "**マーカー \`<<<CODEX_REVIEW_RESULT_START>>>\` が見つかりませんでした。**"
    echo "Codex raw output を確認してください: $RAW"
  fi

  echo ""
  echo "---"
  echo ""
  echo "## Codex raw output"
  echo ""
  cat "$RAW"
} > "$REPORT"

# ──────────────────────────────────────────
# 終了コードの決定
# ──────────────────────────────────────────
if [ "$CODEX_EXIT" -ne 0 ]; then
  echo ""
  echo "Codex exited with code $CODEX_EXIT. Review report saved to: $REPORT"
  exit 1
fi

if [ -z "$EXTRACTED" ]; then
  echo ""
  echo "Marker not found in Codex output. Review report saved to: $REPORT"
  exit 1
fi

echo ""
echo "Codex review saved to: $REPORT"
echo ""
exit "$FINAL_EXIT"
