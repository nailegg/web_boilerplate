import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { errorResponse, readJson } from "@/lib/http";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await readJson(request); } catch (error) { return errorResponse(error); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(String(body.password ?? ""), user.passwordHash))) return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
