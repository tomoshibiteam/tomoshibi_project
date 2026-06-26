import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOMOSHIBI — 見過ごしていた景色が、二人だけの冒険になる。",
  description:
    "AIの相棒と、外へ出かけよう。あなたのことを覚えているAIが、日常の景色を二人だけの冒険に変える。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
