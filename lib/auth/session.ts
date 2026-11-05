import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "session_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
// 내부 Browser가 다른 origin(iframe 프록시)이라 로그인이 반복되면 .env에 COOKIE_SAMESITE="none", COOKIE_SECURE="true"를 넣고 서버를 재시작한다.
const SAME_SITE = (process.env.COOKIE_SAMESITE ?? "lax") as "lax" | "strict" | "none";
const SECURE = process.env.COOKIE_SECURE === "true" || SAME_SITE === "none";

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({ data: { token, userId, expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000) } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: SAME_SITE, secure: SECURE, maxAge: MAX_AGE_SECONDS, path: "/" });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function clearSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { token } });
  (await cookies()).delete(COOKIE);
}
