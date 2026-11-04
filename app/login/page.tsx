"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "로그인에 실패했습니다.");
    router.push("/dashboard");
  }
  return <main><div className="card"><h1>로그인</h1>{error && <p role="alert">{error}</p>}<form onSubmit={submit}><input aria-label="이메일" type="email" placeholder="이메일" value={email} onChange={(event) => setEmail(event.target.value)} required /><input aria-label="비밀번호" type="password" placeholder="비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="submit">로그인</button></form><p>계정이 없나요? <Link href="/register">회원가입</Link></p></div></main>;
}
