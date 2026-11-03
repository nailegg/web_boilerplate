import { db } from "@/lib/db";
import { getHandler } from "@/server/jobs/registry";

export async function runNextJob() {
  const pending = await db.job.findFirst({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } });
  if (!pending) return false;
  const claimed = await db.job.updateMany({ where: { id: pending.id, status: "PENDING" }, data: { status: "RUNNING", attempts: { increment: 1 }, startedAt: new Date(), error: null } });
  if (claimed.count === 0) return false;
  try {
    const handler = getHandler(pending.type);
    if (!handler) throw new Error(`Unknown job type: ${pending.type}`);
    const result = await handler(JSON.parse(pending.payload), { jobId: pending.id, attempt: pending.attempts + 1 });
    await db.job.update({ where: { id: pending.id }, data: { status: "SUCCEEDED", result: JSON.stringify(result), finishedAt: new Date() } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await db.job.update({ where: { id: pending.id }, data: { status: pending.attempts + 1 < pending.maxAttempts ? "PENDING" : "FAILED", error: message, finishedAt: pending.attempts + 1 < pending.maxAttempts ? null : new Date() } });
  }
  return true;
}
