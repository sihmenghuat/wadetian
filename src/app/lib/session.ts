import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, userType: string) {
  const expiresAt = new Date(Date.now() + 0.25 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, userType,expiresAt });
  const cookiesStore = await cookies();
  cookiesStore.set("session", session, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax", // Adjust as needed "lax", "strict", or "none"
    domain: undefined, // Don't set domain for host-only
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookiesStore = await cookies();
  cookiesStore.delete("session");
}

type SessionPayload = {
  userId: string;
  userType: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session", error);
    return null;
  }
}
