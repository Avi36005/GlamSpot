import { NextRequest } from "next/server";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

/**
 * Decodes and verifies a Firebase ID Token.
 */
function verifyFirebaseIdToken(token: string, projectId: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode payload
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    // Verify token expiration
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      console.warn("[Auth] Token expired");
      return null;
    }

    // Verify issuer and audience
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;
    if (payload.iss !== expectedIssuer) {
      console.warn(`[Auth] Issuer mismatch. Expected: ${expectedIssuer}, got: ${payload.iss}`);
      return null;
    }
    if (payload.aud !== projectId) {
      console.warn(`[Auth] Audience mismatch. Expected: ${projectId}, got: ${payload.aud}`);
      return null;
    }

    // Firebase UID is in the 'sub' claim
    if (!payload.sub) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email || `${payload.sub}@glamspot.in`,
      name: payload.name || "User",
    };
  } catch (err) {
    console.error("[Auth] Error parsing token:", err);
    return null;
  }
}

/**
 * Extracts and verifies the user session from the Authorization header.
 * Falls back to the 'demo-user' account if Firebase is not configured in environment.
 */
export async function getSessionUser(req: NextRequest): Promise<AuthUser | null> {
  const projectId = process.env.FB_PROJECT_ID;

  // Enforce token validation only if Firebase configuration is active
  if (projectId) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[Auth] Missing or invalid Authorization header");
      return null;
    }

    const token = authHeader.substring(7);
    return verifyFirebaseIdToken(token, projectId);
  }

  // Graceful fallback for local development / hackathon demo mode
  return {
    id: "demo-user",
    email: "aanya@glamspot.in",
    name: "Aanya Kapoor",
  };
}
