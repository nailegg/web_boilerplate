import { runNextJob } from "@/server/jobs/runner";

console.log("Job worker started");

async function main() {
  while (true) {
    const processed = await runNextJob();
    if (!processed) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

void main();
