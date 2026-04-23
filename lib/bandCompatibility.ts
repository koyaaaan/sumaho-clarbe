import type { CarrierBandDetail } from "@/types/device";

// ===== 日本の主要キャリア必須バンド定義 =====

export type CarrierName = "docomo" | "au" | "softbank" | "rakuten";

type BandImportance = "essential" | "important" | "recommended";

interface RequiredBand {
  band: string;
  importance: BandImportance;
  note: string;
  impact: string; // 欠損時の実用影響
}

// ===== 同義/包含バンドの正規化 =====
const BAND_EQUIVALENCE_4G: Record<string, string[]> = {
  B26: ["B18"],
  B18: ["B26"],
};

// n77 (3.3-4.2GHz) は n78 (3.3-3.8GHz) を周波数的に包含する
// →「n78が必要な場合、n77があれば満たす」方向で定義
const BAND_EQUIVALENCE_5G: Record<string, string[]> = {
  n78: ["n77"],  // n78要件をn77で代替可能（n77⊃n78）
};

function hasBandOrEquivalent4G(deviceBands: Set<string>, required: string): boolean {
  if (deviceBands.has(required)) return true;
  const equivalents = BAND_EQUIVALENCE_4G[required];
  return equivalents ? equivalents.some((eq) => deviceBands.has(eq)) : false;
}

function hasBandOrEquivalent5G(deviceBands: Set<string>, required: string): boolean {
  if (deviceBands.has(required)) return true;
  const equivalents = BAND_EQUIVALENCE_5G[required];
  return equivalents ? equivalents.some((eq) => deviceBands.has(eq)) : false;
}

// ===== 4G バンド要件 =====
const CARRIER_REQUIRED_4G: Record<CarrierName, RequiredBand[]> = {
  docomo: [
    { band: "B1",  importance: "essential",    note: "2.1GHz 主力",          impact: "都市部で圏外多発" },
    { band: "B19", importance: "essential",    note: "800MHz プラチナバンド", impact: "屋内・地下で圏外" },
    { band: "B3",  importance: "important",    note: "1.8GHz 都市部補助",    impact: "混雑時に速度低下" },
    { band: "B21", importance: "recommended",  note: "1.5GHz 地方補助",      impact: "地方の一部で弱い" },
    { band: "B28", importance: "recommended",  note: "700MHz 補助",          impact: "エリア端で弱い" },
    { band: "B42", importance: "recommended",  note: "3.5GHz PREMIUM 4G",   impact: "高速通信に影響" },
  ],
  au: [
    { band: "B1",  importance: "essential",    note: "2.1GHz 主力",          impact: "都市部で圏外多発" },
    { band: "B18", importance: "essential",    note: "800MHz プラチナバンド", impact: "屋内・地下で圏外" },
    { band: "B3",  importance: "important",    note: "1.8GHz 都市部補助",    impact: "混雑時に速度低下" },
    { band: "B41", importance: "important",    note: "2.5GHz WiMAX 2+",     impact: "高速通信に影響" },
    { band: "B28", importance: "recommended",  note: "700MHz 補助",          impact: "エリア端で弱い" },
  ],
  softbank: [
    { band: "B1",  importance: "essential",    note: "2.1GHz 主力",          impact: "都市部で圏外多発" },
    { band: "B8",  importance: "essential",    note: "900MHz プラチナバンド", impact: "屋内・地下で圏外" },
    { band: "B3",  importance: "important",    note: "1.8GHz 都市部補助",    impact: "混雑時に速度低下" },
    { band: "B41", importance: "important",    note: "2.5GHz AXGP",         impact: "高速通信に影響" },
    { band: "B28", importance: "recommended",  note: "700MHz 補助",          impact: "エリア端で弱い" },
  ],
  rakuten: [
    { band: "B3",  importance: "essential",    note: "1.8GHz 自社回線",      impact: "楽天エリアで通信不可" },
    { band: "B18", importance: "important",    note: "800MHz パートナー(au)", impact: "楽天圏外時に繋がらない" },
  ],
};

// ===== 5G バンド要件（日本の実際の周波数割当に基づく） =====
// docomo: 3.7GHz帯(n78) + 4.5GHz帯(n79) を割当
// au: 3.7GHz帯(n77/n78) + 700MHz NR(n28) を割当
// SoftBank: 3.9GHz帯(n77必須 ※n78の3.3-3.8GHz範囲外) を割当
// 楽天: 3.7GHz帯(n77) を割当
// n257(ミリ波28GHz)は日本で極めて限定的なため対象外
const CARRIER_REQUIRED_5G: Record<CarrierName, RequiredBand[]> = {
  docomo: [
    { band: "n78", importance: "essential",    note: "3.7GHz Sub-6 主力",    impact: "docomo 5Gに接続不可" },
    { band: "n79", importance: "important",    note: "4.5GHz docomo専用",    impact: "docomo 5Gエリアの約半分で非対応" },
  ],
  au: [
    { band: "n77", importance: "essential",    note: "3.7GHz Sub-6 主力",    impact: "au 5Gに接続不可" },
    { band: "n28", importance: "important",    note: "700MHz 5G転用",        impact: "広域5Gで非対応" },
  ],
  softbank: [
    { band: "n77", importance: "essential",    note: "3.9GHz Sub-6 主力",    impact: "SoftBank 5Gに接続不可" },
    { band: "n3",  importance: "important",    note: "1.8GHz 5G転用",        impact: "広域5Gで非対応" },
  ],
  rakuten: [
    { band: "n77", importance: "essential",    note: "3.7GHz Sub-6 主力",    impact: "楽天5Gに接続不可" },
  ],
};

