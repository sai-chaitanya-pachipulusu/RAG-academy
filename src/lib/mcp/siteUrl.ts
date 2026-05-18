/**
 * Public site URL for absolute links in MCP tool responses.
 * Prefer RAG_ACADEMY_SITE_URL, then NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL (the app commonly uses the latter).
 */
export function getPublicSiteOrigin(): string | null {
  const raw =
    process.env.RAG_ACADEMY_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (!raw) return null;
  try {
    const u = new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
    return u.origin;
  } catch {
    return null;
  }
}

/** Turn a site path (/learn/...) into an absolute URL when origin is configured. */
export function toAbsoluteSiteUrl(path: string, origin: string | null): string {
  if (!path.startsWith("/") || !origin) return path;
  return `${origin}${path}`;
}
