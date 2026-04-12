"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardExternalLink } from "@/components/ui/Card";

type Scale = "lt10k" | "lt1m" | "1m_100m" | "100m_1b" | "1b_plus";
type Infra = "managed" | "self_hosted" | "embedded";
type Requirement =
  | "none"
  | "hybrid_search"
  | "complex_filtering"
  | "existing_postgres"
  | "gpu_acceleration"
  | "multimodal";
type Budget = "free" | "low" | "production";

type DbId = "chroma" | "faiss" | "qdrant" | "weaviate" | "pinecone" | "milvus" | "pgvector";

type DbInfo = {
  id: DbId;
  name: string;
  defaultMode: "embedded" | "self_hosted" | "managed";
  goodFor: string[];
  watchouts: string[];
  links: Array<{ label: string; href: string }>;
};

const DBS: Record<DbId, DbInfo> = {
  chroma: {
    id: "chroma",
    name: "ChromaDB",
    defaultMode: "embedded",
    goodFor: ["prototyping", "small corpora", "local dev"],
    watchouts: ["not a great fit for high-QPS production workloads"],
    links: [{ label: "Docs", href: "https://docs.trychroma.com/" }],
  },
  faiss: {
    id: "faiss",
    name: "FAISS",
    defaultMode: "embedded",
    goodFor: ["fast ANN on a single box", "GPU acceleration", "experiments / baselines"],
    watchouts: ["you build the surrounding production system (filters, multi-tenant, ops)"],
    links: [{ label: "Repo", href: "https://github.com/facebookresearch/faiss" }],
  },
  qdrant: {
    id: "qdrant",
    name: "Qdrant",
    defaultMode: "self_hosted",
    goodFor: ["metadata-heavy retrieval", "filtering", "production self-hosted"],
    watchouts: ["you own ops (unless using managed offerings)"],
    links: [{ label: "Docs", href: "https://qdrant.tech/documentation/" }],
  },
  weaviate: {
    id: "weaviate",
    name: "Weaviate",
    defaultMode: "self_hosted",
    goodFor: ["hybrid search", "multimodal workflows", "production self-hosted or cloud"],
    watchouts: ["feature surface can be large — be deliberate about what you enable"],
    links: [{ label: "Docs", href: "https://weaviate.io/developers/weaviate" }],
  },
  pinecone: {
    id: "pinecone",
    name: "Pinecone",
    defaultMode: "managed",
    goodFor: ["managed production", "teams that want zero DevOps"],
    watchouts: ["vendor lock-in + costs can climb at scale"],
    links: [{ label: "Docs", href: "https://docs.pinecone.io/" }],
  },
  milvus: {
    id: "milvus",
    name: "Milvus",
    defaultMode: "self_hosted",
    goodFor: ["very large scale", "cost-optimized self-hosting", "billion+ vectors"],
    watchouts: ["ops complexity (cluster, storage, monitoring)"],
    links: [{ label: "Docs", href: "https://milvus.io/docs" }],
  },
  pgvector: {
    id: "pgvector",
    name: "pgvector",
    defaultMode: "self_hosted",
    goodFor: ["teams already on Postgres", "simple deployments", "tight relational joins"],
    watchouts: ["vector search performance is typically worse at scale vs purpose-built vector DBs"],
    links: [{ label: "Docs", href: "https://github.com/pgvector/pgvector" }],
  },
};

type Selection = {
  scale: Scale;
  infra: Infra;
  requirement: Requirement;
  budget: Budget;
};

type Recommendation = {
  db: DbInfo;
  score: number;
  reasons: string[];
};

function addScore(
  scores: Map<DbId, number>,
  reasons: Map<DbId, string[]>,
  id: DbId,
  points: number,
  reason: string
) {
  scores.set(id, (scores.get(id) ?? 0) + points);
  const r = reasons.get(id) ?? [];
  r.push(reason);
  reasons.set(id, r);
}

