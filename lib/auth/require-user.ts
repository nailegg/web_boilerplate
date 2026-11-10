import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { errorResponse, HttpError } from "@/lib/http";

export type Role = "USER" | "ADMIN";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "로그인이 필요합니다.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new HttpError(403, "관리자 권한이 필요합니다.");
  return user;
}

// 역할 일치 검사. ADMIN은 모든 역할 요구를 통과한다. 새 역할을 Role에 추가하면 그대로 강제된다.
function hasRole(user: User, role?: Role) {
  return !role || user.role === role || user.role === "ADMIN";
}

type RouteContext = { params: Promise<Record<string, string>> };

// Route Handler 래퍼: 인증·역할 검사 후 handler를 실행하고, HttpError를 JSON 응답으로 바꾼다.
// export const GET = withAuth(async (request, user) => NextResponse.json(...), { role: "ADMIN" });
export function withAuth<C extends RouteContext = RouteContext>(handler: (request: Request, user: User, context: C) => Promise<Response>, options: { role?: Role } = {}) {
  return async (request: Request, context: C) => {
    try {
      const user = await requireUser();
      if (!hasRole(user, options.role)) throw new HttpError(403, options.role === "ADMIN" ? "관리자 권한이 필요합니다." : "권한이 없습니다.");
      return await handler(request, user, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

// Server Component 가드: 비로그인은 /login, 역할 불일치는 /dashboard로 보낸다.
export async function requirePageUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasRole(user, role)) redirect("/dashboard");
  return user;
}
