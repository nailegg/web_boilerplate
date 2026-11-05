"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoleSelect({ userId, email, role }: { userId: string; email: string; role: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function change(next: string) {
    const response = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: next }) });
    if (!response.ok) return setError((await response.json()).error ?? "변경 실패");
    setError("");
    router.refresh();
  }
  return <><select aria-label={`${email} 역할`} defaultValue={role} onChange={(event) => void change(event.target.value)}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select>{error && <span role="alert"> {error}</span>}</>;
}
