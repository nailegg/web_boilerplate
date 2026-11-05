import { requirePageUser } from "@/lib/auth/require-user";

// BOILERPLATE-PLACEHOLDER: 과제의 첫 화면(역할별 진입 화면)으로 교체한다.
export default async function DashboardPage() {
  const user = await requirePageUser();
  return <main><div className="card"><span className="badge">Authenticated</span><h1>작업공간</h1><p>{user.name}님, 과제 기능을 추가할 준비가 되었습니다.</p></div></main>;
}
