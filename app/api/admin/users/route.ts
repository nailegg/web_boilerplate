import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/require-user";

export const GET = withAuth(async () => {
  const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ users });
}, { role: "ADMIN" });
