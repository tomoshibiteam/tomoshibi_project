"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTomoshibiAiAuthMode = readTomoshibiAiAuthMode;
exports.applyAuthUserId = applyAuthUserId;
const auth_1 = require("firebase-admin/auth");
function readTomoshibiAiAuthMode() {
    return process.env.TOMOSHIBI_AI_AUTH_MODE === "firebase" ? "firebase" : "local";
}
function readBearerToken(request) {
    const authorization = request.header("authorization")?.trim();
    if (!authorization)
        return null;
    const [scheme, token] = authorization.split(/\s+/, 2);
    if (scheme.toLowerCase() !== "bearer" || !token)
        return null;
    return token;
}
function normalizeBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body))
        return {};
    return body;
}
async function applyAuthUserId(request, response) {
    if (readTomoshibiAiAuthMode() === "local") {
        return true;
    }
    const token = readBearerToken(request);
    if (!token) {
        response.status(401).json({ error: { code: "unauthenticated", message: "Firebase ID token is required." } });
        return false;
    }
    try {
        const decoded = await (0, auth_1.getAuth)().verifyIdToken(token);
        request.body = { ...normalizeBody(request.body), userId: decoded.uid };
        return true;
    }
    catch {
        response.status(401).json({ error: { code: "unauthenticated", message: "Firebase ID token verification failed." } });
        return false;
    }
}
//# sourceMappingURL=auth.js.map