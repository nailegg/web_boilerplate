// Job/Worker가 필요 없는 과제에서 Job 관련 코드를 일괄 삭제한다.
// 사용법: node scripts/prune-jobs.mjs && pnpm db:push --accept-data-loss && pnpm build
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = (p) => join(root, p);

for (const p of ["app/(app)/jobs", "app/api/jobs", "server/jobs", "worker", "tests/e2e/jobs.spec.ts"]) rmSync(path(p), { recursive: true, force: true });

function edit(file, transform) {
  if (!existsSync(path(file))) return;
  const before = readFileSync(path(file), "utf8");
  const after = transform(before);
  if (after === before) console.warn(`변경 없음: ${file}`);
  writeFileSync(path(file), after);
}

edit("prisma/schema.prisma", (s) => s.replace(/^\s*jobs\s+Job\[\]\n/m, "").replace(/\nmodel Job \{[\s\S]*?\n\}\n?/, "\n"));
edit("app/(app)/layout.tsx", (s) => s.replace(/^.*href="\/jobs".*\n/m, ""));
edit("package.json", (s) => s.replace(/^\s*"worker": .*\n/m, ""));

console.log("Job 기능 삭제 완료. 다음: pnpm db:push --accept-data-loss && pnpm build");
