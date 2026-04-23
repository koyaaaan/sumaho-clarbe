"use client";

import { useState } from "react";
import { buildUrl } from "@/lib/url";

interface Props {
  selectedIds: readonly string[];
  highlightDiffs: boolean;
}

export default function ShareButton({ selectedIds, highlightDiffs }: Props) {
  const [copied, setCopied] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleCopy = async () => {
    const url = window.location.origin + buildUrl(selectedIds, highlightDiffs);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {copied ? (
        <>
          <span className="text-green-500">✓</span>
          コピーしました
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4V2a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1h-2" />
            <rect x="1" y="5" width="10" height="10" rx="1" />
          </svg>
          URLをコピー
        </>
      )}
    </button>
  );
}
