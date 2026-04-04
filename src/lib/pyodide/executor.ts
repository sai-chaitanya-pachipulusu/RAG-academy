"use client";

import type { PyodideExecMode, PyodideRequest, PyodideResponse } from "./types";

export type PyodideExecResult = Omit<PyodideResponse, "id">;

type Pending = {
  resolve: (value: PyodideExecResult) => void;
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

  // Reject all pending requests.
  for (const [, pending] of pendingById) {
    clearTimeout(pending.timeoutId);
    pending.reject(
      error ?? new Error("Pyodide worker terminated before completing request.")
    );
  }
  pendingById.clear();
}

function getWorker() {
  if (typeof window === "undefined") {
    throw new Error("Pyodide executor can only run in the browser.");
  }

  if (worker) return worker;

  worker = new Worker("/workers/pyodide-worker.js");

  worker.onmessage = (event: MessageEvent<PyodideResponse>) => {
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
      visuals: msg.visuals,
    });
  };

  worker.onerror = (event) => {
    teardownWorker(
      new Error(
        event instanceof ErrorEvent ? event.message : "Pyodide worker error."
      )
    );
  };

  return worker;
}

function request(
  mode: PyodideExecMode,
  userCode: string,
  testCode?: string,
  dataset?: any,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const id = randomId();
  const w = getWorker();

  return new Promise<PyodideExecResult>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      // teardownWorker rejects all pending promises (including this one) and
      // clears their timeouts — no separate reject() call needed here.
      teardownWorker(new Error(`Execution timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    pendingById.set(id, { resolve, reject, timeoutId });

    const payload: PyodideRequest = { id, mode, userCode, testCode, dataset };
    w.postMessage(payload);
  });
}

export const pyodideExec = {
  run(userCode: string, timeoutMs?: number) {
    return request("run", userCode, undefined, undefined, timeoutMs);
  },
  test(userCode: string, testCode: string, dataset?: any, timeoutMs?: number) {
    return request("test", userCode, testCode, dataset, timeoutMs);
  },
  reset() {
    teardownWorker();
  },
  /**
   * Preload the Pyodide worker in advance to reduce first-run latency.
   * Call this when the challenge page mounts.
   */
  preload() {
    if (typeof window !== "undefined") {
      // Just instantiate the worker - it will start loading Pyodide
      getWorker();
    }
  },
};

