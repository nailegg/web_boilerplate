import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const records = await db.record.findMany({ where: user.role === "ADMIN" ? undefined : { ownerId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
  const record = await db.record.create({ data: { title, description: String(body.description ?? ""), ownerId: user.id } });
  return NextResponse.json({ record }, { status: 201 });
}
