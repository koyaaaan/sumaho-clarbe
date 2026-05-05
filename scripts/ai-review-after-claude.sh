#!/usr/bin/env bash
set -u

mkdir -p reports

REPORT="reports/ai-review-latest.md"
TMP="reports/ai-review-input.txt"

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

echo "## git diff --stat" >> "$TMP"
git diff --stat >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git diff --cached --stat" >> "$TMP"
git diff --cached --stat >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## untracked files" >> "$TMP"
git ls-files --others --exclude-standard >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## validate result" >> "$TMP"
npm run validate >> "$TMP" 2>&1
VALIDATE_EXIT=$?
echo "" >> "$TMP"
echo "validate_exit=$VALIDATE_EXIT" >> "$TMP"
echo "" >> "$TMP"

echo "## build result" >> "$TMP"
npm run build >> "$TMP" 2>&1
BUILD_EXIT=$?
echo "" >> "$TMP"
echo "build_exit=$BUILD_EXIT" >> "$TMP"
echo "" >> "$TMP"

echo "## forbidden text check" >> "$TMP"
{
  grep -R "SpecDB" app components data README.md 2>/dev/null || true
  grep -R "TODO\|FIXME\|追記してください" app components data README.md 2>/dev/null || true
} >> "$TMP"
echo "" >> "$TMP"

echo "## git diff" >> "$TMP"
git diff >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## git diff --cached" >> "$TMP"
git diff --cached >> "$TMP" 2>&1
echo "" >> "$TMP"

echo "## untracked file previews" >> "$TMP"
while IFS= read -r f; do
  if [ -f "$f" ]; then
    echo "" >> "$TMP"
    echo "### $f" >> "$TMP"
    sed -n '1,220p' "$f" >> "$TMP" 2>&1
  fi
done < <(git ls-files --others --exclude-standard)

if ! command -v codex >/dev/null 2>&1; then
  {
    echo "# Codexレビュー結果"
    echo ""
    echo "## 判定"
    echo "要修正"
    echo ""
    echo "## 必ず直すべき点"
    echo "- codex コマンドが見つかりません。Codex CLIのインストールまたはログイン状態を確認してください。"
    echo ""
    echo "## 参考"
    echo "- レビュー入力は reports/ai-review-input.txt に保存されています。"
  } > "$REPORT"
  echo ""
  echo "Codex command not found. Input saved to: $TMP"
  echo "Review report saved to: $REPORT"
  exit 0
fi

{
  cat prompts/codex-review.md
  echo ""
  echo "---"
  echo ""
  cat "$TMP"
} | codex exec - > "$REPORT" 2>&1

echo ""
echo "Codex review saved to: $REPORT"
echo ""
