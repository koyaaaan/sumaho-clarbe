import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";
import { getGenerationStyle } from "@/lib/osUtils";

export default function SecurityYearsCell({ device, field, colorClass }: CellProps) {
  const value = getSpecValue(device, field.key);
  if (typeof value !== "number") {
    return <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle text-xs text-gray-300">—</td>;
  }

  const genStyle = getGenerationStyle(value);
  const secUntil = getSpecValue(device, "os.securityUntil");

  return (
    <td className={`px-2 sm:px-4 py-2 sm:py-3 align-middle ${colorClass}`}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}年間</span>
        {typeof secUntil === "number" && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">〜{secUntil}年まで</span>
        )}
        <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full" style={{ background: genStyle.barColor, width: genStyle.barWidth }} />
        </div>
      </div>
    </td>
  );
}
