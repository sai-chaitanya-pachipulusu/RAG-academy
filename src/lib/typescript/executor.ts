"use client";

import type { TSExecMode, TSRequest, TSResponse } from "./types";

export type TSExecResult = Omit<TSResponse, "id">;

type Pending = {
  resolve: (value: TSExecResult) => void;
  reject: (reason?: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

const DEFAULT_TIMEOUT_MS = 30_000;

let worker: Worker | null = null;
const pendingById = new Map<string, Pending>();

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function teardownWorker(error?: unknown) {
  if (worker) {
    try {
      worker.terminate();
    } catch {
      // ignore
    }
  }
  worker = null;

  // Reject all pending requests
  for (const [, pending] of pendingById) {
    clearTimeout(pending.timeoutId);
    pending.reject(
      error ?? new Error("TypeScript worker terminated before completing request.")
    );
  }
  pendingById.clear();
}

function getWorker() {
  if (typeof window === "undefined") {
    throw new Error("TypeScript executor can only run in the browser.");
  }

  if (worker) return worker;

  worker = new Worker("/workers/typescript-worker.js");

  worker.onmessage = (event: MessageEvent<TSResponse>) => {
    const msg = event.data;
    const pending = pendingById.get(msg.id);
    if (!pending) return;

    pendingById.delete(msg.id);
    clearTimeout(pending.timeoutId);
    pending.resolve({
      ok: msg.ok,
      stdout: msg.stdout,
      stderr: msg.stderr,
      error: msg.error,
      durationMs: msg.durationMs,
      score: msg.score,
      metrics: msg.metrics,
    });
  };

  worker.onerror = (event) => {
    teardownWorker(
      new Error(
        event instanceof ErrorEvent ? event.message : "TypeScript worker error."
      )
    );
  };

  return worker;
}

function request(
  mode: TSExecMode,
  userCode: string,
  testCode?: string,
  dataset?: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const id = randomId();
  const w = getWorker();

  return new Promise<TSExecResult>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      teardownWorker(new Error(`Execution timed out after ${timeoutMs}ms.`));
      reject(new Error(`Execution timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    pendingById.set(id, { resolve, reject, timeoutId });

    const payload: TSRequest = { id, mode, userCode, testCode, dataset };
    w.postMessage(payload);
  });
}

export const typescriptExec = {
  run(userCode: string, timeoutMs?: number) {
    return request("run", userCode, undefined, undefined, timeoutMs);
  },
  test(userCode: string, testCode: string, dataset?: unknown, timeoutMs?: number) {
    return request("test", userCode, testCode, dataset, timeoutMs);
  },
  reset() {
    teardownWorker();
  },
};
