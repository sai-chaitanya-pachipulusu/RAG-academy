"use strict";

// Simple Pyodide worker for running Python (and a basic "tests" mode).
// This is intentionally a plain JS file served from /public so Next doesn't need
// special bundler config for workers.

const PYODIDE_VERSION = "0.25.1";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReadyPromise = null;

async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      // loadPyodide is attached to the global scope by this script.
      importScripts(`${PYODIDE_BASE_URL}pyodide.js`);
      return await loadPyodide({ indexURL: PYODIDE_BASE_URL });
    })();
  }
  return pyodideReadyPromise;
}

const RUNNER = `
import io
import json
import sys
import traceback

_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr

ns = {}
if "DATASET_JSON" in globals() and DATASET_JSON:
    ns["DATASET"] = json.loads(DATASET_JSON)

ok = True
try:
    exec(USER_CODE, ns, ns)
    if MODE == "test":
        exec(TEST_CODE, ns, ns)
except Exception:
    ok = False
    traceback.print_exc()


json.dumps({
  "ok": ok,
  "stdout": _stdout.getvalue(),
  "stderr": _stderr.getvalue(),
  "score": ns.get("_SCORE", None),
  "metrics": ns.get("_METRICS", None),
  "visuals": ns.get("_VISUALS", None)
})
`;

// Message format:
// { id: string, mode: "run" | "test", userCode: string, testCode?: string }
// Response:
// { id: string, ok: boolean, stdout: string, stderr: string, error?: string, score?: number, metrics?: object }
self.onmessage = async (event) => {
  const startedAt = Date.now();
  const { id, mode, userCode, testCode, dataset } = event.data ?? {};

  if (!id || (mode !== "run" && mode !== "test") || typeof userCode !== "string") {
    self.postMessage({
      id: id ?? "unknown",
      ok: false,
      stdout: "",
      stderr: "",
      error: "Invalid request payload.",
      durationMs: Date.now() - startedAt,
    });
    return;
  }

  try {
    const pyodide = await ensurePyodide();
    pyodide.globals.set("MODE", mode);
    pyodide.globals.set("USER_CODE", userCode);
    pyodide.globals.set("TEST_CODE", typeof testCode === "string" ? testCode : "");
    pyodide.globals.set("DATASET_JSON", dataset ? JSON.stringify(dataset) : "");

    const jsonStr = await pyodide.runPythonAsync(RUNNER);
    const parsed = JSON.parse(jsonStr);

    self.postMessage({
      id,
      ok: Boolean(parsed.ok),
      stdout: String(parsed.stdout ?? ""),
      stderr: String(parsed.stderr ?? ""),
      score: typeof parsed.score === "number" ? parsed.score : null,
      metrics: parsed.metrics && typeof parsed.metrics === "object" ? parsed.metrics : null,
      visuals: parsed.visuals ?? null,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      stdout: "",
      stderr: "",
      error: err && err.message ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
  }
};


