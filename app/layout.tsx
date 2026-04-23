import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スマホクラーベ - 価格・サイズ・性能を比べて選べる",
  description:
    "Galaxy・iPhone・Pixelなど主要スマホのスペックを見やすく比較。価格・サイズ・性能・回線バンドをまとめて確認できる日本市場向けスマートフォン比較サービス。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
