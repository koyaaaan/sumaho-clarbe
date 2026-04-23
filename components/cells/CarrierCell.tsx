import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";

const CARRIER_STYLES: Record<string, { bg: string; text: string; border: string; short: string }> = {
  "variant.docomo":   { bg: "rgba(220,38,38,0.15)",  text: "#fca5a5", border: "rgba(220,38,38,0.25)",   short: "d" },
  "variant.au":       { bg: "rgba(234,88,12,0.15)",  text: "#fdba74", border: "rgba(234,88,12,0.25)",   short: "au" },
  "variant.softbank": { bg: "rgba(22,163,74,0.15)",   text: "#86efac", border: "rgba(22,163,74,0.25)",   short: "SB" },
  "variant.rakuten":  { bg: "rgba(185,28,28,0.10)",   text: "#fca5a5", border: "rgba(185,28,28,0.15)",   short: "楽" },
  "variant.simfree":  { bg: "rgba(59,130,246,0.10)",  text: "#93c5fd", border: "rgba(59,130,246,0.20)",  short: "SIM" },
};

export default function CarrierCell({ device, field }: CellProps) {
  const value = getSpecValue(device, field.key);
  const style = CARRIER_STYLES[field.key] ?? null;
  const available = value !== null && value !== undefined;

  return (
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle">
      {available && style ? (
        <div className="flex flex-col items-center gap-1">
          <span
            className="inline-block rounded px-2 py-0.5 text-[10px] font-bold"
            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
          >
            {style.short}
          </span>
          {typeof value === "string" && value !== "○" && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{value}</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
      )}
    </td>
  );
}
