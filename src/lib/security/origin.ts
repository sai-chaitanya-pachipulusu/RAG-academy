function parseOriginsCsv(csv: string | undefined | null) {
  const raw = (csv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const v of raw) {
    try {
      // Allow either a raw origin or a full URL; normalize to origin.
      out.push(v.includes("://") ? new URL(v).origin : v);
    } catch {
      // ignore invalid entries
    }
  }
  return out;
}

export function isAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser or same-origin fetch without Origin

  const allowed = new Set<string>();
  for (const o of parseOriginsCsv(process.env.ALLOWED_ORIGINS)) allowed.add(o);

  // Dev convenience defaults.
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  // If no allowlist configured, default to same-origin behavior in dev, strict in prod.
  if (allowed.size === 0) {
    return process.env.NODE_ENV !== "production";
  }

  return allowed.has(origin);
}