// ===== 互換性判定結果 =====

export type CompatLevel = "ok" | "warning" | "caution" | "critical";

export interface BandIssue {
  band: string;
  importance: BandImportance;
  impact: string;
}

export interface CompatResult {
  carrier: CarrierName;
  carrierLabel: string;
  level: CompatLevel;
  fourGIssues: BandIssue[];
  fiveGIssues: BandIssue[];
  summary: string;
}

const CARRIER_LABELS: Record<CarrierName, string> = {
  docomo: "docomo",
  au: "au",
  softbank: "SoftBank",
  rakuten: "楽天モバイル",
};

// ===== 互換性チェック関数 =====

function checkBands4G(
  deviceBands: Set<string>,
  required: RequiredBand[]
): BandIssue[] {
  return required
    .filter(({ band }) => !hasBandOrEquivalent4G(deviceBands, band))
    .map(({ band, importance, impact }) => ({ band, importance, impact }));
}

function checkBands5G(
  deviceBands: Set<string>,
  required: RequiredBand[]
): BandIssue[] {
  return required
    .filter(({ band }) => !hasBandOrEquivalent5G(deviceBands, band))
    .map(({ band, importance, impact }) => ({ band, importance, impact }));
}

function deriveLevel(fourGIssues: BandIssue[], fiveGIssues: BandIssue[]): CompatLevel {
  // 4G essential 欠損 → critical
  if (fourGIssues.some((i) => i.importance === "essential")) return "critical";
  // 4G important 欠損 → warning
  if (fourGIssues.some((i) => i.importance === "important")) return "warning";
  // 5G essential 欠損 → warning（4Gは使えるので critical ではない）
  if (fiveGIssues.some((i) => i.importance === "essential")) return "warning";
  // recommended のみ or 5G important 欠損 → caution
  if (fourGIssues.length > 0 || fiveGIssues.some((i) => i.importance === "important")) return "caution";
  if (fiveGIssues.length > 0) return "caution";
  return "ok";
}

function buildSummary(level: CompatLevel, fourGIssues: BandIssue[], fiveGIssues: BandIssue[]): string {
  if (level === "ok") return "全バンド対応";
  const parts: string[] = [];
  const fourGCritical = fourGIssues.filter((i) => i.importance === "essential");
  const fourGImportant = fourGIssues.filter((i) => i.importance === "important");
  const fourGRec = fourGIssues.filter((i) => i.importance === "recommended");
  const fiveGMissing = fiveGIssues.filter((i) => i.importance !== "recommended");

  if (fourGCritical.length > 0) {
    parts.push(`4Gプラチナ欠損: ${fourGCritical.map((i) => i.band).join("・")}`);
  }
  if (fourGImportant.length > 0) {
    parts.push(`4G重要帯域不足: ${fourGImportant.map((i) => i.band).join("・")}`);
  }
  if (fourGRec.length > 0) {
    parts.push(`4G補助不足: ${fourGRec.map((i) => i.band).join("・")}`);
  }
  if (fiveGMissing.length > 0) {
    parts.push(`5G不足: ${fiveGMissing.map((i) => i.band).join("・")}`);
  }
  return parts.join(" / ");
}

export function checkCarrierCompat(
  detail: CarrierBandDetail,
  targetCarrier: CarrierName
): CompatResult {
  const fourGBands = new Set(detail.fourG);
  const fiveGBands = new Set(detail.fiveG);

  const fourGIssues = checkBands4G(fourGBands, CARRIER_REQUIRED_4G[targetCarrier]);
  const fiveGIssues = checkBands5G(fiveGBands, CARRIER_REQUIRED_5G[targetCarrier]);

  const level = deriveLevel(fourGIssues, fiveGIssues);
  const summary = buildSummary(level, fourGIssues, fiveGIssues);

  return {
    carrier: targetCarrier,
    carrierLabel: CARRIER_LABELS[targetCarrier],
    level,
    fourGIssues,
    fiveGIssues,
    summary,
  };
}

// ===== 全キャリア互換性チェック =====

export function checkAllCarrierCompat(
  detail: CarrierBandDetail
): CompatResult[] {
  return (["docomo", "au", "softbank", "rakuten"] as CarrierName[]).map(
    (carrier) => checkCarrierCompat(detail, carrier)
  );
}

export { CARRIER_LABELS };
