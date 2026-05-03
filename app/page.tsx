"use client";

import { useReducer, useEffect, useCallback, useState, useRef } from "react";
import { comparisonReducer, initialState } from "@/store/reducer";
import { getDeviceList, getDevice, getSpecFields } from "@/lib/data";
import { sortDevices } from "@/lib/comparison";
import { parseUrlParams, pushUrl } from "@/lib/url";
import type { SortKey } from "@/lib/comparison";

import DeviceSelector from "@/components/DeviceSelector";
import SelectedDevices from "@/components/SelectedDevices";
import CategoryToggles from "@/components/CategoryToggles";
import ComparisonTable from "@/components/ComparisonTable";
import ShareButton from "@/components/ShareButton";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);
  const deviceList = getDeviceList();
  const specFields = getSpecFields();

  // ランディングページを強制非表示にするフラグ
  const [forceComparison, setForceComparison] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // ===== 初期化: URLから状態復元 + カテゴリ全有効化 =====
  useEffect(() => {
    const defaultCategories = specFields.map((c) => c.id);
    dispatch({ type: "ENABLE_ALL_CATEGORIES", categoryIds: defaultCategories });

    const urlState = parseUrlParams();
    if (urlState.deviceIds.length > 0) {
      setForceComparison(true);
      dispatch({
        type: "RESTORE",
        state: { highlightDiffs: urlState.highlightDiffs },
      });
      urlState.deviceIds.forEach(async (id) => {
        const device = await getDevice(id);
        if (device) {
          dispatch({ type: "ADD_DEVICE", id, device });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== URL同期 =====
  useEffect(() => {
    pushUrl(state.selectedIds, state.highlightDiffs);
  }, [state.selectedIds, state.highlightDiffs]);

  // ===== 機種が選択されたら自動的に比較画面へ =====
  useEffect(() => {
    if (state.selectedIds.length > 0) {
      setForceComparison(true);
    }
  }, [state.selectedIds.length]);

  // ===== ハンドラー =====
  const handleAddDevice = useCallback(async (id: string) => {
    const device = await getDevice(id);
    if (device) {
      dispatch({ type: "ADD_DEVICE", id, device });
    }
  }, []);

  const handleRemoveDevice = useCallback((id: string) => {
    dispatch({ type: "REMOVE_DEVICE", id });
  }, []);

  const handleClearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
    setForceComparison(true);
  }, []);

  const handleToggleCategory = useCallback((categoryId: string) => {
    dispatch({ type: "TOGGLE_CATEGORY", categoryId });
  }, []);

  const handleEnableAll = useCallback(() => {
    dispatch({
      type: "ENABLE_ALL_CATEGORIES",
      categoryIds: specFields.map((c) => c.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDisableAll = useCallback(() => {
    dispatch({ type: "DISABLE_ALL_CATEGORIES" });
  }, []);

  // ===== ランディングページ用ハンドラー =====
  const handleStartComparison = useCallback(() => {
    setForceComparison(true);
    setTimeout(() => {
      selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const handleBrandSelect = useCallback((_brandId: string) => {
    setForceComparison(true);
    setTimeout(() => {
      selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const handleSelectPreset = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      const device = await getDevice(id);
      if (device) {
        dispatch({ type: "ADD_DEVICE", id, device });
      }
    }
  }, []);

  // ===== 表示用データ =====
  const selectedDevices = sortDevices(
    state.selectedIds.map((id) => state.devices[id]).filter(Boolean),
    state.sortKey,
    state.selectedIds
  );

  const showLanding = state.selectedIds.length === 0 && !forceComparison;

  // ===== ランディング画面 =====
  if (showLanding) {
    return (
      <LandingPage
        onStartComparison={handleStartComparison}
        onBrandSelect={handleBrandSelect}
        onSelectPreset={handleSelectPreset}
        onAddDevice={handleAddDevice}
      />
    );
  }

  // ===== 比較画面 =====
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* ヘッダー: ロゴタップでランディングへ戻る */}
      <header className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            dispatch({ type: "CLEAR_ALL" });
            setForceComparison(false);
          }}
          className="group flex shrink-0 items-center gap-2 transition"
          title="トップへ戻る"
        >
          <span className="text-xl">📱</span>
          <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 dark:text-gray-100">
            スマホクラーベ
          </h1>
        </button>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          価格・サイズ・性能を比べて選べる
        </span>
      </header>

      {/* コントロールパネル */}
      <div
        ref={selectorRef}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        {/* 上段: 機種追加 + URLコピー + 選択済み */}
        <div className="flex flex-wrap items-start gap-3">
          <DeviceSelector
            deviceList={deviceList}
            selectedIds={state.selectedIds}
            onSelect={handleAddDevice}
          />
          <ShareButton
            selectedIds={state.selectedIds}
            highlightDiffs={state.highlightDiffs}
          />
          <SelectedDevices
            devices={selectedDevices}
            onRemove={handleRemoveDevice}
            onClearAll={handleClearAll}
          />
        </div>

        {/* 中段: 設定 */}
        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            onClick={() => dispatch({ type: "TOGGLE_HIGHLIGHT" })}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              state.highlightDiffs
                ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800"
                : "bg-gray-50 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                state.highlightDiffs ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            差分ハイライト
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">並び順:</span>
            {(["selected", "releaseDate", "price"] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => dispatch({ type: "SET_SORT", sortKey: key })}
                className={`rounded-md px-2 py-1 text-xs transition-colors ${
                  state.sortKey === key
                    ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {{ selected: "選択順", releaseDate: "発売日", price: "価格" }[key]}
              </button>
            ))}
          </div>
        </div>

        {/* 下段: カテゴリトグル */}
        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <CategoryToggles
            categories={specFields}
            enabledIds={state.enabledCategories}
            onToggle={handleToggleCategory}
            onEnableAll={handleEnableAll}
            onDisableAll={handleDisableAll}
          />
        </div>
      </div>

      {/* 比較テーブル */}
      <ComparisonTable
        devices={selectedDevices}
        categories={specFields}
        enabledCategoryIds={state.enabledCategories}
        highlightDiffs={state.highlightDiffs}
        onSelectPreset={handleSelectPreset}
      />

      {/* 楽天導線 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          比較した機種の購入先を確認できます
        </p>
        <a
          href="https://a.r10.to/hkdHoZ"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-3 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          楽天で見る
        </a>
      </div>

           {/* フッター */}
           <footer className="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400 dark:border-gray-800">
        <p>スマホクラーベ — スマートフォン スペック比較 | データは各メーカー公式サイトに基づく</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <a
            href="/privacy"
            className="text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
          >
            プライバシーポリシー
          </a>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <a
            href="/contact"
            className="text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
          >
            お問い合わせ
          </a>
        </div>
      </footer>
    </div>
  );
}
