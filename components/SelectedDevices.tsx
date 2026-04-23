"use client";

import type { Device } from "@/types/device";

interface Props {
  devices: Device[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function SelectedDevices({ devices, onRemove, onClearAll }: Props) {
  if (devices.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {devices.map((d) => (
        <span
          key={d.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
        >
          {d.name}
          <button
            onClick={() => onRemove(d.id)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600"
            aria-label={`${d.name}を削除`}
          >
            ✕
          </button>
        </span>
      ))}
      {devices.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 transition-colors hover:text-red-500"
        >
          すべて解除
        </button>
      )}
    </div>
  );
}
