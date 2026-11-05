import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/require-user";
import { RoleSelect } from "./RoleSelect";

export default async function AdminPage() {
  const admin = await requirePageUser("ADMIN");
  const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } });
  return (
    <main>
      <div className="card">
        <h1>사용자 관리</h1>
        <table>
          <thead><tr><th>이름</th><th>이메일</th><th>역할</th><th>가입일</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.id === admin.id ? user.role : <RoleSelect userId={user.id} email={user.email} role={user.role} />}</td>
                <td>{user.createdAt.toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
