import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
};

function readPublicEnv(value: string | undefined): string | null {
  const valueNormalized = value?.trim();
  if (!valueNormalized) {
    return null;
  }
  return valueNormalized;
}

function getPublicEnv() {
  return {
    apiKey: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    appId: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    storageBucket: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    measurementId: readPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
  };
}

function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const env = getPublicEnv();
  const { apiKey, authDomain, projectId, appId } = env;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  const config: FirebaseClientConfig = {
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

export function hasFirebaseClientConfig(): boolean {
  return getFirebaseClientConfig() !== null;
}

export function getFirebaseClientApp(): FirebaseApp | null {
  const config = getFirebaseClientConfig();
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
