import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";

export default function BandsCell({ device, field }: CellProps) {
  const value = getSpecValue(device, field.key);

  if (value === null) {
    return <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle text-xs text-gray-300">—</td>;
  }

  const bands = String(value).split(" / ");
  return (
    <td className="px-2 sm:px-3 py-2 sm:py-3 align-top">
      <div className="flex flex-wrap justify-center gap-1">
        {bands.map((band) => (
          <span
            key={band}
            className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] sm:text-[10px] font-mono text-gray-600 dark:bg-gray-800 dark:text-gray-400 leading-tight"
          >
            {band}
          </span>
        ))}
      </div>
    </td>
  );
}
