"use client";

import type { Device } from "@/types/device";
import type { SpecCategory } from "@/types/spec";
import CategorySection from "./CategorySection";

interface Props {
  devices: Device[];
  categories: SpecCategory[];
  enabledCategoryIds: readonly string[];
  highlightDiffs: boolean;
  onSelectPreset?: (ids: string[]) => void;
}

// ブランドカラーアクセントのマッピング
const BRAND_ACCENT: Record<string, string> = {
  samsung: "bg-blue-400",
  apple:   "bg-slate-400",
  google:  "bg-green-400",
};

// 空状態に表示する人気の比較プリセット
const EMPTY_PRESETS = [
  { label: "S25 Ultra vs iPhone 16 Pro Max", ids: ["galaxy-s25-ultra", "iphone-16-pro-max"] },
  { label: "iPhone 16 Pro vs iPhone 16", ids: ["iphone-16-pro", "iphone-16"] },
  { label: "Pixel 9 Pro vs Pixel 8 Pro", ids: ["pixel-9-pro", "pixel-8-pro"] },
  { label: "Galaxy S25 vs Pixel 9", ids: ["galaxy-s25", "pixel-9"] },
];

export default function ComparisonTable({
  devices,
  categories,
  enabledCategoryIds,
  highlightDiffs,
  onSelectPreset,
}: Props) {
  const visibleCategories = categories.filter((c) =>
    enabledCategoryIds.includes(c.id)
  );

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-6xl">📱</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
          比較する機種を選んでください
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          まずは2機種選ぶと比較しやすくなります
        </p>
        {onSelectPreset && (
          <div className="w-full max-w-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">人気の比較</p>
            <div className="flex flex-col gap-2">
              {EMPTY_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onSelectPreset(p.ids)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    /*
     * spec-scroll-wrapper: 右端フェードグラデーション（モバイル横スクロールヒント）
     * spec-scroll-inner: iOS慣性スクロール + overscroll制御
     * overflow-auto + max-h でテーブルを独立スクロール領域にすることで
     * sticky top-0 (ヘッダー行) が正しく機能する。
     */
    <div className="spec-scroll-wrapper">
      <div className="spec-scroll-inner overflow-auto max-h-[70vh] min-h-[300px] rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse table-fixed">
          {/* ─── ヘッダー: sticky top-0 で縦スクロール中も機種名が見える ─── */}
          <thead>
            <tr className="bg-white dark:bg-gray-900">

              {/* 左上コーナー: sticky left + sticky top の交点 → z-40 */}
              <th className="
                sticky left-0 top-0 z-40
                w-[88px] min-w-[88px] sm:w-[140px] sm:min-w-[140px]
                spec-header-th spec-sticky-col
                border-r border-gray-200 bg-white
                px-2 py-2 sm:py-3 text-left
                dark:border-gray-700 dark:bg-gray-900
              ">
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-400">
                  スペック
                </span>
              </th>

              {/* 機種ヘッダー: sticky top-0 のみ → z-20 */}
              {devices.map((d) => {
                const soc     = d.specs["processor.soc"];
                const size    = d.specs["display.size"];
                const weight  = d.specs["basic.weight"];
                const accent  = BRAND_ACCENT[d.brandId] ?? "bg-gray-300";

                return (
                  <th
                    key={d.id}
                    className="
                      sticky top-0 z-20
                      min-w-[120px] sm:min-w-[160px]
                      spec-header-th
                      bg-white dark:bg-gray-900
                      px-2 py-2 sm:py-3 text-center
                    "
                  >
                    <div className="flex flex-col items-center gap-0.5">

                      {/* ブランドカラーアクセントバー */}
                      <div className={`mb-0.5 h-[3px] w-6 sm:w-8 rounded-full ${accent}`} />

                      {/* 機種名 — モバイルでは break-words で折り返す */}
                      <span className="text-[11px] sm:text-sm font-bold leading-tight text-gray-900 dark:text-gray-100 break-words text-center max-w-[108px] sm:max-w-full">
                        {d.name}
                      </span>

                      {/* SoC チップ — 長名は truncate + title で対応 */}
                      {soc != null && (
                        <span
                          title={String(soc)}
                          className="
                            mt-0.5 block max-w-[100px] sm:max-w-[144px] truncate
                            rounded bg-gray-100 dark:bg-gray-800
                            px-1.5 py-0.5
                            text-[9px] sm:text-[10px] font-medium leading-tight
                            text-gray-500 dark:text-gray-400
                          "
                        >
                          {String(soc)}
                        </span>
                      )}

                      {/* 画面サイズ · 重量 */}
                      {(size != null || weight != null) && (
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                          {size != null && <span>{Number(size).toFixed(1)}″</span>}
                          {size != null && weight != null && (
                            <span className="text-gray-200 dark:text-gray-700" aria-hidden>·</span>
                          )}
                          {weight != null && <span>{weight}g</span>}
                        </div>
                      )}

                      {/* 発売日 — モバイルでは省略してヘッダー高さを抑制 */}
                      <span className="hidden sm:block mt-0.5 text-[10px] text-gray-300 dark:text-gray-600">
                        {d.releaseDate}
                      </span>

                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ─── カテゴリセクション ─── */}
          {visibleCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              devices={devices}
              highlightDiffs={highlightDiffs}
            />
          ))}
        </table>
      </div>

      {/* モバイル向け横スクロールヒント */}
      {devices.length > 1 && (
        <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-gray-300 sm:hidden select-none" aria-hidden>
          <span>←</span>
          <span>横スクロールで比較できます</span>
          <span>→</span>
        </p>
      )}
    </div>
  );
}
