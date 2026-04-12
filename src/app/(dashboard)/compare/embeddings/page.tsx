import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardExternalLink } from "@/components/ui/Card";
import { DecisionWizard, EMBEDDING_WIZARD_CONFIG } from "@/components/compare/DecisionWizard";
import { VectorSpaceExplorer } from "@/components/visualizers/VectorSpaceExplorer";

type Row = {
  model: string;
  provider: string;
  strengths: string;
  tradeoffs: string;
  bestFor: string;
};

const MODELS: Row[] = [
  {
    model: "text-embedding-3-small",
    provider: "OpenAI",
    strengths: "Cheap, strong general-purpose baseline.",
    tradeoffs: "External API; vendor dependency.",
    bestFor: "Most teams starting production RAG.",
  },
  {
    model: "text-embedding-3-large",
    provider: "OpenAI",
    strengths: "Higher quality, more robust retrieval in hard domains.",
    tradeoffs: "More expensive than small; still external API.",
    bestFor: "When quality matters more than cost.",
  },
  {
    model: "BGE-M3",
    provider: "Open-source",
    strengths: "Strong multilingual; often good for hybrid-style retrieval setups.",
    tradeoffs: "You host it; infra + ops cost.",
    bestFor: "Self-hosted + multilingual retrieval.",
  },
  {
    model: "E5 (family)",
    provider: "Open-source",
    strengths: "Strong general retrieval; many sizes.",
    tradeoffs: "Pick the right variant; host infra if local.",
    bestFor: "General-purpose retrieval, self-hosted.",
  },
  {
    model: "Voyage (family)",
    provider: "Voyage AI",
    strengths: "Often very strong on retrieval benchmarks.",
    tradeoffs: "External API; pricing varies by model.",
    bestFor: "Quality-first systems with budget.",
  },
  {
    model: "Cohere embed (family)",
    provider: "Cohere",
    strengths: "Solid multilingual + enterprise-friendly APIs.",
    tradeoffs: "External API; model choice matters.",
    bestFor: "Enterprise search stacks already using Cohere.",
  },
];

export default function EmbeddingsLabPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">Compare / Embeddings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Embeddings (model selection)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          Embeddings determine what your retriever considers “similar.” Pick a solid baseline, then only change
          models when your evals show a clear failure mode.
        </p>
      </header>

      {/* Decision Wizard */}
      <DecisionWizard config={EMBEDDING_WIZARD_CONFIG} />

      {/* Default Recommendation */}
      <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-[#3B82F6]-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Default: text-embedding-3-small (OpenAI)
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Best cost/quality ratio. $0.02 per 1M tokens. Works for 90% of use cases.
            </p>
          </div>
          <Badge variant="accent">recommended</Badge>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-amber-600 dark:text-amber-400">Unless:</span>{" "}
          You need privacy/on-prem → use BGE-M3 or nomic-embed-text locally.
          You need maximum quality → use text-embedding-3-large.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">How to evaluate embeddings</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t chase benchmark scores. Measure on YOUR data.
            </p>
          </div>
          <Badge variant="muted">process</Badge>
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-gray-700 dark:text-gray-300">
          <li>Pick a baseline model (cheap + good).</li>
          <li>Build a golden set (25–50 queries) and log top‑k chunks.</li>
          <li>Only switch models if it improves Recall@k / nDCG on your failures.</li>
          <li>Prefer hybrid retrieval + reranking before embedding fine-tuning.</li>
        </ol>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Model comparison (high level)</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-gray-200 dark:border-white/10">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                {["Model", "Provider", "Strengths", "Tradeoffs", "Best for"].map((h) => (
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
              {MODELS.map((r) => (
                <tr key={r.model}>
                  <td className="border-b border-gray-200 px-3 py-3 align-top font-medium text-gray-950 dark:border-white/10 dark:text-gray-50">
                    {r.model}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.provider}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.strengths}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.tradeoffs}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.bestFor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Vector Space Visualization */}
      <Card className="p-5">
        <p className="mb-4 text-sm font-medium">Interactive: Vector Space Explorer</p>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
          See how queries and documents cluster in embedding space. Similar items group together.
        </p>
        <VectorSpaceExplorer />
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: connect embeddings to retrieval</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/compare/retrieval"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Compare: Retrieval →
          </Link>
          <Link
            href="/challenges/embed-and-search"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Challenge: Embed & Search (toy)
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Pricing references (verify current)</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Pricing changes frequently. Use these links to confirm current costs before you commit.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <CardExternalLink href="https://openai.com/pricing" className="p-4">
            <p className="text-sm font-medium">OpenAI pricing</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Embeddings + chat models
            </p>
          </CardExternalLink>
          <CardExternalLink href="https://cohere.com/pricing" className="p-4">
            <p className="text-sm font-medium">Cohere pricing</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Embed + rerank
            </p>
          </CardExternalLink>
          <CardExternalLink href="https://www.voyageai.com/pricing" className="p-4">
            <p className="text-sm font-medium">Voyage pricing</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Embeddings
            </p>
          </CardExternalLink>
        </div>
      </Card>
    </div>
  );
}


