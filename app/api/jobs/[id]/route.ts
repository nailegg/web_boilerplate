import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const job = await db.job.findUnique({ where: { id: (await params).id } });
  if (!job) return NextResponse.json({ error: "Job을 찾을 수 없습니다." }, { status: 404 });
  if (user.role !== "ADMIN" && job.requestedBy !== user.id) return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  return NextResponse.json({ job });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const job = await db.job.findUnique({ where: { id: (await params).id } });
  if (!job) return NextResponse.json({ error: "Job을 찾을 수 없습니다." }, { status: 404 });
  if (user.role !== "ADMIN" && job.requestedBy !== user.id) return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  if (job.status !== "FAILED") return NextResponse.json({ error: "실패한 Job만 재시도할 수 있습니다." }, { status: 409 });
  const retried = await db.job.update({ where: { id: job.id }, data: { status: "PENDING", attempts: 0, error: null, result: null, startedAt: null, finishedAt: null } });
  return NextResponse.json({ job: retried });
}
