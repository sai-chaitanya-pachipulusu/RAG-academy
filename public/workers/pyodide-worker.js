"use strict";

// Simple Pyodide worker for running Python (and a basic "tests" mode).
// This is intentionally a plain JS file served from /public so Next doesn't need
// special bundler config for workers.

const PYODIDE_VERSION = "0.27.2";
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

// Max characters captured from stdout/stderr before truncation.
const STDOUT_MAX_CHARS = 50_000;

const RUNNER = `
import io
import json
import sys
import traceback

_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr

# ── User namespace ──────────────────────────────────────────────────────────
# User code runs here. _SCORE / _METRICS / _VISUALS are intentionally absent
# so the user cannot pre-seed them to spoof test results.
user_ns = {}
if "DATASET_JSON" in globals() and DATASET_JSON:
    user_ns["DATASET"] = json.loads(DATASET_JSON)

ok = True
try:
    exec(USER_CODE, user_ns, user_ns)
except Exception:
    ok = False
    traceback.print_exc()

# ── Test namespace ──────────────────────────────────────────────────────────
# Test code runs in a fresh namespace that can READ user_ns symbols but
# cannot be poisoned by user-defined _SCORE / _METRICS / _VISUALS because
# those sentinel names are explicitly reset here before exec.
_score = None
_metrics = None
_visuals = None

if ok and MODE == "test":
    test_ns = dict(user_ns)          # shallow copy — user functions are visible
    test_ns["_SCORE"] = None         # reset sentinels so user can't pre-set them
    test_ns["_METRICS"] = None
    test_ns["_VISUALS"] = None
    try:
        exec(TEST_CODE, test_ns, test_ns)
        _score = test_ns.get("_SCORE", None)
        _metrics = test_ns.get("_METRICS", None)
        _visuals = test_ns.get("_VISUALS", None)
    except Exception:
        ok = False
        traceback.print_exc()

# ── Capture & truncate output ───────────────────────────────────────────────
_raw_stdout = _stdout.getvalue()
_raw_stderr = _stderr.getvalue()
_stdout_truncated = len(_raw_stdout) > STDOUT_MAX_CHARS
_stderr_truncated = len(_raw_stderr) > STDOUT_MAX_CHARS

__result__ = json.dumps({
  "ok": ok,
  "stdout": (_raw_stdout[:STDOUT_MAX_CHARS] + "\\n[output truncated]") if _stdout_truncated else _raw_stdout,
  "stderr": (_raw_stderr[:STDOUT_MAX_CHARS] + "\\n[output truncated]") if _stderr_truncated else _raw_stderr,
  "score": _score,
  "metrics": _metrics,
  "visuals": _visuals,
})
__result__
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
    pyodide.globals.set("STDOUT_MAX_CHARS", STDOUT_MAX_CHARS);

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


