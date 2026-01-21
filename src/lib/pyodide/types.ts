export type PyodideExecMode = "run" | "test";

export type PyodideRequest = {
  id: string;
  mode: PyodideExecMode;
  userCode: string;
  testCode?: string;
  dataset?: any;
};

export type PyodideResponse = {
  id: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  durationMs?: number;
  score?: number | null;
  metrics?: Record<string, number | string> | null;
  visuals?: any;
};


