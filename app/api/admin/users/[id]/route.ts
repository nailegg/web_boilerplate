import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/require-user";
import { HttpError, readJson } from "@/lib/http";

const ROLES = ["USER", "ADMIN"];

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request, admin, { params }) => {
  const { id } = await params;
  const body = await readJson(request);
  const role = String(body.role ?? "");
  if (!ROLES.includes(role)) throw new HttpError(400, "role은 USER 또는 ADMIN이어야 합니다.");
  if (id === admin.id) throw new HttpError(409, "자신의 역할은 변경할 수 없습니다.");
  if (!(await db.user.findUnique({ where: { id } }))) throw new HttpError(404, "사용자를 찾을 수 없습니다.");
  const user = await db.user.update({ where: { id }, data: { role }, select: { id: true, email: true, name: true, role: true } });
  return NextResponse.json({ user });
}, { role: "ADMIN" });
