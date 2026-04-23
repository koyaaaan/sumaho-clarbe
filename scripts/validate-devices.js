#!/usr/bin/env node
/**
 * devices データ一括バリデーション
 * 使い方: node scripts/validate-devices.js
 *
 * チェック内容:
 * 1. index.json <-> data/devices/ の整合（IDの一致）
 * 2. index.json 内の重複ID
 * 3. 必須フィールドの存在（releaseDate, brandId, name, region, imageUrl）
 * 4. telephotoZoom が設定されているのに 望遠モジュール(rearModules) がない場合の警告
 * 5. variant.* の値混在（"○" / 店名 / null が混在）の警告
 * 6. null が多すぎる機種の警告（件数表示）
 *
 * ⚠️ このスクリプトは carrierBands の検証は行いません。
 *    バンドデータは npm run validate:bands で別途確認してください。
 */

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const devicesDir = path.join(dataDir, "devices");
const indexPath = path.join(dataDir, "index.json");

// NULL多すぎ警告の閾値
const NULL_WARN_THRESHOLD = 10;

// ===== ユーティリティ =====

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

let totalErrors = 0;
let totalWarnings = 0;
const errorLines = [];
const warnLines = [];

function err(msg) {
  totalErrors++;
  errorLines.push("  ❌ " + msg);
}

function warn(msg) {
  totalWarnings++;
  warnLines.push("  ⚠️ " + msg);
}

function info(msg) {
  warnLines.push("  💡 " + msg);
}

function flush(label) {
  if (errorLines.length > 0 || warnLines.length > 0) {
    console.log("\n📁 " + label);
    errorLines.forEach(l => console.log(l));
    warnLines.forEach(l => console.log(l));
  }
  errorLines.length = 0;
  warnLines.length = 0;
}

// ===== 1. index.json 読み込み =====

const indexEntries = readJson(indexPath);

// ===== 2. index.json の重複ID =====
console.log("📱 devices データバリデーション");
console.log("=".repeat(60));
console.log("\n[1] index.json 重複IDチェック");

const indexIds = indexEntries.map(e => e.id);
const idCount = {};
indexIds.forEach(id => {
  idCount[id] = (idCount[id] || 0) + 1;
});
let dupFound = false;
for (const [id, count] of Object.entries(idCount)) {
  if (count > 1) {
    console.log(`  ❌ 重複ID: "${id}" (${count}件)`);
    totalErrors++;
    dupFound = true;
  }
}
if (!dupFound) console.log("  ✅ 重複なし");

// ===== 3. index.json ↔ devices/*.json の整合 =====
console.log("\n[2] index.json ↔ devices/*.json 整合チェック");

const deviceFiles = fs.readdirSync(devicesDir).filter(f => f.endsWith(".json")).sort();
const deviceFileIds = new Set(deviceFiles.map(f => f.replace(".json", "")));
const indexIdSet = new Set(indexIds);

let mismatchFound = false;

for (const id of indexIdSet) {
  if (!deviceFileIds.has(id)) {
    console.log(`  ❌ index にあるのに devices/ ファイルがない: "${id}"`);
    totalErrors++;
    mismatchFound = true;
  }
}

for (const id of deviceFileIds) {
  if (!indexIdSet.has(id)) {
    console.log(`  ❌ devices/ ファイルがあるのに index にない: "${id}"`);
    totalErrors++;
    mismatchFound = true;
  }
}

if (!mismatchFound) console.log("  ✅ index ↔ devices 一致");

// ===== 4. index.json の必須フィールドチェック =====
console.log("\n[3] index.json 必須フィールドチェック (releaseDate, brandId, name, region, imageUrl)");

const INDEX_REQUIRED = ["releaseDate", "brandId", "name", "region", "imageUrl"];
let indexFieldErrors = 0;

for (const entry of indexEntries) {
  for (const field of INDEX_REQUIRED) {
    if (entry[field] === undefined || entry[field] === null || entry[field] === "") {
      console.log(`  ❌ ${entry.id}: "${field}" が未設定`);
      totalErrors++;
      indexFieldErrors++;
    }
  }
}
if (indexFieldErrors === 0) console.log("  ✅ 必須フィールドすべて存在");