function compute(selection: Selection) {
  const scores = new Map<DbId, number>();
  const reasons = new Map<DbId, string[]>();
  const warnings: string[] = [];

  // Scale
  if (selection.scale === "lt10k") {
    addScore(scores, reasons, "chroma", 3, "Scale < 10K vectors → simplest local prototyping");
    addScore(scores, reasons, "faiss", 2, "Scale < 10K vectors → simple ANN baseline");
  } else if (selection.scale === "lt1m") {
    addScore(scores, reasons, "faiss", 3, "Scale < 1M vectors → fast local ANN");
    addScore(scores, reasons, "chroma", 2, "Scale < 1M vectors → dev-friendly store");
  } else if (selection.scale === "1m_100m") {
    addScore(scores, reasons, "qdrant", 3, "Scale 1M–100M → production vector DB tier");
    addScore(scores, reasons, "weaviate", 3, "Scale 1M–100M → production vector DB tier");
  } else if (selection.scale === "100m_1b") {
    addScore(scores, reasons, "pinecone", 3, "Scale 100M–1B → managed scale-friendly option");
    addScore(scores, reasons, "milvus", 3, "Scale 100M–1B → self-host scale-friendly option");
  } else if (selection.scale === "1b_plus") {
    addScore(scores, reasons, "milvus", 4, "Scale 1B+ → typical choice is Milvus-class infra");
  }

  // Infrastructure preference
  if (selection.infra === "managed") {
    addScore(scores, reasons, "pinecone", 4, "Managed preference → Pinecone is the default");
    addScore(scores, reasons, "weaviate", 1, "Managed preference → Weaviate also has managed options");
  } else if (selection.infra === "self_hosted") {
    addScore(scores, reasons, "qdrant", 3, "Self-host preference → Qdrant is a strong default");
    addScore(scores, reasons, "weaviate", 3, "Self-host preference → Weaviate is a strong default");
    addScore(scores, reasons, "milvus", 2, "Self-host preference → Milvus for very large scale");
  } else if (selection.infra === "embedded") {
    addScore(scores, reasons, "chroma", 4, "Embedded preference → Chroma is dev-friendly");
    addScore(scores, reasons, "faiss", 4, "Embedded preference → FAISS is the classic embedded ANN");
  }

  // Special requirements
  if (selection.requirement === "hybrid_search") {
    addScore(scores, reasons, "weaviate", 4, "Hybrid search requirement → Weaviate is a great fit");
  } else if (selection.requirement === "complex_filtering") {
    addScore(scores, reasons, "qdrant", 4, "Complex filtering requirement → Qdrant excels here");
  } else if (selection.requirement === "existing_postgres") {
    addScore(scores, reasons, "pgvector", 6, "Existing Postgres → pgvector integrates naturally");
  } else if (selection.requirement === "gpu_acceleration") {
    addScore(scores, reasons, "faiss", 4, "GPU acceleration → FAISS GPU is a strong option");
    addScore(scores, reasons, "milvus", 2, "GPU acceleration → Milvus can be part of GPU-heavy stacks");
  } else if (selection.requirement === "multimodal") {
    addScore(scores, reasons, "weaviate", 4, "Multimodal requirement → Weaviate is a common choice");
  }

  // Budget
  if (selection.budget === "free") {
    addScore(scores, reasons, "faiss", 1, "Free budget → self-host/open-source options");
    addScore(scores, reasons, "chroma", 1, "Free budget → self-host/open-source options");
    addScore(scores, reasons, "qdrant", 1, "Free budget → self-host/open-source options");
    addScore(scores, reasons, "weaviate", 1, "Free budget → self-host/open-source options");
    addScore(scores, reasons, "pgvector", 1, "Free budget → if you already run Postgres");
  } else if (selection.budget === "low") {
    addScore(scores, reasons, "pinecone", 1, "Low budget → managed serverless can work for smaller scale");
    addScore(scores, reasons, "weaviate", 1, "Low budget → managed tier can work for smaller scale");
    addScore(scores, reasons, "qdrant", 1, "Low budget → self-host often wins cost-wise");
  } else if (selection.budget === "production") {
    addScore(scores, reasons, "pinecone", 2, "Production budget → pay for managed reliability if needed");
    addScore(scores, reasons, "milvus", 2, "Production budget → invest in ops for scale + cost control");
    addScore(scores, reasons, "qdrant", 1, "Production budget → self-host for cost efficiency");
    addScore(scores, reasons, "weaviate", 1, "Production budget → self-host/managed depending on team");
  }

  // Sanity warnings
  if (selection.scale === "1b_plus" && selection.infra === "embedded") {
    warnings.push(
      "1B+ vectors + embedded/no-server is rarely practical. You’ll typically need a distributed system (Milvus-class) or a managed service."
    );
  }
  if (selection.requirement === "existing_postgres" && selection.scale === "1b_plus") {
    warnings.push(
      "pgvector can work, but 1B+ vectors is usually beyond what teams run comfortably on Postgres alone without serious infra work."
    );
  }

  const all: Recommendation[] = (Object.keys(DBS) as DbId[])
    .map((id) => ({
      db: DBS[id],
      score: scores.get(id) ?? 0,
      reasons: reasons.get(id) ?? [],
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return { recommendations: all.slice(0, 3), warnings };
}

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; hint?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-950 dark:text-gray-50">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={selected}
              className={[
                "rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-gray-950 bg-[#7C3AED] text-white dark:border-white/25 dark:bg-white/10"
                  : "border-gray-200 bg-white/60 text-gray-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{o.label}</span>
                {selected ? <Badge variant="muted">selected</Badge> : null}
              </div>
              {o.hint ? (
                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                  {o.hint}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VectorDbDecisionWizard() {
  const [selection, setSelection] = useState<Selection>({
    scale: "lt1m",
    infra: "self_hosted",
    requirement: "none",
    budget: "free",
  });

  const result = useMemo(() => compute(selection), [selection]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">Decision wizard</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              This is a heuristic decision tree. Final answer is always: benchmark with
              your data + your filters + your latency budget.
            </p>
          </div>
          <Badge variant="accent">MVP</Badge>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-6">
          <OptionRow<Scale>
            label="1) What’s your scale?"
            value={selection.scale}
            onChange={(scale) => setSelection((s) => ({ ...s, scale }))}
            options={[
              { value: "lt10k", label: "< 10K vectors", hint: "Prototyping / tiny corpora" },
              { value: "lt1m", label: "< 1M vectors", hint: "Small-to-mid corpora" },
              { value: "1m_100m", label: "1M – 100M", hint: "Serious production scale" },
              { value: "100m_1b", label: "100M – 1B", hint: "Large scale / high infra needs" },
              { value: "1b_plus", label: "1B+", hint: "Enterprise-scale indexing" },
            ]}
          />

          <OptionRow<Infra>
            label="2) Infrastructure preference?"
            value={selection.infra}
            onChange={(infra) => setSelection((s) => ({ ...s, infra }))}
            options={[
              { value: "managed", label: "Managed", hint: "Zero DevOps" },
              { value: "self_hosted", label: "Self-hosted", hint: "Open-source / control" },
              { value: "embedded", label: "Embedded", hint: "No separate server" },
            ]}
          />

          <OptionRow<Requirement>
            label="3) Special requirements?"
            value={selection.requirement}
            onChange={(requirement) => setSelection((s) => ({ ...s, requirement }))}
            options={[
              { value: "none", label: "None", hint: "Default production constraints only" },
              { value: "hybrid_search", label: "Hybrid search", hint: "BM25 + dense + fusion" },
              { value: "complex_filtering", label: "Complex filtering", hint: "Metadata-heavy workloads" },
              { value: "existing_postgres", label: "Existing Postgres", hint: "Prefer staying on Postgres" },
              { value: "gpu_acceleration", label: "GPU acceleration", hint: "GPU ANN/embedding heavy" },
              { value: "multimodal", label: "Multimodal", hint: "Images/tables + text pipelines" },
            ]}
          />

          <OptionRow<Budget>
            label="4) Budget?"
            value={selection.budget}
            onChange={(budget) => setSelection((s) => ({ ...s, budget }))}
            options={[
              { value: "free", label: "Free", hint: "Self-host/open-source only" },
              { value: "low", label: "Low ($25–$100/mo)", hint: "Small managed tiers or efficient self-host" },
              { value: "production", label: "Production ($500+/mo)", hint: "Pay for reliability or scale ops" },
            ]}
          />
        </div>
      </Card>

      {result.warnings.length > 0 ? (
        <Card className="p-5">
          <p className="text-sm font-medium">Potential conflicts</p>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-sm text-gray-700 dark:text-gray-300">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {result.recommendations.map((r) => (
          <Card key={r.db.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">{r.db.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Default: {r.db.defaultMode.replace("_", " ")}
                </p>
              </div>
              <Badge variant="muted">score {r.score}</Badge>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Why it fits
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                {r.reasons.slice(0, 4).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Watchouts
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700 dark:text-gray-300">
                {r.db.watchouts.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {r.db.links.map((l) => (
                <CardExternalLink
                  key={l.href}
                  href={l.href}
                  className="p-3"
                >
                  <p className="text-xs font-medium">{l.label}</p>
                </CardExternalLink>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


