"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { loadLLMApiKey, loadLLMUserSettings } from "@/lib/llm/settings";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

type Evidence = {
  citation: number;
  claim: string;
  support: string;
};

type Msg = {
  role: "user" | "assistant";
  text: string;
  links?: Array<{ title: string; url: string; type: string }>;
  evidence?: Evidence[];
};

type SearchResult = {
  type: "lesson" | "challenge" | "playbook";
  title: string;
  url: string;
  snippet: string;
  score: number;
};

export function ChatWidget() {
  const pathname = usePathname() ?? "/";
  const { user, session } = useSupabaseAuth();

  const explainUiEnabled =
    process.env.NEXT_PUBLIC_ENABLE_EXPLAIN_CHAT === "true" ||
    process.env.NODE_ENV !== "production";
  const enabled = useMemo(() => {
    // Only show inside the app shell (not landing/login/callback)
    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/auth")) {
      return false;
    }
    return true;
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "explain">("search");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask me about RAG concepts or platform content. Use Search for links, or Explain (BYOK) for grounded explanations with citations.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  if (!enabled) return null;

  async function send() {
    const q = input.trim();
    if (!q || busy) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);

    try {
      if (mode === "search") {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = (await res.json()) as { results: SearchResult[] };
        const results = json.results ?? [];

        if (results.length === 0) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "I couldn’t find anything in the current content. Try different keywords (e.g. “chunking”, “reranking”, “prompt injection”).",
            },
          ]);
        } else {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "Here are the most relevant resources in RAG Academy:",
              links: results.map((r) => ({
                title: r.title,
                url: r.url,
                type: r.type,
              })),
            },
          ]);
        }
      } else {
        if (!user || !session?.access_token) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "Sign in to use Explain mode (BYOK).",
              links: [{ title: "Go to Login", url: "/login", type: "page" }],
            },
          ]);
          return;
        }

        const settings = loadLLMUserSettings();
        const apiKey = loadLLMApiKey(settings);
        if (!apiKey) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "To use Explain mode, set your API key in Profile → LLM (Bring Your Own Key).",
              links: [{ title: "Go to Profile", url: "/profile", type: "page" }],
            },
          ]);
          return;
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
            "x-supabase-access-token": session.access_token,
          },
          body: JSON.stringify({ q, model: settings.model }),
        });

        const json = (await res.json()) as
          | { answer: string; sources?: Array<{ title: string; url: string; type: string }>; evidence?: Evidence[] }
          | { error: string; details?: string };

        if (!res.ok || "error" in json) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: `Explain failed: ${"error" in json ? json.error : "Request failed"}${
                "details" in json && json.details ? ` (${json.details})` : ""
              }`,
            },
          ]);
          return;
        }

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: json.answer,
            links: (json.sources ?? []).map((s) => ({
              title: s.title,
              url: s.url,
              type: s.type,
            })),
            evidence: json.evidence,
          },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Search failed: ${e instanceof Error ? e.message : String(e)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white shadow-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {open ? "Close" : "Chat"}
      </button>

      {open ? (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold tracking-tight">RAG Assistant</p>
              <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-1 text-xs dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className={[
                    "rounded-full px-2 py-1 transition-colors",
                    mode === "search"
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  Search
                </button>
                {explainUiEnabled ? (
                  <button
                    type="button"
                    onClick={() => setMode("explain")}
                    className={[
                      "rounded-full px-2 py-1 transition-colors",
                      mode === "explain"
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    Explain (BYOK)
                  </button>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
            >
              close
            </button>
          </div>

          <div ref={listRef} className="max-h-[55vh] overflow-auto p-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    "rounded-2xl border p-3 text-sm leading-6",
                    m.role === "user"
                      ? "self-end border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
                      : "self-start border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
                  ].join(" ")}
                >
                  <p className="text-zinc-950 dark:text-zinc-50">{m.text}</p>
                  {m.links && m.links.length ? (
                    <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        Sources
                      </p>
                      <ul className="space-y-1">
                        {m.links.map((l, idx) => (
                          <li key={l.url} className="flex items-baseline gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {idx + 1}
                            </span>
                            <a
                              href={l.url}
                              className="text-xs font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-400"
                            >
                              {l.title}
                            </a>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                              {l.type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {m.evidence && m.evidence.length > 0 ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[10px] font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300">
                        Why this answer? ({m.evidence.length} claims verified)
                      </summary>
                      <div className="mt-2 space-y-2">
                        {m.evidence.map((e, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                {e.citation}
                              </span>
                              <div>
                                <p className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {e.claim}
                                </p>
                                <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                                  <span className="font-medium">Evidence:</span> &quot;{e.support}&quot;
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder="Ask about chunking, retrieval, evaluation…"
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {busy ? "…" : "Send"}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Tip: “Explain” requires login + your browser-stored API key. Your key is forwarded to the provider (not stored).
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}