// ===== 5. devices/*.json の個別チェック =====
console.log("\n[4] devices/*.json 個別チェック");

let variantMixedDevices = 0;
const nullSummary = [];

for (const file of deviceFiles) {
  const filePath = path.join(devicesDir, file);
  const device = readJson(filePath);
  const specs = device.specs || {};
  const deviceLabel = `${device.name || file} (${file})`;

  // -- (a) telephotoZoom vs rearModules --
  const zoom = specs["camera.telephotoZoom"];
  if (zoom !== null && zoom !== undefined) {
    const modules = specs["camera.rearModules"];
    const hasTele =
      Array.isArray(modules) &&
      modules.some(
        m =>
          (m.label || "").includes("望遠") ||
          (m.label || "").toLowerCase().includes("tele") ||
          (typeof m.zoom === "number" && m.zoom > 1)
      );
    if (!hasTele) {
      warn(
        `telephotoZoom=${zoom} が設定されているが、rearModules に望遠レンズが見つからない` +
        " （telephotoZoomはクロップズームを含まない定義を確認すること）"
      );
    }
  }

  // -- (b) variant.* の値混在チェック --
  const variantKeys = Object.keys(specs).filter(k => k.startsWith("variant."));
  if (variantKeys.length > 0) {
    const variantValues = variantKeys.map(k => specs[k]);
    const nonNull = variantValues.filter(v => v !== null);
    const hasCircle = nonNull.some(v => v === "○");
    const hasStoreName = nonNull.some(v => v !== "○");

    if (hasCircle && hasStoreName) {
      const mixed = variantKeys
        .filter(k => specs[k] !== null)
        .map(k => `${k.replace("variant.", "")}=${specs[k]}`)
        .join(", ");
      warn(`variant.* に "○" と店名が混在: [${mixed}]`);
      variantMixedDevices++;
    }
  }

  // -- (c) null が多すぎる警告 --
  const specValues = Object.values(specs);
  const nullCount = specValues.filter(v => v === null).length;
  const totalFields = specValues.length;
  if (nullCount >= NULL_WARN_THRESHOLD) {
    info(`null が ${nullCount}/${totalFields} フィールド（閾値: ${NULL_WARN_THRESHOLD}以上）`);
    nullSummary.push({ file, name: device.name, nullCount, totalFields });
  }

  flush(deviceLabel);
}

// ===== 6. NULL多すぎサマリー =====
if (nullSummary.length > 0) {
  console.log("\n[5] null 多数機種サマリー（降順）");
  nullSummary
    .sort((a, b) => b.nullCount - a.nullCount)
    .forEach(x =>
      console.log(`  💡 ${x.name} (${x.file}): null ${x.nullCount}/${x.totalFields}`)
    );
}

// ===== 結果サマリー =====
console.log("\n" + "=".repeat(60));
console.log("📊 結果サマリー");
console.log(`  対象機種数 (index.json): ${indexEntries.length}`);
console.log(`  対象ファイル数 (devices/): ${deviceFiles.length}`);

const brandCount = {};
indexEntries.forEach(e => {
  brandCount[e.brandId] = (brandCount[e.brandId] || 0) + 1;
});
Object.entries(brandCount).forEach(([brand, count]) => {
  console.log(`    - ${brand}: ${count}機種`);
});

console.log(`  ❌ エラー: ${totalErrors}`);
console.log(`  ⚠️/💡 警告: ${totalWarnings}`);

if (variantMixedDevices > 0) {
  console.log(`\n  ℹ️  variant 混在: ${variantMixedDevices}機種`);
  console.log("     variant.* は暫定設計です（\"○\"/店名/null が混在する仕様）。");
  console.log("     将来フェーズで販売有無・販路・未確認を分離してください。");
}

if (nullSummary.length > 0) {
  console.log(`\n  ℹ️  null 多数機種: ${nullSummary.length}件`);
  console.log("     将来機種・未発表スペックが含まれる場合があります。");
  console.log("     公式/非公式/推定を区別して出典管理することを推奨します。");
}

if (totalErrors === 0) {
  console.log("\n  ✅ エラーなし（警告は確認してください）");
} else {
  console.log("\n  ❌ エラーがあります。修正してから再実行してください。");
}

process.exit(totalErrors > 0 ? 1 : 0);
