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
    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/auth")) {
      return false;
    }
    return true;
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "ask" | "explain">("ask");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask me anything about RAG engineering. I'll answer using the RAG Academy curriculum with citations.",
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
              text: `I couldn't find anything in the current content. Try different keywords (e.g. "chunking", "reranking", "prompt injection").`,
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
      } else if (mode === "ask") {
        if (!user || !session?.access_token) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: "Sign in to use AI-powered answers.",
              links: [{ title: "Go to Login", url: "/login", type: "page" }],
            },
          ]);
          return;
        }

        const res = await fetch("/api/rag/ask", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-supabase-access-token": session.access_token,
          },
          body: JSON.stringify({ q }),
        });

        const json = await res.json() as
          | { answer: string; sources?: Array<{ title: string; url: string; type: string }>; evidence?: Evidence[] }
          | { error: string };

        if (!res.ok || "error" in json) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: `Ask failed: ${"error" in json ? json.error : "Request failed"}`,
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
        className="fixed bottom-5 right-5 z-50 inline-flex h-11 items-center justify-center rounded-full bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-lg hover:bg-[#2563EB] cursor-pointer"
      >
        {open ? "Close" : "Ask AI"}
      </button>

      {open ? (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold tracking-tight">RAG Co-pilot</p>
              <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("ask")}
                  className={[
                    "rounded-full px-2 py-1 transition-all duration-200",
                    mode === "ask"
                      ? "bg-[#3B82F6] text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  ].join(" ")}
                >
                  Ask AI
                </button>
                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className={[
                    "rounded-full px-2 py-1 transition-all duration-200",
                    mode === "search"
                      ? "bg-[#3B82F6] text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  ].join(" ")}
                >
                  Search
                </button>
                {explainUiEnabled ? (
                  <button
                    type="button"
                    onClick={() => setMode("explain")}
                    className={[
                      "rounded-full px-2 py-1 transition-all duration-200",
                      mode === "explain"
                        ? "bg-[#3B82F6] text-white"
                        : "text-gray-600 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    BYOK
                  </button>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-600 hover:underline cursor-pointer"
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
                      ? "self-end border-gray-200 bg-gray-50"
                      : "self-start border-gray-200 bg-white",
                  ].join(" ")}
                >
                  <p className="text-gray-950">{m.text}</p>
                  {m.links && m.links.length ? (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/50 p-2">
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Sources
                      </p>
                      <ul className="space-y-1">
                        {m.links.map((l, idx) => (
                          <li key={l.url} className="flex items-baseline gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">
                              {idx + 1}
                            </span>
                            <a
                              href={l.url}
                              className="text-xs font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500 cursor-pointer"
                            >
                              {l.title}
                            </a>
                            <span className="text-[10px] text-gray-400">
                              {l.type}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {m.evidence && m.evidence.length > 0 ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[10px] font-medium text-gray-500 hover:text-gray-700">
                        Why this answer? ({m.evidence.length} claims verified)
                      </summary>
                      <div className="mt-2 space-y-2">
                        {m.evidence.map((e, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-gray-200 bg-white p-2 text-xs"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                {e.citation}
                              </span>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {e.claim}
                                </p>
                                <p className="mt-1 text-gray-500">
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

          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder="Ask about chunking, retrieval, evaluation..."
                className="h-10 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6] px-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "..." : "Send"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {mode === "ask"
                ? "Powered by RAG Academy AI. Free: 10 questions/day. Pro: unlimited."
                : mode === "search"
                  ? "Keyword search across all curriculum content."
                  : "Bring Your Own Key: uses your OpenAI API key."}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
