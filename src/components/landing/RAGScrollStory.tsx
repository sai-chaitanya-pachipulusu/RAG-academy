"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

type Step = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    id: "ingest",
    kicker: "Offline",
    title: "Ingest with traceability",
    body: "Parse → chunk → attach metadata → stable chunk IDs. Debuggability beats cleverness.",
    bullets: [
      "Stable chunk_id + doc_id + offsets",
      "Structure-aware chunking (headers, tables, code)",
      "Dedup + versioning so re-indexing is safe",
    ],
  },
  {
    id: "retrieve",
    kicker: "Online",
    title: "Maximize recall (hybrid + fusion)",
    body: "Default production strategy: BM25 + dense embeddings fused with RRF.",
    bullets: [
      "Metadata filters first (tenant/doc_type/date)",
      "Hybrid retrieval (BM25 + dense)",
      "RRF fusion to avoid score-normalization pitfalls",
    ],
  },
  {
    id: "rerank",
    kicker: "Online",
    title: "Maximize precision (rerank)",
    body: "Rerank top‑20/50 candidates with a cross‑encoder, keep the best 5–10.",
    bullets: [
      "Reranker cascade: cheap shortlist → expensive rerank",
      "MMR diversity to reduce redundancy",
      "Lost-in-the-middle ordering",
    ],
  },
  {
    id: "ground",
    kicker: "Online",
    title: "Ground answers (and refuse safely)",
    body: "Citations, refusal policies, injection/PII defenses — production hardening isn't optional.",
    bullets: [
      "Citation validation (no out-of-range cites)",
      "Refuse on insufficient context",
      "Sanitize prompt injection + redact PII before LLM",
    ],
  },
];

function Diagram({ active }: { active: number }) {
  const stateFor = (step: number) =>
    active === step ? "active" : active > step ? "done" : "idle";

  const accent = (step: number) => {
    switch (step) {
      case 0:
        return "rgba(0,0,0,0.15)"; // subtle
      case 1:
        return "rgba(0,0,0,0.20)";
      case 2:
        return "rgba(0,0,0,0.25)";
      case 3:
      default:
        return "rgba(0,0,0,0.30)";
    }
  };

  const nodeStyle = (step: number) => {
    const s = stateFor(step);
    if (s === "active") {
      return {
        fill: "rgba(248,250,252,0.9)", // slate-50
        stroke: accent(step),
        text: "rgba(0,0,0,0.9)", // black
        glow: true,
      };
    }
    if (s === "done") {
      return {
        fill: "rgba(248,250,252,0.6)", // slate-50
        stroke: "rgba(0,0,0,0.1)", // black/10
        text: "rgba(0,0,0,0.4)", // black/40
        glow: false,
      };
    }
    return {
      fill: "transparent",
      stroke: "rgba(0,0,0,0.05)", // black/5
      text: "rgba(0,0,0,0.2)", // black/20
      glow: false,
    };
  };

  const node = (x: number, y: number, w: number, h: number, label: string, hot: boolean) => {
    const st = nodeStyle(hot ? active : -1);
    const fill = hot ? st.fill : "rgba(248,250,252,0.3)";
    const stroke = hot ? st.stroke : "rgba(0,0,0,0.06)";
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={18}
          fill={fill}
          stroke={stroke}
          strokeWidth={hot ? 2 : 1}
        />
        <text
          x={x + w / 2}
          y={y + h / 2 + 6}
          textAnchor="middle"
          fontSize="15"
          fontWeight="600"
          fill={hot ? st.text : "rgba(0,0,0,0.3)"}
          style={{ letterSpacing: "-0.01em" }}
        >
          {label}
        </text>
      </g>
    );
  };

  const line = (x1: number, y1: number, x2: number, y2: number, hot: boolean) => {
    const stroke = hot ? accent(active) : "rgba(0,0,0,0.05)";
    const cls = hot ? "rag-flow-line" : "";
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        className={cls}
      />
    );
  };

  const dotPos = useMemo(() => {
    // Positions are in viewBox coordinates (800 x 420).
    if (active <= 0) return { x: 650, y: 95 };
    if (active === 1) return { x: 325, y: 275 };
    if (active === 2) return { x: 515, y: 275 };
    return { x: 685, y: 275 };
  }, [active]);

  return (
    <div className="relative">
      <svg viewBox="0 0 800 420" className="h-auto w-full">
      {/* Lane labels */}
      <text x="60" y="36" fontSize="11" fontWeight="700" fill="rgba(0,0,0,0.15)" className="uppercase tracking-widest">
        OFFLINE · ingestion
      </text>
      <text x="60" y="216" fontSize="11" fontWeight="700" fill="rgba(0,0,0,0.15)" className="uppercase tracking-widest">
        ONLINE · query time
      </text>

      {/* Top lane (offline) */}
      {(() => {
        const s = stateFor(0);
        const hot = s === "active";
        const done = s === "done";
        return (
          <>
            {node(60, 60, 180, 70, "Parse", hot || done)}
            {node(310, 60, 180, 70, "Chunk + Embed", hot || done)}
            {node(560, 60, 180, 70, "Index", hot || done)}
            {line(240, 95, 310, 95, hot)}
            {line(490, 95, 560, 95, hot)}
          </>
        );
      })()}

      {/* Bottom lane (online) */}
      {(() => {
        const r = stateFor(1);
        const rr = stateFor(2);
        const g = stateFor(3);
        const rHot = r === "active";
        const rrHot = rr === "active";
        const gHot = g === "active";
        return (
          <>
            {node(60, 240, 150, 70, "Query", r !== "idle")}
            {node(250, 240, 150, 70, "Retrieve", r !== "idle")}
            {node(440, 240, 150, 70, "Rerank", rr !== "idle")}
            {node(630, 240, 110, 70, "Answer", g !== "idle")}
            {line(210, 275, 250, 275, rHot)}
            {line(400, 275, 440, 275, rrHot)}
            {line(590, 275, 630, 275, gHot)}
          </>
        );
      })()}

      {/* Index to retrieval */}
      {(() => {
        const r = stateFor(1);
        const hot = r === "active";
        return line(650, 130, 325, 240, hot);
      })()}
      </svg>

      {/* Moving "data packet" dot */}
      <div
        className="rag-dot"
        style={{
          left: `${(dotPos.x / 800) * 100}%`,
          top: `${(dotPos.y / 420) * 100}%`,
          ["--rag-accent" as never]: accent(active),
        }}
      />
    </div>
  );
}

