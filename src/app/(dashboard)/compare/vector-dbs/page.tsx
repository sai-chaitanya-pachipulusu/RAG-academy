import Link from "next/link";

import { VectorDbDecisionWizard } from "@/components/compare/VectorDbDecisionWizard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function VectorDbLabPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">Compare / Vector DBs</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Vector DB Lab</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          A decision-first lab: choose a vector database based on scale, infra
          preferences, requirements, and budget. Then validate the choice with
          benchmarks and evals.
        </p>
      </header>

      <VectorDbDecisionWizard />

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">Performance benchmarks (illustrative)</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              These numbers are highly sensitive to index type (HNSW/IVF/PQ),
              filtering, hardware, and tuning. Use this table for ordering and
              intuition — not procurement.
            </p>
          </div>
          <Badge variant="muted">1M vectors · 768‑dim</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="border-b border-gray-200 px-3 py-2 dark:border-white/10">
                  Database
                </th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-white/10">
                  p50 latency
                </th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-white/10">
                  p99 latency
                </th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-white/10">
                  QPS
                </th>
                <th className="border-b border-gray-200 px-3 py-2 dark:border-white/10">
                  Memory (GB)
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                ["FAISS (GPU)", "2ms", "8ms", "50K", "3.0"],
                ["FAISS (CPU)", "8ms", "25ms", "10K", "3.0"],
                ["Qdrant", "12ms", "35ms", "15K", "3.5"],
                ["Weaviate", "15ms", "40ms", "12K", "4.0"],
                ["Pinecone (pods)", "20ms", "60ms", "10K", "N/A (managed)"],
                ["ChromaDB", "80ms", "200ms", "1K", "4.5"],
                ["pgvector", "500ms+", "2000ms+", "100", "5.0"],
              ].map((row) => (
                <tr key={row[0]} className="text-gray-800 dark:text-gray-200">
                  {row.map((cell, idx) => (
                    <td
                      key={`${row[0]}-${idx}`}
                      className={[
                        "border-b border-gray-200 px-3 py-2 dark:border-white/10",
                        idx === 0 ? "font-medium text-gray-950 dark:text-gray-50" : "",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">Feature matrix (practical)</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Use this to shortlist. Then use the wizard above and benchmark with your
              corpus + filters. “Hybrid” here means first-class support for combining
              sparse + dense inside the system (not “you can always build it yourself”).
            </p>
          </div>
          <Badge variant="muted">high-level</Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                {[
                  "Database",
                  "Hybrid",
                  "Filtering",
                  "Managed",
                  "Self-host",
                  "Embedded",
                  "GPU",
                  "Multimodal (ecosystem)",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-gray-200 px-3 py-2 dark:border-white/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                {
                  db: "FAISS",
                  hybrid: "No",
                  filtering: "No",
                  managed: "No",
                  selfHost: "Yes",
                  embedded: "Yes",
                  gpu: "Yes",
                  multimodal: "Partial",
                },
                {
                  db: "ChromaDB",
                  hybrid: "No",
                  filtering: "Partial",
                  managed: "No",
                  selfHost: "Yes",
                  embedded: "Yes",
                  gpu: "No",
                  multimodal: "Partial",
                },
                {
                  db: "Qdrant",
                  hybrid: "Partial",
                  filtering: "Yes",
                  managed: "Partial",
                  selfHost: "Yes",
                  embedded: "No",
                  gpu: "Partial",
                  multimodal: "Partial",
                },
                {
                  db: "Weaviate",
                  hybrid: "Yes",
                  filtering: "Yes",
                  managed: "Yes",
                  selfHost: "Yes",
                  embedded: "No",
                  gpu: "Partial",
                  multimodal: "Yes",
                },
                {
                  db: "Pinecone",
                  hybrid: "Partial",
                  filtering: "Yes",
                  managed: "Yes",
                  selfHost: "No",
                  embedded: "No",
                  gpu: "N/A",
                  multimodal: "Partial",
                },
                {
                  db: "Milvus",
                  hybrid: "Partial",
                  filtering: "Yes",
                  managed: "Partial",
                  selfHost: "Yes",
                  embedded: "No",
                  gpu: "Partial",
                  multimodal: "Partial",
                },
                {
                  db: "pgvector",
                  hybrid: "No",
                  filtering: "Yes",
                  managed: "No",
                  selfHost: "Yes",
                  embedded: "No",
                  gpu: "No",
                  multimodal: "No",
                },
              ].map((r) => (
                <tr key={r.db} className="text-gray-800 dark:text-gray-200">
                  {[
                    r.db,
                    r.hybrid,
                    r.filtering,
                    r.managed,
                    r.selfHost,
                    r.embedded,
                    r.gpu,
                    r.multimodal,
                  ].map((cell, idx) => (
                    <td
                      key={`${r.db}-${idx}`}
                      className={[
                        "border-b border-gray-200 px-3 py-2 dark:border-white/10",
                        idx === 0 ? "font-medium text-gray-950 dark:text-gray-50" : "",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Recommendation for most teams</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Learning / prototyping
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-gray-950 dark:text-gray-50">
                ChromaDB or FAISS
              </span>{" "}
              (get the pipeline correct; don’t over-index on infra).
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Production (startup default)
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-gray-950 dark:text-gray-50">
                Qdrant/Weaviate (self-hosted)
              </span>{" "}
              or{" "}
              <span className="font-medium text-gray-950 dark:text-gray-50">
                Pinecone (managed)
              </span>{" "}
              — pick based on DevOps appetite.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/playbooks/production-rag-blueprint"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Read: Production RAG Blueprint
          </Link>
          <Link
            href="/challenges/metadata-filtering"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Try: Metadata Filtering challenge
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Follow the Study Plan
          </Link>
        </div>
      </Card>
    </div>
  );
}


