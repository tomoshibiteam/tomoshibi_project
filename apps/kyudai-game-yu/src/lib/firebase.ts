import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

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

export function getFirebaseClientDb(): Firestore | null {
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }
  return getFirestore(app);
}

export function getFirebaseClientAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }
  return getAuth(app);
}
