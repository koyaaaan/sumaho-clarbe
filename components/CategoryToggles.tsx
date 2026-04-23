"use client";

import type { SpecCategory } from "@/types/spec";

interface Props {
  categories: SpecCategory[];
  enabledIds: readonly string[];
  onToggle: (categoryId: string) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
}

export default function CategoryToggles({
  categories,
  enabledIds,
  onToggle,
  onEnableAll,
  onDisableAll,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">表示カテゴリ</h3>
        <div className="flex gap-2">
          <button onClick={onEnableAll} className="text-xs text-blue-500 hover:text-blue-600">
            すべて表示
          </button>
          <span className="text-xs text-gray-300">|</span>
          <button onClick={onDisableAll} className="text-xs text-blue-500 hover:text-blue-600">
            すべて非表示
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const enabled = enabledIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                enabled
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800"
                  : "bg-gray-50 text-gray-400 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
