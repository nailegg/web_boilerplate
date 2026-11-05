import { requirePageUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  const user = await requirePageUser();
  return <main><div className="card"><span className="badge">Authenticated</span><h1>작업공간</h1><p>{user.name}님, 과제 기능을 추가할 준비가 되었습니다.</p></div></main>;
}
