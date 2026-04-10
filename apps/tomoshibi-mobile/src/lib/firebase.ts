import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import {
  Firestore,
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
} from "firebase/firestore";

type FirebasePublicEnvKey =
  | "EXPO_PUBLIC_FIREBASE_API_KEY"
  | "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
  | "EXPO_PUBLIC_FIREBASE_APP_ID"
  | "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID";

const REQUIRED_FIREBASE_ENV_KEYS: FirebasePublicEnvKey[] = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
];

function readEnv(value: string | undefined): string | null {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }
  return normalized;
}

function getFirebasePublicEnv() {
  return {
    apiKey: readEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: readEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: readEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    appId: readEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
    storageBucket: readEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: readEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    measurementId: readEnv(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID),
  };
}

export function getFirebaseMissingEnvKeys(): FirebasePublicEnvKey[] {
  return REQUIRED_FIREBASE_ENV_KEYS.filter((key) => {
    const value = process.env[key];
    return !value || !value.trim();
  });
}

export function hasFirebaseClientConfig(): boolean {
  return getFirebaseMissingEnvKeys().length === 0;
}

function getFirebaseConfig(): FirebaseOptions | null {
  const env = getFirebasePublicEnv();
  const { apiKey, authDomain, projectId, appId } = env;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    appId,
  };

  if (env.storageBucket) {
    config.storageBucket = env.storageBucket;
  }

  if (env.messagingSenderId) {
    config.messagingSenderId = env.messagingSenderId;
  }

  if (env.measurementId) {
    config.measurementId = env.measurementId;
  }

  return config;
}

export function getFirebaseClientApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export function getFirebaseClientAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }
  return getAuth(app);
}

export function getFirebaseClientDb(): Firestore | null {
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }
  return getFirestore(app);
}

const CONNECTIVITY_ACCEPTED_CODES = new Set([
  "permission-denied",
  "failed-precondition",
  "unavailable",
]);

export async function probeFirebaseConnectivity(): Promise<{
  ok: boolean;
  details: string;
}> {
  const db = getFirebaseClientDb();
  if (!db) {
    return {
      ok: false,
      details: `missing-config: ${getFirebaseMissingEnvKeys().join(", ")}`,
    };
  }

  try {
    // Health check read: no dedicated collection is required.
    await getDocs(query(collection(db, "firebase_healthcheck"), limit(1)));
    return { ok: true, details: "read-ok" };
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (CONNECTIVITY_ACCEPTED_CODES.has(code)) {
      return { ok: true, details: `reachable-with-code:${code}` };
    }
    const message =
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "unknown-error";
    return { ok: false, details: `${code || "no-code"}:${message}` };
  }
}
