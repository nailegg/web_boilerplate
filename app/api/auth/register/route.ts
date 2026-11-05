import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { errorResponse, readJson } from "@/lib/http";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await readJson(request); } catch (error) { return errorResponse(error); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? email.split("@")[0]).trim();
  if (!email || password.length < 8) return NextResponse.json({ error: "이메일과 8자 이상의 비밀번호가 필요합니다." }, { status: 400 });
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  const user = await db.user.create({ data: { email, name, passwordHash: await hashPassword(password) } });
  await createSession(user.id);
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
