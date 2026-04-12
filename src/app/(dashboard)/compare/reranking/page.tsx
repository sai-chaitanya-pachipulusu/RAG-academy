import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardExternalLink } from "@/components/ui/Card";
import { DecisionWizard, RERANKING_WIZARD_CONFIG } from "@/components/compare/DecisionWizard";

type Row = {
  method: string;
  quality: string;
  latency: string;
  cost: string;
  when: string;
};

const ROWS: Row[] = [
  {
    method: "Cross-encoder rerank (top‑20/50 → keep 5–10)",
    quality: "High",
    latency: "+100–300ms",
    cost: "Medium",
    when: "Default for production: best quality/complexity tradeoff.",
  },
  {
    method: "Reranker cascade (cheap → expensive)",
    quality: "High",
    latency: "Tunable",
    cost: "Tunable",
    when: "When latency budgets are strict but you still need precision.",
  },
  {
    method: "LLM listwise rerank",
    quality: "Very high (sometimes)",
    latency: "+0.5–2s",
    cost: "High",
    when: "Hard queries / low volume / high-stakes; validate carefully.",
  },
  {
    method: "ColBERT / late-interaction rerank",
    quality: "High",
    latency: "Medium",
    cost: "Infra-heavy",
    when: "Large corpora when first-stage retrieval is the bottleneck.",
  },
];

export default function CompareRerankingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">Compare / Reranking</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Reranking (precision boosters)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          Retrieval optimizes recall; reranking optimizes precision. Most teams get a “free lunch” by reranking
          the top‑20/50 candidates and keeping only the best 5–10.
        </p>
      </header>

      {/* Decision Wizard */}
      <DecisionWizard config={RERANKING_WIZARD_CONFIG} />

      {/* Default Recommendation */}
      <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-[#8B5CF6]-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Default: Cross-encoder reranking (top-20 → 5)
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Almost always worth it. Adds ~100-300ms but dramatically improves precision.
            </p>
          </div>
          <Badge variant="accent">recommended</Badge>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-amber-600 dark:text-amber-400">Unless:</span>{" "}
          Latency budget &lt;100ms → skip reranking, optimize retrieval.
          High volume &gt;100k/day → use cascade reranking.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Default pattern</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Rerank right before you build the context window. It&apos;s the simplest way to stop &quot;wrong chunks in the prompt.&quot;
            </p>
          </div>
          <Badge variant="muted">architecture</Badge>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white/60 p-4 text-xs text-gray-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200">{`retrieve top-50 (fast)
rerank top-50 (slow)
keep top-5 / top-10 (best evidence)
shape context (dedupe, order, budget)
generate with citations`}</pre>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Method comparison</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-gray-200 dark:border-white/10">
          <table className="w-full min-w-[860px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                {["Method", "Quality", "Latency", "Cost", "Use when"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-gray-200 px-3 py-2 dark:border-white/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {ROWS.map((r) => (
                <tr key={r.method}>
                  <td className="border-b border-gray-200 px-3 py-3 align-top font-medium text-gray-950 dark:border-white/10 dark:text-gray-50">
                    {r.method}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.quality}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.latency}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.cost}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Notes on pricing</p>
        <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
          Reranker costs vary by provider and model, and change frequently. Use this page to choose the
          <span className="font-medium text-gray-950 dark:text-gray-50"> shape of the solution</span> (cross‑encoder vs cascade vs LLM),
          then validate current pricing in provider docs before you commit.
        </p>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Pricing references (verify current)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <CardExternalLink href="https://cohere.com/pricing" className="p-4">
            <p className="text-sm font-medium">Cohere</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rerank API</p>
          </CardExternalLink>
          <CardExternalLink href="https://openai.com/pricing" className="p-4">
            <p className="text-sm font-medium">OpenAI</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">LLM listwise rerank</p>
          </CardExternalLink>
          <CardExternalLink href="https://huggingface.co/models?pipeline_tag=text-ranking" className="p-4">
            <p className="text-sm font-medium">Hugging Face</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Open-source rerankers</p>
          </CardExternalLink>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/rerank-cascade"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Rerank Cascade
          </Link>
          <Link
            href="/challenges/mmr-diversity"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            MMR Diversity
          </Link>
          <Link
            href="/challenges/lost-in-the-middle-ordering"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Lost‑in‑the‑Middle Ordering
          </Link>
          <Link
            href="/playbooks/rag-techniques-encyclopedia"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Technique encyclopedia →
          </Link>
        </div>
      </Card>
    </div>
  );
}


