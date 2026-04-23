"use client";

import type { Device } from "@/types/device";
import type { SpecField } from "@/types/spec";
import type { DiffResult } from "@/lib/comparison";
import { computeFieldDiff } from "@/lib/comparison";

import CarrierCell from "./cells/CarrierCell";
import UpdateYearsCell from "./cells/UpdateYearsCell";
import SecurityYearsCell from "./cells/SecurityYearsCell";
import BandsCell from "./cells/BandsCell";
import BandDetailCell from "./cells/BandDetailCell";
import TimelineCell from "./cells/TimelineCell";
import CameraModulesCell from "./cells/CameraModulesCell";
import DefaultCell from "./cells/DefaultCell";

interface Props {
  field: SpecField;
  devices: Device[];
  highlightDiffs: boolean;
}

const diffColors: Record<DiffResult, string> = {
  best: "bg-emerald-50 dark:bg-emerald-900/50",
  worst: "bg-rose-50 dark:bg-rose-900/50",
  same: "",
  neutral: "",
};

// ===== format → Cellコンポーネントのルーティング =====
const CELL_MAP: Record<string, React.ComponentType<import("./cells/CellProps").CellProps>> = {
  carrier: CarrierCell,
  updateYears: UpdateYearsCell,
  securityYears: SecurityYearsCell,
  bands: BandsCell,
  carrierBandDetail: BandDetailCell,
  updateTimeline: TimelineCell,
  cameraModules: CameraModulesCell,
};

export default function SpecRow({ field, devices, highlightDiffs }: Props) {
  const diffs = highlightDiffs
    ? computeFieldDiff(devices, field)
    : devices.map(() => "neutral" as DiffResult);

  const CellComponent = field.format ? CELL_MAP[field.format] ?? DefaultCell : DefaultCell;

  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/30 even:bg-gray-50/40 dark:even:bg-gray-800/15">
      {/* スペック名（固定列） */}
      <td className="sticky left-0 z-10 w-[88px] min-w-[88px] sm:w-[140px] sm:min-w-[140px] spec-sticky-col border-r border-gray-200 bg-white px-2 py-2 sm:py-3 text-xs sm:px-4 sm:text-sm text-gray-500 align-top dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        <span className="leading-snug">{field.label}</span>
        {field.unit && (
          <span className="ml-1 text-[10px] text-gray-300 dark:text-gray-600 whitespace-nowrap">
            ({field.unit})
          </span>
        )}
      </td>

      {/* 各機種の値 — Cellコンポーネントに委譲 */}
      {devices.map((device, i) => (
        <CellComponent
          key={device.id}
          device={device}
          field={field}
          colorClass={highlightDiffs ? diffColors[diffs[i]] : ""}
        />
      ))}
    </tr>
  );
}
