import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <main><div className="card"><span className="badge">Authenticated</span><h1>작업공간</h1><p>{user.name}님, 과제 기능을 추가할 준비가 되었습니다.</p><nav><Link href="/jobs">Job 실행 기반 열기</Link></nav></div></main>;
}
