import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";
import { computeUntilVersion, getGenerationStyle } from "@/lib/osUtils";

export default function UpdateYearsCell({ device, field, colorClass }: CellProps) {
  const value = getSpecValue(device, field.key);
  if (typeof value !== "number") {
    return <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle text-xs text-gray-300">—</td>;
  }

  const genStyle = getGenerationStyle(value);
  const initialOs = getSpecValue(device, "os.initial");
  const releaseYear = getSpecValue(device, "os.releaseYear");
  const updateUntil = getSpecValue(device, "os.updateUntil");
  const untilVersion = typeof initialOs === "string" ? computeUntilVersion(initialOs, value) : null;

  return (
    <td className={`px-2 sm:px-4 py-2 sm:py-3 align-middle ${colorClass}`}>
      <div className="flex flex-col items-center gap-1">
        <span
          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold"
          style={{ background: genStyle.badgeBg, color: genStyle.badgeText, border: `1px solid ${genStyle.badgeBorder}` }}
        >
          {value}世代
        </span>
        <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full" style={{ background: genStyle.barColor, width: genStyle.barWidth }} />
        </div>
        {untilVersion && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{untilVersion}</span>
        )}
        {typeof updateUntil === "number" && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {typeof releaseYear === "number" ? `${releaseYear}→` : ""}{updateUntil}年
          </span>
        )}
      </div>
    </td>
  );
}
