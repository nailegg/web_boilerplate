import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/require-user";

export const GET = withAuth(async (_request, user) => NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }));
