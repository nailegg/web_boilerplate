import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/require-user";
import { HttpError } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

async function findAccessibleJob(id: string, user: User) {
  const job = await db.job.findUnique({ where: { id } });
  if (!job) throw new HttpError(404, "Job을 찾을 수 없습니다.");
  if (user.role !== "ADMIN" && job.requestedBy !== user.id) throw new HttpError(403, "접근 권한이 없습니다.");
  return job;
}

export const GET = withAuth<Context>(async (_request, user, { params }) => {
  const job = await findAccessibleJob((await params).id, user);
  return NextResponse.json({ job });
});

export const POST = withAuth<Context>(async (_request, user, { params }) => {
  const job = await findAccessibleJob((await params).id, user);
  if (job.status !== "FAILED") throw new HttpError(409, "실패한 Job만 재시도할 수 있습니다.");
  const retried = await db.job.update({ where: { id: job.id }, data: { status: "PENDING", attempts: 0, error: null, result: null, startedAt: null, finishedAt: null } });
  return NextResponse.json({ job: retried });
});
