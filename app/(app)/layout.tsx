import Link from "next/link";
import { requirePageUser } from "@/lib/auth/require-user";
import { LogoutButton } from "@/components/LogoutButton";

// (app) 그룹의 모든 화면은 로그인 필요. 관리자 전용 화면은 page에서 requirePageUser("ADMIN")을 다시 호출한다.
export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePageUser();
  return (
    <>
      <header className="nav">
        {/* BOILERPLATE-PLACEHOLDER: 과제 화면 링크로 교체한다. */}
        <nav>
          <Link href="/dashboard">작업공간</Link>
          <Link href="/jobs">Jobs</Link>
          {user.role === "ADMIN" && <Link href="/admin">관리자</Link>}
        </nav>
        <div className="nav-user">
          <span data-testid="current-user">{user.name}</span>
          <span className="badge">{user.role}</span>
          <LogoutButton />
        </div>
      </header>
      {children}
    </>
  );
}
