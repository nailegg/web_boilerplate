import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const jobs = await db.job.findMany({ where: user.role === "ADMIN" ? undefined : { requestedBy: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json();
  const type = String(body.type ?? "example");
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const maxAttempts = Math.min(Math.max(Number(body.maxAttempts ?? 3), 1), 5);
  const job = await db.job.create({ data: { type, payload: JSON.stringify(payload), maxAttempts, requestedBy: user.id } });
  return NextResponse.json({ job }, { status: 201 });
}
