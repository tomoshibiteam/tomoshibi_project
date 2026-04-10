import type { Metadata } from "next";
import { Karla, Noto_Sans_JP, Quicksand } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOMOSHIBI | 地域資源を、回遊と滞在を生む物語体験へ",
  description:
    "地域資源を物語化し、旅行者一人ひとりに最適な回遊と滞在体験を生成するTOMOSHIBIの公開サイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlClassName = [
    karla.variable,
    quicksand.variable,
    notoSansJP.variable,
    "h-full",
    "scroll-smooth",
    "antialiased",
  ].join(" ");

  return (
    <html lang="ja" className={htmlClassName}>
      <body className="flex min-h-full flex-col text-[#3D3D3D] selection:bg-[#E0A458]/30">
        {children}
      </body>
    </html>
  );
}
