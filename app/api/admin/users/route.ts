import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-user";

export async function GET() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ users });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "관리자 권한이 필요합니다." : "로그인이 필요합니다." }, { status });
  }
}
