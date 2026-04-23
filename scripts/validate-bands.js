#!/usr/bin/env node
/**
 * carrierBands データ一括バリデーション
 * 使い方: node scripts/validate-bands.js
 * 
 * チェック内容:
 * 1. バンド表記の正規化（揺れ検出）
 * 2. 日本未割当バンドの警告
 * 3. fourG と missingBands の重複検出
 * 4. 空データの警告
 * 5. shared フラグとキャリアキーの整合性
 */

const fs = require("fs");
const path = require("path");

// ===== 正規化ロジック（bandNormalize.ts と共通データソース: data/valid-bands-jp.json） =====

const validBandsJp = require(path.join(__dirname, "..", "data", "valid-bands-jp.json"));
const VALID_4G = new Set(validBandsJp.fourG);
const VALID_5G = new Set(validBandsJp.fiveG);

function normalizeBand(input) {
  const s = input.trim();
  const nrMatch = s.match(/^(?:NR\s*(?:Band\s*)?|nr\s*(?:band\s*)?|n|N)(\d+)$/i);
  if (nrMatch) return `n${nrMatch[1]}`;
  const lteMatch = s.match(/^(?:LTE\s*)?(?:Band\s*)?(?:b|B)(?:and\s*)?(\d+)$/i);
  if (lteMatch) return `B${lteMatch[1]}`;
  return null;
}

function checkBands(bands, type, label) {
  const errors = [];
  const validSet = type === "5G" ? VALID_5G : VALID_4G;
  const seen = new Set();

  for (const raw of bands) {
    const norm = normalizeBand(raw);
    if (norm === null) {
      errors.push(`  ❌ ${label}: パース不能 "${raw}"`);
      continue;
    }
    if (norm !== raw) {
      errors.push(`  ⚠️ ${label}: 表記揺れ "${raw}" → "${norm}"`);
    }
    if (!validSet.has(norm)) {
      errors.push(`  💡 ${label}: 日本未割当 "${raw}" (${norm})`);
    }
    if (seen.has(norm)) {
      errors.push(`  ❌ ${label}: 重複 "${raw}" (${norm})`);
    }
    seen.add(norm);
  }
  return { errors, normalized: seen };
}

// ===== メイン =====

const devicesDir = path.join(__dirname, "..", "data", "devices");
const files = fs.readdirSync(devicesDir).filter(f => f.endsWith(".json")).sort();

let totalErrors = 0;
let totalWarnings = 0;
let devicesWithBands = 0;
let devicesWithout = 0;

console.log("📱 carrierBands データバリデーション");
console.log("=".repeat(60));

for (const file of files) {
  const filePath = path.join(devicesDir, file);
  const device = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const cb = device.specs["connectivity.carrierBands"];
  const deviceName = device.name || file;
  const fileErrors = [];

  if (!cb || cb === null) {
    devicesWithout++;
    // bandLockフィールドチェック
    const bl = device.specs["connectivity.bandLock"];
    if (!bl) {
      fileErrors.push("  💡 carrierBands=null かつ bandLock未設定");
    }
    if (fileErrors.length > 0) {
      console.log(`\n📁 ${deviceName} (${file})`);
      fileErrors.forEach(e => console.log(e));
      totalWarnings += fileErrors.length;
    }
    continue;
  }

  devicesWithBands++;
  const carriers = ["docomo", "au", "softbank", "rakuten", "simfree"];
  const presentCarriers = carriers.filter(c => cb[c]);

  // shared整合性チェック
  if (cb.shared === true) {
    if (!cb.simfree) {
      fileErrors.push("  ❌ shared=true だが simfree キーがない");
    }
    ["docomo", "au", "softbank", "rakuten"].forEach(c => {
      if (cb[c]) fileErrors.push(`  ⚠️ shared=true だが ${c} キーが存在（冗長）`);
    });
  } else if (cb.shared === false) {
    if (cb.simfree) {
      fileErrors.push("  ⚠️ shared=false だが simfree キーが存在");
    }
    if (!cb.docomo && !cb.au) {
      fileErrors.push("  ❌ shared=false だが docomo/au どちらもない");
    }
  }

  // bandLock と shared の整合性
  const bl = device.specs["connectivity.bandLock"];
  if (typeof bl === "string") {
    const isFree = bl.includes("なし");
    const isLocked = bl.includes("あり") || bl.includes("制限");
    if (isFree && cb.shared === false) {
      fileErrors.push("  ⚠️ bandLock=なし だが shared=false（不整合の可能性）");
    }
    if (isLocked && cb.shared === true) {
      fileErrors.push("  ⚠️ bandLock=あり だが shared=true（不整合の可能性）");
    }
  }

  // 各キャリアのバンドチェック
  for (const carrier of presentCarriers) {
    const detail = cb[carrier];
    if (!detail) continue;

    if (detail.modelNumber === "未発表") continue;

    if (!detail.modelNumber || detail.modelNumber.trim() === "") {
      fileErrors.push(`  ❌ ${carrier}.modelNumber が空`);
    }

    // 5Gバンド
    const r5 = checkBands(detail.fiveG || [], "5G", `${carrier}.fiveG`);
    fileErrors.push(...r5.errors);

    // 4Gバンドが5Gに混入していないか
    for (const b of (detail.fiveG || [])) {
      const norm = normalizeBand(b);
      if (norm && norm.startsWith("B")) {
        fileErrors.push(`  ❌ ${carrier}.fiveG: 4Gバンド "${b}" が5G欄に混入`);
      }
    }

    // 4Gバンド
    const r4 = checkBands(detail.fourG || [], "4G", `${carrier}.fourG`);
    fileErrors.push(...r4.errors);

    // 5Gバンドが4Gに混入していないか
    for (const b of (detail.fourG || [])) {
      const norm = normalizeBand(b);
      if (norm && norm.startsWith("n")) {
        fileErrors.push(`  ❌ ${carrier}.fourG: 5Gバンド "${b}" が4G欄に混入`);
      }
    }

    // missingBands
    if (detail.missingBands && detail.missingBands.length > 0) {
      const rm = checkBands(detail.missingBands, "4G", `${carrier}.missingBands`);
      fileErrors.push(...rm.errors);

      // fourGとmissingBandsの重複
      for (const mb of detail.missingBands) {
        const norm = normalizeBand(mb);
        if (norm && r4.normalized.has(norm)) {
          fileErrors.push(`  ❌ ${carrier}: ${norm} がfourGとmissingBands両方に存在`);
        }
      }
    }

    // 4Gバンドが0件
    if (!detail.fourG || detail.fourG.length === 0) {
      fileErrors.push(`  ⚠️ ${carrier}.fourG が空（0バンド）`);
    }
  }

  if (fileErrors.length > 0) {
    console.log(`\n📁 ${deviceName} (${file})`);
    fileErrors.forEach(e => console.log(e));
    totalErrors += fileErrors.filter(e => e.includes("❌")).length;
    totalWarnings += fileErrors.filter(e => e.includes("⚠️") || e.includes("💡")).length;
  }
}

console.log("\n" + "=".repeat(60));
console.log(`📊 結果サマリー`);
console.log(`  機種数: ${files.length} (バンドあり: ${devicesWithBands}, なし: ${devicesWithout})`);
console.log(`  ❌ エラー: ${totalErrors}`);
console.log(`  ⚠️ 警告: ${totalWarnings}`);

if (totalErrors === 0 && totalWarnings === 0) {
  console.log("  ✅ 全データ正常！");
}

process.exit(totalErrors > 0 ? 1 : 0);
