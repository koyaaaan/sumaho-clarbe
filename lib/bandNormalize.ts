// ===== バンド表記の正規化・バリデーション =====
// 目的: データ投入時の表記揺れを防ぎ、一貫した命名を保証する
//
// 正規化ルール:
//   4G/LTE: "B" + 数字（大文字B）  例: B1, B3, B18, B41
//   5G NR:  "n" + 数字（小文字n）  例: n77, n78, n79, n257
//
// 受け入れ可能な入力例:
//   "b18" → "B18"    "Band 18" → "B18"    "LTE Band 1" → "B1"
//   "N77" → "n77"    "nr77" → "n77"       "NR Band 77" → "n77"

// ===== 日本キャリアで実際に使われるバンド一覧 =====
// 定義の実体は data/valid-bands-jp.json（validate-bands.js と共有）

import validBandsJp from "@/data/valid-bands-jp.json";

/** 日本の4G LTEバンド（キャリア割当が存在するもの） */
export const VALID_4G_BANDS = validBandsJp.fourG as readonly string[];

/** 日本の5G NRバンド */
export const VALID_5G_BANDS = validBandsJp.fiveG as readonly string[];

export type Valid4GBand = string;
export type Valid5GBand = string;

const VALID_4G_SET = new Set<string>(VALID_4G_BANDS);
const VALID_5G_SET = new Set<string>(VALID_5G_BANDS);

// ===== 正規化関数 =====

/**
 * バンド文字列を正規形に変換
 * @returns 正規化されたバンド名、またはパース不能なら null
 *
 * @example
 * normalizeBand("b18")        → "B18"
 * normalizeBand("Band 18")    → "B18"
 * normalizeBand("N77")        → "n77"
 * normalizeBand("nr77")       → "n77"
 * normalizeBand("NR Band 77") → "n77"
 * normalizeBand("garbage")    → null
 */
export function normalizeBand(input: string): string | null {
  const s = input.trim();

  // 5G NRパターン: n/N/nr/NR + 数字
  const nrMatch = s.match(/^(?:NR\s*(?:Band\s*)?|nr\s*(?:band\s*)?|n|N)(\d+)$/i);
  if (nrMatch) {
    return `n${nrMatch[1]}`;
  }

  // 4G LTEパターン: B/b/Band/LTE Band + 数字
  const lteMatch = s.match(/^(?:LTE\s*)?(?:Band\s*)?(?:b|B)(?:and\s*)?(\d+)$/i);
  if (lteMatch) {
    return `B${lteMatch[1]}`;
  }

  return null;
}

/**
 * バンド配列を正規化し、重複除去・ソートして返す
 * 無効なバンド名はerrorsに収集
 */
export function normalizeBandArray(
  bands: string[],
  type: "4G" | "5G"
): { normalized: string[]; errors: string[] } {
  const normalized: string[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const raw of bands) {
    const norm = normalizeBand(raw);
    if (norm === null) {
      errors.push(`パース不能: "${raw}"`);
      continue;
    }

    const validSet = type === "4G" ? VALID_4G_SET : VALID_5G_SET;
    if (!validSet.has(norm)) {
      errors.push(`日本未割当: "${raw}" → ${norm}`);
      // 警告だが通す（海外バンドの可能性）
    }

    if (seen.has(norm)) {
      errors.push(`重複: "${raw}" → ${norm}`);
      continue;
    }

    seen.add(norm);
    normalized.push(norm);
  }

  // ソート: 数字部分でソート
  normalized.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  return { normalized, errors };
}

// ===== バリデーション =====

export interface ValidationError {
  field: string;
  message: string;
}

export interface CarrierBandInput {
  modelNumber: string;
  fiveG: string[];
  fourG: string[];
  missingBands?: string[];
}

/**
 * CarrierBandDetail入力を検証・正規化
 */
export function validateCarrierBandInput(
  input: CarrierBandInput,
  label: string
): { normalized: CarrierBandInput; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // 型番チェック
  if (!input.modelNumber || input.modelNumber.trim() === "") {
    errors.push({ field: `${label}.modelNumber`, message: "型番が空です" });
  }

  // 5Gバンド正規化
  const fiveG = normalizeBandArray(input.fiveG, "5G");
  fiveG.errors.forEach((e) =>
    errors.push({ field: `${label}.fiveG`, message: e })
  );

  // 4Gバンド正規化
  const fourG = normalizeBandArray(input.fourG, "4G");
  fourG.errors.forEach((e) =>
    errors.push({ field: `${label}.fourG`, message: e })
  );

  // missingBandsは4Gバンドとして正規化
  let missingNorm: string[] = [];
  if (input.missingBands && input.missingBands.length > 0) {
    const missing = normalizeBandArray(input.missingBands, "4G");
    missing.errors.forEach((e) =>
      errors.push({ field: `${label}.missingBands`, message: e })
    );
    missingNorm = missing.normalized;

    // missingBandsとfourGに重複がないか
    const fourGSet = new Set(fourG.normalized);
    missingNorm.forEach((b) => {
      if (fourGSet.has(b)) {
        errors.push({
          field: `${label}.missingBands`,
          message: `${b} が fourG と missingBands の両方に存在`,
        });
      }
    });
  }

  // 4Gが空の場合は警告
  if (fourG.normalized.length === 0) {
    errors.push({ field: `${label}.fourG`, message: "4Gバンドが0件です" });
  }

  return {
    normalized: {
      modelNumber: input.modelNumber.trim(),
      fiveG: fiveG.normalized,
      fourG: fourG.normalized,
      missingBands: missingNorm,
    },
    errors,
  };
}
