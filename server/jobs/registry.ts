type JobContext = { jobId: string; attempt: number };
type Handler = (payload: Record<string, unknown>, context: JobContext) => Promise<unknown>;

// BOILERPLATE-PLACEHOLDER: example/failure/flaky는 예시 handler다. 과제 handler로 교체한다.
const handlers: Record<string, Handler> = {
  example: async (payload) => ({ message: "Job completed", input: payload, completedAt: new Date().toISOString() }),
  failure: async () => { throw new Error("Intentional failure for retry testing"); },
  flaky: async (payload, context) => {
    const failUntil = Number(payload.failUntil ?? 1);
    if (context.attempt <= failUntil) throw new Error(`Temporary failure on attempt ${context.attempt}`);
    return { message: "Recovered after retry", attempt: context.attempt };
  }
};

export function getHandler(type: string) {
  return handlers[type];
}
