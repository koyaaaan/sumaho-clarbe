"use client";

import { useState } from "react";
import type { Device } from "@/types/device";
import type { SpecCategory } from "@/types/spec";
import SpecRow from "./SpecRow";

interface Props {
  category: SpecCategory;
  devices: Device[];
  highlightDiffs: boolean;
}

export default function CategorySection({ category, devices, highlightDiffs }: Props) {
  const [isOpen, setIsOpen] = useState(category.defaultOpen);

  return (
    <tbody>
      {/* カテゴリヘッダー行 */}
      <tr
        className="cursor-pointer select-none border-t-2 border-b border-t-gray-300 border-b-gray-200 bg-gray-100 transition-colors hover:bg-gray-200 dark:border-t-gray-600 dark:border-b-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700/60"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* カテゴリ名セル: sticky left-0 で横スクロール中も表示 */}
        <td
          className="sticky left-0 z-20 w-[88px] min-w-[88px] sm:w-[140px] sm:min-w-[140px] bg-gray-100 px-3 sm:px-4 py-2 dark:bg-gray-800/80 spec-sticky-col border-r border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2">
            <svg
              className={`h-3.5 w-3.5 flex-none text-gray-400 transition-transform duration-200 dark:text-gray-500 ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {category.label}
            </span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold leading-tight text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {category.fields.length}
            </span>
          </div>
        </td>
        {/* デバイス列ぶんの空セル */}
        {devices.map((d) => (
          <td key={d.id} className="bg-gray-100 dark:bg-gray-800/80" />
        ))}
      </tr>

      {/* スペック行 */}
      {isOpen &&
        category.fields.map((field) => (
          <SpecRow
            key={field.key}
            field={field}
            devices={devices}
            highlightDiffs={highlightDiffs}
          />
        ))}
    </tbody>
  );
}