export function RAGScrollStory() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;

    let raf = 0;

    function update() {
      const vh = window.innerHeight || 1;
      const markerY = vh * 0.55; // marker lower in viewport so last step can still activate

      // Scrollspy style: active step is last one whose top has crossed marker.
      let idx = 0;
      for (let i = 0; i < els.length; i++) {
        const rect = els[i]!.getBoundingClientRect();
        if (rect.top <= markerY) idx = i;
      }

      // Near end-of-page: force last step active (prevents "can't reach step 4" on short pages).
      const doc = document.documentElement;
      const scrollBottom = window.scrollY + vh;
      if (scrollBottom >= doc.scrollHeight - 4) idx = els.length - 1;

      setActive(idx);
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="flex flex-col">
          {STEPS.map((s, idx) => {
            const isActive = idx === active;
            return (
              <div
                key={s.id}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                data-step-index={idx}
                className="py-20"
              >
                <Reveal delayMs={idx * 40}>
                  <div
                    className={[
                      // Editorial (less boxed): subtle divider + active left accent
                      "relative pl-8",
                      "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-px before:bg-black/10",
                      isActive ? "before:bg-black before:w-px" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-xs font-light text-black/60">
                        {String(idx + 1).padStart(2, "0")} · {s.kicker}
                      </div>
                      {isActive ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                          active
                        </div>
                      ) : null}
                    </div>
                    <h3 className="mt-6 text-2xl font-light tracking-tight text-black">
                      {s.title}
                    </h3>
                    <p className="mt-4 text-lg leading-relaxed text-black/60 font-light">
                      {s.body}
                    </p>
                    <ul className="mt-6 space-y-3 pl-8 text-lg text-black/60 font-light">
                      {s.bullets.map((b) => (
                        <li key={b} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="sticky top-32">
          <Reveal>
            <div className="min-h-[70vh]">
              <div className="flex items-center justify-between gap-6">
                <p className="text-sm font-light text-black">
                  RAG pipeline (scrollytelling)
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-xs font-light text-black/60">
                  step {active + 1} / {STEPS.length}
                </div>
              </div>

              <div className="relative mt-8">
                {/* Sophisticated glow backdrop */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-16 rounded-[80px] bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.03)_0%,_transparent_70%)] blur-3xl"
                />
                <div className="relative rounded-3xl border border-black/10 bg-white p-8 shadow-2xl">
                  <Diagram active={active} />
                </div>
              </div>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-black/60 font-light">
                Scroll left side — diagram reacts as pipeline moves
                from ingestion to retrieval, reranking, and safety.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}