import type { CellProps } from "./CellProps";
import type { CameraModule } from "@/types/device";
import { getSpecValue } from "@/lib/comparison";
import { formatCameraModules } from "@/lib/formatters";

export default function CameraModulesCell({ device, field, colorClass }: CellProps) {
  const value = getSpecValue(device, field.key);

  if (!Array.isArray(value) || value.length === 0) {
    return <td className="px-2 sm:px-4 py-2 sm:py-3 text-center align-middle text-xs text-gray-300">—</td>;
  }

  const modules = value.filter(
    (v): v is CameraModule => typeof v === "object" && v !== null && "label" in v
  );
  const lines = formatCameraModules(modules);

  return (
    <td className={`px-2 sm:px-4 py-2 sm:py-3 align-top ${colorClass}`}>
      <div className="space-y-1">
        {lines.map((line, j) => {
          // "広角: Sony IMX890 f/1.75" のようなフォーマットを分割して階層表示
          const colonIdx = line.text.indexOf(": ");
          const hasLabel = colonIdx !== -1;
          const labelPart = hasLabel ? line.text.slice(0, colonIdx) : null;
          const detailPart = hasLabel ? line.text.slice(colonIdx + 2) : line.text;

          return (
            <div
              key={j}
              className="rounded bg-gray-50 dark:bg-gray-800/80 px-2 py-1.5 text-left"
            >
              {hasLabel && (
                <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 leading-tight mb-0.5">
                  {labelPart}
                </div>
              )}
              <div className="text-[11px] sm:text-xs leading-snug text-gray-700 dark:text-gray-300 break-words">
                {detailPart}
              </div>
            </div>
          );
        })}
      </div>
    </td>
  );
}
