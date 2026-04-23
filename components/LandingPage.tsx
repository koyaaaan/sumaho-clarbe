"use client";

// =========================================================
// LandingPage — 初期画面
// =========================================================
// 表示条件: 機種が1件も選択されていない & ユーザーがまだ比較を開始していない
// 構成:
//   1. ヒーロー領域
//   2. 人気の比較 (プリセットカード)
//   3. ブランドから選ぶ
//   4. 最近の機種
// =========================================================

interface LandingPageProps {
  /** 「比較を始める」CTA / ブランドボタンで比較画面へ遷移 */
  onStartComparison: () => void;
  /** ブランド選択 (brandId を渡す) */
  onBrandSelect: (brandId: string) => void;
  /** プリセット比較 (複数IDを同時に追加) */
  onSelectPreset: (ids: string[]) => void;
  /** 最近の機種カード (1件追加) */
  onAddDevice: (id: string) => void;
}

// ── データ定義 ──────────────────────────────────────────

const POPULAR_PRESETS = [
  {
    label: "iPhone 15 vs iPhone 16",
    sub: "最も比較されるiPhone世代差",
    ids: ["iphone-15", "iphone-16"],
    color: "from-gray-50 to-slate-100",
    border: "border-slate-200",
  },
  {
    label: "Galaxy S24 vs Galaxy S25",
    sub: "Snapdragon 8 Gen 3 → 8 Elite",
    ids: ["galaxy-s24", "galaxy-s25"],
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
  },
  {
    label: "Pixel 8 vs Pixel 9",
    sub: "Tensor G3 → G4 世代比較",
    ids: ["pixel-8", "pixel-9"],
    color: "from-green-50 to-teal-50",
    border: "border-green-200",
  },
  {
    label: "iPhone SE 3 vs iPhone 13 mini",
    sub: "コンパクト派向けの選択肢",
    ids: ["iphone-se-3", "iphone-13-mini"],
    color: "from-orange-50 to-amber-50",
    border: "border-orange-200",
  },
  {
    label: "Galaxy A55 vs Pixel 8a",
    sub: "ミドルレンジの実力対決",
    ids: ["galaxy-a55", "pixel-8a"],
    color: "from-violet-50 to-purple-50",
    border: "border-violet-200",
  },
] as const;

const BRANDS = [
  {
    id: "samsung",
    label: "Galaxy を見る",
    emoji: "🌌",
    desc: "33機種",
    accent: "from-blue-500 to-indigo-600",
    ring: "ring-blue-200",
    hover: "hover:bg-blue-50",
    text: "text-blue-700",
  },
  {
    id: "apple",
    label: "iPhone を見る",
    emoji: "📱",
    desc: "28機種",
    accent: "from-gray-600 to-gray-800",
    ring: "ring-gray-200",
    hover: "hover:bg-gray-50",
    text: "text-gray-700",
  },
  {
    id: "google",
    label: "Pixel を見る",
    emoji: "⬡",
    desc: "14機種",
    accent: "from-green-500 to-teal-600",
    ring: "ring-green-200",
    hover: "hover:bg-green-50",
    text: "text-green-700",
  },
] as const;

const RECENT_DEVICES = [
  { id: "galaxy-s25", label: "Galaxy S25", sub: "2025年2月", emoji: "🌌" },
  { id: "iphone-16", label: "iPhone 16", sub: "2024年9月", emoji: "📱" },
  { id: "pixel-9", label: "Pixel 9", sub: "2024年8月", emoji: "⬡" },
  { id: "galaxy-z-flip7", label: "Galaxy Z Flip7", sub: "2025年7月", emoji: "🔮" },
  { id: "galaxy-a56", label: "Galaxy A56 5G", sub: "2025年3月", emoji: "🌌" },
] as const;

// ── コンポーネント ───────────────────────────────────────

export default function LandingPage({
  onStartComparison,
  onBrandSelect,
  onSelectPreset,
  onAddDevice,
}: LandingPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

      {/* ── 1. ヒーロー領域 ──────────────────────────────── */}
      <section className="mb-10 text-center">
        {/* アプリ名 */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-3xl">📱</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            スマホクラーベ
          </h1>
        </div>

        {/* 説明文 */}
        <p className="mb-2 text-base font-medium text-gray-700 dark:text-gray-300">
          価格・サイズ・性能を比べて選べる
        </p>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          主要スマホを見やすく比較・回線やバンドも確認できる
        </p>

        {/* CTA ボタン */}
        <button
          onClick={onStartComparison}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
        >
          比較を始める
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </section>

      {/* ── 2. 人気の比較 ────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          人気の比較
        </h2>
        <div className="flex flex-col gap-2">
          {POPULAR_PRESETS.map((preset) => (
            <button
              key={preset.ids.join("-")}
              onClick={() => onSelectPreset([...preset.ids])}
              className={`flex items-center justify-between rounded-xl border ${preset.border} bg-gradient-to-r ${preset.color} px-4 py-3 text-left transition hover:shadow-sm active:scale-[0.99] dark:border-gray-700 dark:from-gray-800 dark:to-gray-800`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {preset.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {preset.sub}
                </p>
              </div>
              <svg
                className="h-4 w-4 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. ブランドから選ぶ ──────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          ブランドから選ぶ
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {BRANDS.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onBrandSelect(brand.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-4 text-center shadow-sm transition ${brand.hover} active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800`}
            >
              <span className="text-2xl">{brand.emoji}</span>
              <span className={`text-sm font-bold ${brand.text} dark:text-gray-200`}>
                {brand.label}
              </span>
              <span className="text-xs text-gray-400">{brand.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. 最近の機種 ────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          最近の機種
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {RECENT_DEVICES.map((device) => (
            <button
              key={device.id}
              onClick={() => onAddDevice(device.id)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="text-xl">{device.emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {device.label}
                </p>
                <p className="text-xs text-gray-400">{device.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 dark:border-gray-800">
        <p>スマホクラーベ — データは各メーカー公式サイトに基づく</p>
      </footer>
    </div>
  );
}
