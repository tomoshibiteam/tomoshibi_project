"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseClientAuth, hasFirebaseClientConfig } from "@/lib/firebase-client";
import { MaterialIcon } from "./material-icon";

type HeaderAuthControlsProps = {
  className?: string;
  showNotifications?: boolean;
};

function cn(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : null;
  const rawMessage =
    typeof error === "object" && error !== null
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  if (rawMessage.includes("CONFIGURATION_NOT_FOUND")) {
    return "Firebase Authentication が未初期化です。Firebase Console の Authentication で「始める」を実行し、Google ログインを有効化してください。";
  }

  switch (code) {
    case "auth/configuration-not-found":
      return "Firebase Authentication が未初期化です。Firebase Console の Authentication で「始める」を実行し、Google ログインを有効化してください。";
    case "auth/operation-not-allowed":
      return "Firebase AuthenticationのGoogleログインが未有効です。";
    case "auth/unauthorized-domain":
      return "このドメインはGoogleログインの許可対象外です。";
    case "auth/popup-blocked":
      return "ポップアップがブロックされました。ブラウザ設定を確認してください。";
    case "auth/invalid-api-key":
      return "Firebase の API キー設定が不正です。.env.local の NEXT_PUBLIC_FIREBASE_API_KEY を確認してください。";
    default:
      return "ログインに失敗しました。";
  }
}

function getUserDisplayName(user: User): string {
  const name = user.displayName?.trim();
  if (name) {
    return name;
  }

  const email = user.email?.trim();
  if (email) {
    return email.split("@")[0] ?? email;
  }

  return "Googleユーザー";
}

function getInitialLetter(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

export function HeaderAuthControls({
  className,
  showNotifications = true,
}: HeaderAuthControlsProps) {
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

  const handleSignIn = async () => {
    if (!auth) {
      setErrorMessage("Firebase Authの公開設定が不足しています。");
      return;
    }

    setErrorMessage(null);
    setIsWorking(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user") {
        setErrorMessage(getErrorMessage(error));
      }
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showNotifications ? (
        <button className="p-2 text-charcoal/60 transition-colors hover:text-terracotta">
          <MaterialIcon name="notifications" />
        </button>
      ) : null}

      {isLoading ? (
        <div className="h-8 w-8 animate-pulse rounded-full border border-charcoal/10 bg-charcoal/5" />
      ) : user ? (
        <Link
          aria-label="アカウント設定へ"
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-charcoal/10 bg-white text-[10px] font-bold text-charcoal/70 transition-colors hover:border-terracotta/40 hover:bg-paper"
          href="/settings"
          title="アカウント設定"
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-charcoal/10">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Google user avatar" className="h-full w-full object-cover" src={user.photoURL} />
              ) : (
                getInitialLetter(getUserDisplayName(user))
              )}
          </div>
        </Link>
      ) : (
        <div className="flex flex-col items-end gap-1">
          <button
            className="rounded-full border border-charcoal/15 bg-white px-4 py-1.5 text-xs font-bold text-charcoal transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isWorking}
            onClick={handleSignIn}
            type="button"
          >
            <MaterialIcon className="mr-1 inline-block text-[12px]" name="login" />
            Googleでログイン
          </button>
          {!hasFirebaseClientConfig() ? (
            <p className="text-[10px] font-medium text-ochre">NEXT_PUBLIC_FIREBASE_* の設定不足</p>
          ) : null}
          {errorMessage ? <p className="text-[10px] font-medium text-terracotta">{errorMessage}</p> : null}
        </div>
      )}
    </div>
  );
}
