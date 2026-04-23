// ===== OSバージョン解析（UI非依存のドメインロジック） =====

/**
 * 初期OS文字列から最終到達バージョンを計算
 * "Android 15 / One UI 7", 7 → "〜Android 21"
 * "iOS 18", 6 → "〜iOS 23"
 */
export function computeUntilVersion(
  initialOs: string,
  updateYears: number
): string | null {
  const androidMatch = initialOs.match(/Android\s*(\d+)/);
  if (androidMatch) {
    return `〜Android ${parseInt(androidMatch[1], 10) + updateYears - 1}`;
  }
  const iosMatch = initialOs.match(/iOS\s*(\d+)/);
  if (iosMatch) {
    return `〜iOS ${parseInt(iosMatch[1], 10) + updateYears - 1}`;
  }
  return null;
}

// ===== OS世代バッジスタイル =====

export interface GenerationStyle {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  barWidth: string;
}

export function getGenerationStyle(years: number): GenerationStyle {
  if (years >= 7) return {
    badgeBg: "rgba(251,191,36,0.15)",
    badgeText: "#fbbf24",
    badgeBorder: "rgba(251,191,36,0.3)",
    barColor: "linear-gradient(90deg,#fbbf24,rgba(251,191,36,0.3))",
    barWidth: "100%",
  };
  if (years >= 5) return {
    badgeBg: "rgba(59,130,246,0.10)",
    badgeText: "#93c5fd",
    badgeBorder: "rgba(59,130,246,0.25)",
    barColor: "linear-gradient(90deg,#60a5fa,rgba(96,165,250,0.3))",
    barWidth: "71%",
  };
  if (years >= 4) return {
    badgeBg: "rgba(59,130,246,0.10)",
    badgeText: "#93c5fd",
    badgeBorder: "rgba(59,130,246,0.25)",
    barColor: "linear-gradient(90deg,#60a5fa,rgba(96,165,250,0.3))",
    barWidth: "57%",
  };
  return {
    badgeBg: "rgba(100,116,139,0.15)",
    badgeText: "#94a3b8",
    badgeBorder: "rgba(100,116,139,0.25)",
    barColor: "linear-gradient(90deg,#94a3b8,rgba(148,163,184,0.3))",
    barWidth: "43%",
  };
}

// ===== バンドロック判定 =====

export type BandLockStatus = "free" | "locked" | "unknown";

export function parseBandLockStatus(value: string): BandLockStatus {
  if (value.includes("なし")) return "free";
  if (value.includes("あり") || value.includes("制限")) return "locked";
  return "unknown";
}
