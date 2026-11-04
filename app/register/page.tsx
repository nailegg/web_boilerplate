"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "회원가입에 실패했습니다.");
    router.push("/dashboard");
  }
  return <main><div className="card"><h1>회원가입</h1>{error && <p role="alert">{error}</p>}<form onSubmit={submit}><input aria-label="이름" placeholder="이름" value={name} onChange={(event) => setName(event.target.value)} required /><input aria-label="이메일" type="email" placeholder="이메일" value={email} onChange={(event) => setEmail(event.target.value)} required /><input aria-label="비밀번호" type="password" placeholder="8자 이상 비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /><button type="submit">회원가입</button></form><p>이미 계정이 있나요? <Link href="/login">로그인</Link></p></div></main>;
}
