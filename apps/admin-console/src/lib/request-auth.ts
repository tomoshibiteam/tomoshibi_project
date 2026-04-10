import { cookies, headers } from "next/headers";
import { AUTH_ID_TOKEN_COOKIE } from "./auth-constants";
import { getFirebaseAdminAuth } from "./firebase-admin";

export type RequestAuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
};

function readBearerToken(headerValue: string | null): string {
  if (!headerValue) {
    return "";
  }

  const [scheme, token] = headerValue.trim().split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }
  return token.trim();
}

function decodeToken(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getRequestAuthUser(): Promise<RequestAuthUser | null> {
  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return null;
  }

  const requestHeaders = await headers();
  const requestCookies = await cookies();

  const tokenFromHeader = readBearerToken(requestHeaders.get("authorization"));
  const tokenFromCookie = requestCookies.get(AUTH_ID_TOKEN_COOKIE)?.value?.trim() ?? "";
  const rawToken = tokenFromHeader || tokenFromCookie;

  if (!rawToken) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(decodeToken(rawToken));
    return {
      uid: decodedToken.uid,
      email: typeof decodedToken.email === "string" ? decodedToken.email : null,
      name: typeof decodedToken.name === "string" ? decodedToken.name : null,
    };
  } catch {
    return null;
  }
}
