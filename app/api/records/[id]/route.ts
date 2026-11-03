import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

async function findOwned(id: string) {
  const user = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  const record = await db.record.findUnique({ where: { id } });
  if (!record) return { response: NextResponse.json({ error: "레코드를 찾을 수 없습니다." }, { status: 404 }) };
  if (user.role !== "ADMIN" && record.ownerId !== user.id) return { response: NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 }) };
  return { user, record };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await findOwned((await params).id);
  if (result.response) return result.response;
  return NextResponse.json({ record: result.record });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await findOwned((await params).id);
  if (result.response) return result.response;
  const body = await request.json();
  const data = { ...(body.title !== undefined ? { title: String(body.title).trim() } : {}), ...(body.description !== undefined ? { description: String(body.description) } : {}), ...(body.status !== undefined ? { status: String(body.status) } : {}) };
  if (data.title === "") return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
  const record = await db.record.update({ where: { id: result.record!.id }, data });
  return NextResponse.json({ record });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await findOwned((await params).id);
  if (result.response) return result.response;
  await db.record.delete({ where: { id: result.record!.id } });
  return new NextResponse(null, { status: 204 });
}
