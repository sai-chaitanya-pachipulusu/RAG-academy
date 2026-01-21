export function isChatProxyEnabled() {
  // Default: enabled in dev for local iteration; disabled in prod unless explicitly enabled.
  if (process.env.NODE_ENV !== "production") return true;
  return (process.env.ENABLE_CHAT_PROXY ?? "").toLowerCase() === "true";
}


