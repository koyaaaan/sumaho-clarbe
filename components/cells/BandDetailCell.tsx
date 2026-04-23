import { useState } from "react";
import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";
import type { CarrierBands, CarrierBandDetail } from "@/types/device";
import { parseBandLockStatus } from "@/lib/osUtils";
import { checkAllCarrierCompat, type CompatResult, type CompatLevel } from "@/lib/bandCompatibility";

// ===== 型ガード =====

function isCarrierBands(v: unknown): v is CarrierBands {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "shared" in v;
}

// ===== スタイル =====

const COMPAT_STYLES: Record<CompatLevel, { bg: string; color: string; border: string; icon: string }> = {
  ok:       { bg: "rgba(16,185,129,0.08)", color: "#86efac", border: "rgba(16,185,129,0.2)", icon: "✅" },
  caution:  { bg: "rgba(234,179,8,0.06)",  color: "#fde68a", border: "rgba(234,179,8,0.15)", icon: "💡" },
  warning:  { bg: "rgba(245,158,11,0.08)", color: "#fcd34d", border: "rgba(245,158,11,0.2)", icon: "⚠️" },
  critical: { bg: "rgba(239,68,68,0.08)",  color: "#fca5a5", border: "rgba(239,68,68,0.2)",  icon: "❌" },
};

const CARRIER_COLORS: Record<string, string> = {
  docomo: "#ef4444", au: "#f97316", softbank: "#22c55e", rakuten: "#dc2626", simfree: "#3b82f6",
};

const BADGE_STYLES = {
  free:   { bg: "rgba(16,185,129,0.1)",  color: "#86efac", border: "rgba(16,185,129,0.25)", label: "バンドロックなし" },
  locked: { bg: "rgba(239,68,68,0.1)",   color: "#fca5a5", border: "rgba(239,68,68,0.2)",   label: "バンドロックあり" },
} as const;

// 日本キャリアの主要バンド（太字表示）
const KEY_4G = new Set(["B1", "B3", "B8", "B18", "B19", "B28"]);
const KEY_5G = new Set(["n77", "n78", "n79"]);

// ===== バンドタグ =====

