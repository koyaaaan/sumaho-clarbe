import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";

const CURRENT_YEAR = new Date().getFullYear();
const TIMELINE_START = 2020;
const TIMELINE_END = 2035;
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

export default function TimelineCell({ device, field, colorClass }: CellProps) {
  const value = getSpecValue(device, field.key);
  const untilYear = typeof value === "number" ? value : null;
  const releaseYear = getSpecValue(device, "os.releaseYear");
  const releaseYearNum = typeof releaseYear === "number" ? releaseYear : null;

  if (untilYear === null || releaseYearNum === null) {
    return <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle text-xs text-gray-300">—</td>;
  }

  const startPct = ((releaseYearNum - TIMELINE_START) / TIMELINE_SPAN) * 100;
  const endPct = ((untilYear - TIMELINE_START) / TIMELINE_SPAN) * 100;
  const nowPct = ((CURRENT_YEAR - TIMELINE_START) / TIMELINE_SPAN) * 100;
  const isActive = untilYear >= CURRENT_YEAR;

  const barColor = isActive
    ? field.key === "os.updateUntil" ? "bg-blue-500" : "bg-emerald-500"
    : "bg-gray-300 dark:bg-gray-600";

  return (
    <td className={`px-2 sm:px-4 py-2 sm:py-2.5 ${colorClass}`}>
      <div className="space-y-1">
        <div className="text-center text-sm font-bold text-gray-900 dark:text-gray-100">
          {untilYear}年まで
        </div>
        <div className="relative h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`absolute top-0 h-full rounded-full ${barColor} transition-all`}
            style={{ left: `${Math.max(0, startPct)}%`, width: `${Math.max(0, endPct - startPct)}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-red-400"
            style={{ left: `${nowPct}%` }}
            title={`現在: ${CURRENT_YEAR}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>{releaseYearNum}</span>
          <span className="text-red-400">今</span>
          <span>{untilYear}</span>
        </div>
      </div>
    </td>
  );
}
