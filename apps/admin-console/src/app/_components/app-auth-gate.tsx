"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  User,
  onIdTokenChanged,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseClientAuth, hasFirebaseClientConfig } from "@/lib/firebase-client";
import { AUTH_ID_TOKEN_COOKIE } from "@/lib/auth-constants";
import { MaterialIcon } from "./material-icon";

type AppAuthGateProps = {
  children: ReactNode;
};

function getErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null
      ? (error as { code?: unknown }).code
      : null;
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

export function AppAuthGate({ children }: AppAuthGateProps) {
  const auth = useMemo(() => getFirebaseClientAuth(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setSessionTokenCookie = async (nextUser: User | null) => {
    if (typeof document === "undefined") {
      return;
    }

    if (!nextUser) {
      document.cookie = `${AUTH_ID_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
      return;
    }

    const idToken = await nextUser.getIdToken();
    document.cookie = `${AUTH_ID_TOKEN_COOKIE}=${encodeURIComponent(idToken)}; Path=/; Max-Age=3600; SameSite=Lax`;
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      if (typeof document !== "undefined") {
        document.cookie = `${AUTH_ID_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
      }
      return;
    }

    let previousUid: string | null = null;

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);

      await setSessionTokenCookie(nextUser);

      const currentUid = nextUser?.uid ?? null;
      if (previousUid !== currentUid) {
        previousUid = currentUid;
        router.refresh();
      }
    });

    return unsubscribe;
  }, [auth, router]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="ui-card w-full max-w-md p-6 text-center">
          <p className="text-sm font-bold text-charcoal">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="ui-card w-full max-w-md space-y-4 p-6">
          <div className="space-y-1">
            <h1 className="font-headline text-xl font-extrabold text-charcoal">
              TOMOSHIBI Studio
            </h1>
            <p className="text-sm font-medium text-charcoal/70">
              利用するには Google ログインが必要です。
            </p>
          </div>

          {!hasFirebaseClientConfig() ? (
            <div className="rounded-md border border-ochre/30 bg-ochre/10 p-3 text-xs font-medium text-charcoal/70">
              NEXT_PUBLIC_FIREBASE_* の設定が不足しています。
            </div>
          ) : null}

          <button
            className="w-full rounded-md bg-terracotta px-4 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isWorking}
            onClick={handleSignIn}
            type="button"
          >
            <MaterialIcon className="mr-2 inline-block text-base" name="login" />
            Googleでログイン
          </button>

          {errorMessage ? (
            <p className="text-xs font-medium text-terracotta">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
