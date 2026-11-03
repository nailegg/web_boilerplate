"use client";

import { FormEvent, useEffect, useState } from "react";

type RecordItem = { id: string; title: string; description: string; status: string };

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/records");
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "불러오기에 실패했습니다.");
    setRecords(data.records);
  }

  useEffect(() => { void load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, description }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "생성에 실패했습니다.");
    setTitle(""); setDescription(""); setError(""); await load();
  }

  async function remove(id: string) {
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    await load();
  }

  return <main><div className="card"><h1>Records</h1><p>로그인한 사용자의 CRUD 예제입니다.</p>{error && <p role="alert">{error}</p>}<form onSubmit={create}><input aria-label="제목" placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} /><input aria-label="설명" placeholder="설명" value={description} onChange={(event) => setDescription(event.target.value)} /><button type="submit">생성</button></form><ul>{records.map((record) => <li key={record.id}><strong>{record.title}</strong> <span>{record.description}</span> <button onClick={() => remove(record.id)}>삭제</button></li>)}</ul></div></main>;
}
