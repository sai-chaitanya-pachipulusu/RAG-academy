export type TSExecMode = "run" | "test";

export type TSRequest = {
  id: string;
  mode: TSExecMode;
  userCode: string;
  testCode?: string;
  dataset?: unknown;
};

export type TSResponse = {
  id: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  durationMs?: number;
  score?: number | null;
  metrics?: Record<string, number | string> | null;
};
