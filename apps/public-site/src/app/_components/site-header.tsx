"use client";

import Link from "next/link";

type MainTabId = "about" | "mechanism" | "proofs";

type SiteHeaderProps = {
  activeTab?: MainTabId;
  consultHref?: string;
  enableScrollState?: boolean;
  travelerHref?: string;
  activeTraveler?: boolean;
};

const tabItems: Array<{ id: MainTabId; href: string; label: string }> = [
  { id: "about", href: "/#about", label: "サービス概要" },
  { id: "mechanism", href: "/mechanism", label: "仕組み" },
  { id: "proofs", href: "/proofs", label: "実証・事例" },
];

const defaultTabClass = "transition-colors hover:text-[#E0A458]";
const activeTabClass = "border-b-2 border-[#D66D52] pb-1 font-bold text-[#D66D52]";

export default function SiteHeader({
  activeTab,
  consultHref = "/contact",
  enableScrollState = false,
  travelerHref = "/users",
  activeTraveler = false,
}: SiteHeaderProps) {
  const travelerClass = activeTraveler
    ? "hidden border-b-2 border-[#E0A458] pb-1 text-sm font-bold text-[#E0A458] md:block"
    : "hidden text-sm font-bold text-[#3D3D3D]/70 transition-colors hover:text-[#D66D52] md:block";

  return (
    <nav className="fixed top-6 right-6 left-6 z-50">
      <div
        className="nav-shell sketch-border mx-auto max-w-6xl bg-white/90 px-6 py-4 shadow-lg backdrop-blur-md"
        data-main-nav={enableScrollState ? "true" : undefined}
      >
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Link className="font-headline text-2xl font-bold tracking-tight text-[#D66D52]" href="/">
            TOMOSHIBI
          </Link>

          <div className="hidden items-center space-x-8 text-sm font-medium lg:flex">
            {tabItems.map((item) => (
              <Link
                key={item.id}
                className={item.id === activeTab ? activeTabClass : defaultTabClass}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link className={travelerClass} href={travelerHref}>
              旅行者の方へ
            </Link>
            <Link
              className="rounded-full bg-[#D66D52] px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:-rotate-2 hover:bg-[#E0A458]"
              href={consultHref}
            >
              実証相談をする
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