function BandTag({ band, variant, isKey }: { band: string; variant: "supported" | "missing"; isKey?: boolean }) {
  const ok = variant === "supported";
  return (
    <span
      className="inline-block rounded px-1 py-px text-[9px] font-mono leading-tight"
      style={{
        background: ok ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.12)",
        color: ok ? (isKey ? "#4ade80" : "#86efac") : "#fca5a5",
        border: `1px solid ${ok ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
        textDecoration: ok ? "none" : "line-through",
        fontWeight: isKey ? 700 : 400,
      }}
    >
      {band}
    </span>
  );
}

// ===== バンド一覧（1行にまとめる） =====

function BandLine({ label, color, bands, keySet }: {
  label: string; color: string; bands: string[]; keySet: Set<string>;
}) {
  if (bands.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
      {bands.map((b) => <BandTag key={b} band={b} variant="supported" isKey={keySet.has(b)} />)}
    </div>
  );
}

// ===== キャリア版ブロック =====

function CarrierBlock({ carrier, detail }: { carrier: string; detail: CarrierBandDetail }) {
  const color = CARRIER_COLORS[carrier] ?? "#94a3b8";
  const label = carrier === "simfree" ? "SIMフリー" : carrier;

  return (
    <div className="rounded-md p-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mb-0.5 flex items-center gap-1.5">
        <span className="inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          {label}
        </span>
        <span className="text-[10px] text-gray-500">{detail.modelNumber}</span>
      </div>

      {detail.modelNumber === "未発表" ? (
        <span className="text-[10px] text-yellow-500">バンド詳細未発表</span>
      ) : (
        <div className="space-y-1">
          <BandLine label="5G" color="#60a5fa" bands={detail.fiveG} keySet={KEY_5G} />
          <BandLine label="4G" color="#4ade80" bands={detail.fourG} keySet={KEY_4G} />
          {detail.missingBands && detail.missingBands.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1 pt-1 border-t border-white/10">
              <span className="text-[9px] font-bold text-red-400">非対応</span>
              {detail.missingBands.map((b) => <BandTag key={b} band={b} variant="missing" />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== 互換性チェック =====

function CompatChecker({ detail }: { detail: CarrierBandDetail }) {
  const results = checkAllCarrierCompat(detail);
  if (detail.modelNumber === "未発表") return null;

  return (
    <div className="space-y-0.5">
      {results.map((r: CompatResult) => {
        const s = COMPAT_STYLES[r.level];
        return (
          <div key={r.carrier} className="flex items-start gap-1 rounded px-1.5 py-0.5"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-[10px] shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold" style={{ color: s.color }}>{r.carrierLabel}</span>
              {r.level !== "ok" && (
                <span className="ml-1 text-[9px]" style={{ color: s.color, opacity: 0.8 }}>{r.summary}</span>
              )}
            </div>
          </div>
        );
      })}
      <div className="text-[8px] text-gray-600 mt-0.5">※ SIMロック・VoLTE・APN等は別要因です</div>
    </div>
  );
}

// ===== メインコンポーネント =====

export default function BandDetailCell({ device, field }: CellProps) {
  const [showCompat, setShowCompat] = useState(false);
  const value = getSpecValue(device, field.key);

  // carrierBands null → バンドロックなし表示
  if (!isCarrierBands(value)) {
    const blVal = getSpecValue(device, "connectivity.bandLock");
    const lockStr = typeof blVal === "string" ? blVal : "";
    return (
      <td className="px-2 sm:px-3 py-2 text-center">
        {lockStr.includes("なし") ? (
          <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold"
            style={{ background: BADGE_STYLES.free.bg, color: BADGE_STYLES.free.color, border: `1px solid ${BADGE_STYLES.free.border}` }}>
            {BADGE_STYLES.free.label}
          </span>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>
    );
  }

  const bands = value;
  const carriers = (["docomo", "au", "softbank", "rakuten", "simfree"] as const).filter((c) => bands[c] != null);
  const blVal = getSpecValue(device, "connectivity.bandLock");
  const lockStatus = typeof blVal === "string" ? parseBandLockStatus(blVal) : "unknown";
  const primaryDetail = carriers.length > 0 ? bands[carriers[0]]! : null;

  return (
    <td className="px-2 sm:px-3 py-2 align-top">
      {/* バンドロック状態バッジ */}
      <div className="mb-1 text-center">
        {lockStatus === "free" || lockStatus === "locked" ? (
          <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold"
            style={{ background: BADGE_STYLES[lockStatus].bg, color: BADGE_STYLES[lockStatus].color,
              border: `1px solid ${BADGE_STYLES[lockStatus].border}` }}>
            {BADGE_STYLES[lockStatus].label}
          </span>
        ) : (
          <span className="text-[10px] text-gray-500">バンドロック情報なし</span>
        )}
      </div>

      {/* キャリア別バンド詳細 */}
      <div className="space-y-1">
        {carriers.map((c) => <CarrierBlock key={c} carrier={c} detail={bands[c]!} />)}
      </div>

      {/* 互換性チェックボタン */}
      {primaryDetail && primaryDetail.modelNumber !== "未発表" && (
        <div className="mt-1.5">
          <button
            onClick={() => setShowCompat((v) => !v)}
            className="w-full rounded px-2 py-1 text-[10px] font-bold transition-colors"
            style={{
              background: showCompat ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
              color: showCompat ? "#93c5fd" : "#94a3b8",
              border: `1px solid ${showCompat ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {showCompat ? "▲ 互換性を閉じる" : "▼ バンド互換性を確認（電波面）"}
          </button>
          {showCompat && (
            <div className="mt-1">
              {lockStatus === "free" && primaryDetail ? (
                <CompatChecker detail={primaryDetail} />
              ) : (
                carriers.filter((c) => c !== "simfree").map((c) => (
                  <div key={c} className="mt-1">
                    <div className="text-[9px] font-bold text-gray-500">{c}版を他社SIMで利用時:</div>
                    <CompatChecker detail={bands[c]!} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </td>
  );
}
