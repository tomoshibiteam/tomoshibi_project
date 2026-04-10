"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase-client";
import { MaterialIcon } from "../_components/material-icon";

function getDisplayName(user: User): string {
  const name = user.displayName?.trim();
  if (name) {
    return name;
  }

  const email = user.email?.trim();
  if (email) {
    return email;
  }

  return "Googleユーザー";
}

export function AccountSettingsCard() {
  const router = useRouter();
  const auth = useMemo(() => getFirebaseClientAuth(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const handleSignOut = async () => {
    if (!auth) {
      setErrorMessage("Firebase Authの設定を確認してください。");
      return;
    }

    setErrorMessage(null);
    setIsWorking(true);

    try {
      await signOut(auth);
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage("ログアウトに失敗しました。時間をおいて再実行してください。");
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ui-card p-6">
        <p className="text-sm font-medium text-charcoal/60">ユーザー情報を読み込んでいます...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ui-card p-6">
        <p className="text-sm font-medium text-charcoal/60">ユーザー情報を取得できませんでした。</p>
      </div>
    );
  }

  return (
    <div className="ui-card space-y-6 p-6">
      <div className="space-y-1">
        <h2 className="font-headline text-xl font-extrabold text-charcoal">アカウント</h2>
        <p className="text-sm font-medium text-charcoal/60">ログイン中のGoogleアカウント</p>
      </div>

      <div className="rounded-lg border border-charcoal/10 bg-paper/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-charcoal/10 text-xs font-bold text-charcoal/70">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Google user avatar" className="h-full w-full object-cover" src={user.photoURL} />
            ) : (
              getDisplayName(user).slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-charcoal">{getDisplayName(user)}</p>
            <p className="truncate text-xs font-medium text-charcoal/60">{user.email ?? "メール未取得"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-charcoal/20 bg-white px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isWorking}
          onClick={handleSignOut}
          type="button"
        >
          <MaterialIcon name="logout" />
          ログアウト
        </button>
        {errorMessage ? <p className="text-xs font-medium text-terracotta">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
