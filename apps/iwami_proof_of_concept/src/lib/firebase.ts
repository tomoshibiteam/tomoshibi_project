import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { Functions, connectFunctionsEmulator, getFunctions } from "firebase/functions";

type FirebasePublicEnvKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID";

const REQUIRED_FIREBASE_ENV_KEYS: FirebasePublicEnvKey[] = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

let firestoreEmulatorConnected = false;
let functionsEmulatorConnected = false;

function readEnv(value: string | undefined): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  return normalized;
}

function getFirebasePublicEnv() {
  return {
    apiKey: readEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: readEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    appId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    storageBucket: readEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    measurementId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
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
  if (!config) return null;

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export function getFirebaseClientAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getAuth(app);
}

function readOptionalEnv(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function shouldUseFirebaseEmulators(): boolean {
  const raw = readOptionalEnv(process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS);
  if (!raw) return false;
  const normalized = raw.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function getFirebaseClientFirestore(): Firestore | null {
  const app = getFirebaseClientApp();
  if (!app) return null;

  const firestore = getFirestore(app);
  if (!shouldUseFirebaseEmulators()) {
    return firestore;
  }

  const emulatorHost = readOptionalEnv(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST);
  const emulatorPortRaw = readOptionalEnv(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT);
  const emulatorPort = emulatorPortRaw ? Number(emulatorPortRaw) : null;

  if (
    emulatorHost &&
    emulatorPort &&
    Number.isInteger(emulatorPort) &&
    emulatorPort > 0 &&
    !firestoreEmulatorConnected
  ) {
    connectFirestoreEmulator(firestore, emulatorHost, emulatorPort);
    firestoreEmulatorConnected = true;
  }

  return firestore;
}

export function getFirebaseClientFunctions(region = "asia-northeast1"): Functions | null {
  const app = getFirebaseClientApp();
  if (!app) return null;

  const functions = getFunctions(app, region);
  if (!shouldUseFirebaseEmulators()) {
    return functions;
  }

  const emulatorHost = readOptionalEnv(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST);
  const emulatorPortRaw = readOptionalEnv(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);
  const emulatorPort = emulatorPortRaw ? Number(emulatorPortRaw) : null;

  if (
    emulatorHost &&
    emulatorPort &&
    Number.isInteger(emulatorPort) &&
    emulatorPort > 0 &&
    !functionsEmulatorConnected
  ) {
    connectFunctionsEmulator(functions, emulatorHost, emulatorPort);
    functionsEmulatorConnected = true;
  }

  return functions;
}
