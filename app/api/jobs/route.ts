import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/require-user";
import { readJson } from "@/lib/http";

export const GET = withAuth(async (_request, user) => {
  const jobs = await db.job.findMany({ where: user.role === "ADMIN" ? undefined : { requestedBy: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ jobs });
});

export const POST = withAuth(async (request, user) => {
  const body = await readJson(request);
  const type = String(body.type ?? "example");
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  const maxAttempts = Math.min(Math.max(Number(body.maxAttempts ?? 3), 1), 5);
  const job = await db.job.create({ data: { type, payload: JSON.stringify(payload), maxAttempts, requestedBy: user.id } });
  return NextResponse.json({ job }, { status: 201 });
});
