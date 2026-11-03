"use client";

import { useEffect, useState } from "react";

type Job = { id: string; type: string; status: string; result?: string | null; error?: string | null };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  async function load() { const response = await fetch("/api/jobs"); if (response.ok) setJobs((await response.json()).jobs); }
  async function create() { await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "example", payload: { source: "ui" } }) }); await load(); }
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 1000); return () => clearInterval(timer); }, []);
  return <main><div className="card"><h1>Jobs</h1><button onClick={create}>Example Job 실행</button><ul>{jobs.map((job) => <li key={job.id}><strong>{job.type}</strong> — {job.status}{job.error && ` (${job.error})`}</li>)}</ul></div></main>;
}
