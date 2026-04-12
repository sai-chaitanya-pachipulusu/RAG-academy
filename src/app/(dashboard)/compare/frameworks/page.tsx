import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Row = {
  framework: string;
  bestFor: string;
  strengths: string;
  tradeoffs: string;
  pickIf: string;
};

const ROWS: Row[] = [
  {
    framework: "LangChain",
    bestFor: "General LLM app development + agent workflows.",
    strengths: "Huge ecosystem, strong community patterns, LangGraph for agents.",
    tradeoffs: "Abstractions can hide complexity; needs discipline in production.",
    pickIf: "You want fast iteration + broad coverage (retrieval, tools, agents).",
  },
  {
    framework: "LlamaIndex",
    bestFor: "Ingestion/indexing and data-centric RAG patterns.",
    strengths: "Great indexing utilities; strong for retrieval + data connectors.",
    tradeoffs: "Different mental model vs LangChain; may overlap with custom code.",
    pickIf: "Your hardest problems are parsing/chunking/index construction.",
  },
  {
    framework: "Haystack",
    bestFor: "Structured, production-minded NLP pipelines.",
    strengths: "Pipeline structure; good for search/RAG systems.",
    tradeoffs: "Smaller ecosystem than LangChain; different extension model.",
    pickIf: "You want explicit pipelines and strong component boundaries.",
  },
  {
    framework: "DSPy",
    bestFor: "Programmatic optimization of prompts/pipelines.",
    strengths: "Treats prompts as optimizable programs; strong for eval-driven iteration.",
    tradeoffs: "Requires eval datasets and rigor; learning curve.",
    pickIf: "You already have evals and want systematic optimization.",
  },
  {
    framework: "DIY (no framework)",
    bestFor: "Maximum control and debuggability.",
    strengths: "No magic; easiest to reason about performance + failure modes.",
    tradeoffs: "You must build glue code, integrations, and patterns yourself.",
    pickIf: "You’re building a bespoke system or need strict production control.",
  },
];

export default function FrameworksLabPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">Compare / Frameworks</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Frameworks (LangChain vs LlamaIndex vs others)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          Frameworks don’t fix bad retrieval — they help you move faster. Pick the smallest abstraction layer
          that still keeps your system testable and debuggable.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">RAG Academy stance</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              We’ll teach patterns in a framework-agnostic way, then show how to implement them in popular stacks.
              Most production teams end up with a hybrid: framework + custom code.
            </p>
          </div>
          <Badge variant="accent">pragmatic</Badge>
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Framework comparison</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-gray-200 dark:border-white/10">
          <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                {["Framework", "Best for", "Strengths", "Tradeoffs", "Pick if"].map((h) => (
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
                <tr key={r.framework}>
                  <td className="border-b border-gray-200 px-3 py-3 align-top font-medium text-gray-950 dark:border-white/10 dark:text-gray-50">
                    {r.framework}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.bestFor}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.strengths}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.tradeoffs}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {r.pickIf}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Language note (Python vs TypeScript)</p>
        <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
          Most RAG ecosystems are deepest in <span className="font-medium text-gray-950 dark:text-gray-50">Python</span>.
          TypeScript is excellent for product apps and Node backends. For “full-stack RAG,” teams often:
          Python for ingestion/evals + TS/Node for product APIs and UX.
        </p>
      </Card>
    </div>
  );
}


