"use client";

import { useState, useMemo } from "react";
import type { DeviceListItem } from "@/types/device";
import { formatBrandName } from "@/lib/formatters";

interface Props {
  deviceList: DeviceListItem[];
  selectedIds: readonly string[];
  onSelect: (id: string) => void;
}

// ===== シリーズ分類ロジック =====

interface SeriesGroup {
  label: string;
  icon: string;
  devices: DeviceListItem[];
}

function classifyIntoSeries(devices: DeviceListItem[]): SeriesGroup[] {
  const groups: Record<string, { label: string; icon: string; devices: DeviceListItem[] }> = {};

  const seriesRules: { pattern: RegExp; key: string; label: string; icon: string }[] = [
    { pattern: /Galaxy S\d+ Ultra|Galaxy S\d+\+|Galaxy S\d+ Plus/i, key: "galaxy-s-premium", label: "Galaxy S Ultra/+", icon: "👑" },
    { pattern: /Galaxy S\d+ FE/i,                    key: "galaxy-s-fe",      label: "Galaxy S FE",      icon: "✨" },
    { pattern: /Galaxy S\d+$/i,                       key: "galaxy-s",         label: "Galaxy S",         icon: "📱" },
    { pattern: /Galaxy Z Flip/i,                     key: "galaxy-flip",      label: "Galaxy Z Flip",    icon: "🪭" },
    { pattern: /Galaxy Z Fold/i,                     key: "galaxy-fold",      label: "Galaxy Z Fold",    icon: "📖" },
    { pattern: /iPhone/i,                            key: "iphone",           label: "iPhone",           icon: "🍎" },
    { pattern: /Pixel/i,                             key: "pixel",            label: "Pixel",            icon: "🔵" },
  ];

  for (const device of devices) {
    let matched = false;
    for (const rule of seriesRules) {
      if (rule.pattern.test(device.name)) {
        if (!groups[rule.key]) {
          groups[rule.key] = { label: rule.label, icon: rule.icon, devices: [] };
        }
        groups[rule.key].devices.push(device);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (!groups["other"]) groups["other"] = { label: "その他", icon: "📦", devices: [] };
      groups["other"].devices.push(device);
    }
  }

  // 定義順で返す
  const order = ["galaxy-s-premium", "galaxy-s", "galaxy-s-fe", "galaxy-flip", "galaxy-fold", "iphone", "pixel", "other"];
  return order.filter((k) => groups[k]).map((k) => groups[k]);
}

// ===== プリセット比較 =====

const PRESETS = [
  { label: "S26 Ultra vs S25 Ultra", ids: ["galaxy-s26-ultra", "galaxy-s25-ultra"] },
  { label: "S25 Ultra vs iPhone 16 Pro Max", ids: ["galaxy-s25-ultra", "iphone-16-pro-max"] },
  { label: "iPhone 16 Pro Max vs 15 Pro Max", ids: ["iphone-16-pro-max", "iphone-15-pro-max"] },
  { label: "Pixel 9 Pro vs 8 Pro", ids: ["pixel-9-pro", "pixel-8-pro"] },
  { label: "Flip7 vs Fold7", ids: ["galaxy-z-flip7", "galaxy-z-fold7"] },
  { label: "最新ハイエンド比較", ids: ["galaxy-s26-ultra", "iphone-16-pro-max", "pixel-9-pro"] },
];

export default function DeviceSelector({ deviceList, selectedIds, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(true);

  const available = useMemo(
    () => deviceList.filter((d) => !selectedIds.includes(d.id)),
    [deviceList, selectedIds]
  );

  const filtered = useMemo(() => {
    if (!query) return available;
    const q = query.toLowerCase().trim();
    return available.filter((d) => {
      const name = d.name.toLowerCase();
      const brand = d.brandId.toLowerCase();
      // 完全部分一致
      if (name.includes(q) || brand.includes(q)) return true;
      // 単語前方一致（例: "pixe" → "pixel", "gala s25" → "galaxy s25"）
      const qWords = q.split(/\s+/).filter(Boolean);
      const nWords = name.split(/[\s-]+/);
      return qWords.every((qw) => nWords.some((nw) => nw.startsWith(qw)));
    });
  }, [available, query]);

  const seriesGroups = useMemo(() => classifyIntoSeries(filtered), [filtered]);

  const availablePresets = useMemo(
    () => PRESETS.filter((p) => p.ids.some((id) => !selectedIds.includes(id))),
    [selectedIds]
  );

  const handlePreset = (ids: string[]) => {
    ids.forEach((id) => {
      if (!selectedIds.includes(id)) onSelect(id);
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="3" x2="8" y2="13" />
          <line x1="3" y1="8" x2="13" y2="8" />
        </svg>
        機種を追加
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          {/* 検索 */}
          <div className="border-b border-gray-100 p-3 dark:border-gray-700">
            <input
              type="text"
              placeholder="機種名で検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-900"
              autoFocus
            />
          </div>

          {/* プリセット比較 */}
          {!query && availablePresets.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setPresetsOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  人気の比較
                </span>
                <svg
                  className={`h-3 w-3 text-gray-300 transition-transform duration-150 ${presetsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {presetsOpen && (
                <div className="flex flex-wrap gap-1 px-2 pb-2">
                  {availablePresets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handlePreset(p.ids)}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* シリーズ別候補リスト */}
          <div className="max-h-72 overflow-y-auto p-2">
            {seriesGroups.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-gray-400">
                該当する機種がありません
              </p>
            ) : (
              seriesGroups.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="sticky top-0 z-10 flex items-center gap-1 bg-white px-1 py-1 dark:bg-gray-800">
                    <span className="text-xs">{group.icon}</span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {group.label}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600">
                      ({group.devices.length})
                    </span>
                  </div>
                  {group.devices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { onSelect(d.id); setQuery(""); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {d.releaseDate}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* 閉じる */}
          <div className="border-t border-gray-100 p-2 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg py-2 text-center text-xs text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
