import Link from "next/link";
import { HeaderAuthControls } from "../_components/header-auth-controls";
import { MaterialIcon } from "../_components/material-icon";
import { AccountSettingsCard } from "./account-settings-card";

export default function SettingsPage() {
  return (
    <main className="min-h-screen pb-20">
      <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <MaterialIcon className="text-terracotta" name="settings" />
          <h1 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">設定</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            className="inline-flex items-center gap-1 rounded-md border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:bg-paper"
            href="/"
          >
            <MaterialIcon className="text-[14px]" name="arrow_back" />
            制作ホームへ戻る
          </Link>
          <HeaderAuthControls showNotifications={false} />
        </div>
      </header>

      <div className="mx-auto mt-8 w-full max-w-3xl px-8">
        <div className="mb-6 space-y-2">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-charcoal">アカウント設定</h2>
          <p className="text-sm font-medium text-charcoal/60">
            ヘッダー右上のユーザーアイコンからこの画面へ移動し、ログアウトできます。
          </p>
        </div>

        <AccountSettingsCard />
      </div>
    </main>
  );
}
