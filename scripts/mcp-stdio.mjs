/**
 * Stdio MCP launcher — chdirs to repo root, then runs the server with no stdout noise.
 * Do NOT use `npm run` as the MCP stdio command; npm prints lifecycle lines to stdout
 * and breaks the JSON-RPC wire protocol.
 */
import { spawn } from "node:child_process";
import { chdir } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
chdir(root);

const child = spawn(process.execPath, ["--import", "tsx", "mcp/server.ts"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
