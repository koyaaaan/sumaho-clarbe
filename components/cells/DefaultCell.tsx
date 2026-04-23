import type { CellProps } from "./CellProps";
import { getSpecValue } from "@/lib/comparison";
import { formatSpecValue } from "@/lib/formatters";

export default function DefaultCell({ device, field, colorClass }: CellProps) {
  const value = getSpecValue(device, field.key);
  const formatted = formatSpecValue(value, field);

  return (
    <td
      className={`px-2 sm:px-4 py-2 sm:py-3 text-center align-top text-xs sm:text-sm font-medium transition-colors ${colorClass}`}
    >
      <span className="text-gray-900 dark:text-gray-100 break-words leading-snug">{formatted}</span>
    </td>
  );
}
