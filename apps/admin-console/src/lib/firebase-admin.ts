import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

const FIREBASE_ENV_KEYS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

type FirebaseEnvKey = (typeof FIREBASE_ENV_KEYS)[number];

let cachedDb: Firestore | null | undefined;
let cachedAuth: Auth | null | undefined;

function readEnv(name: FirebaseEnvKey): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Firebase env: ${name}`);
  }
  return value;
}

export function isFirebaseAdminConfigured(): boolean {
  return FIREBASE_ENV_KEYS.every((key) => Boolean(process.env[key]));
}

function getOrCreateAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      projectId: readEnv("FIREBASE_PROJECT_ID"),
      clientEmail: readEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: readEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

export function getFirebaseAdminDb(): Firestore | null {
  if (cachedDb !== undefined) {
    return cachedDb;
  }

  if (!isFirebaseAdminConfigured()) {
    cachedDb = null;
    return cachedDb;
  }

  const app = getOrCreateAdminApp();
  cachedDb = getFirestore(app);
  return cachedDb;
}

export function getFirebaseAdminAuth(): Auth | null {
  if (cachedAuth !== undefined) {
    return cachedAuth;
  }

  if (!isFirebaseAdminConfigured()) {
    cachedAuth = null;
    return cachedAuth;
  }

  const app = getOrCreateAdminApp();
  cachedAuth = getAuth(app);
  return cachedAuth;
}
