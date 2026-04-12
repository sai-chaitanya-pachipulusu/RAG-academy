import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GoldenSetBuilder } from "@/components/compare/GoldenSetBuilder";
import { MetricsExplainer } from "@/components/compare/MetricsExplainer";

type ToolRow = {
  tool: string;
  bestFor: string;
  metrics: string;
  tracing: string;
  notes: string;
  link: string;
};

const TOOLS: ToolRow[] = [
  {
    tool: "Ragas",
    bestFor: "RAG-specific offline evals (triad-style).",
    metrics: "Context relevance/precision/recall, faithfulness, answer relevancy.",
    tracing: "No",
    notes: "Great starting point; needs a golden set and careful prompt/LLM selection.",
    link: "https://docs.ragas.io/",
  },
  {
    tool: "DeepEval",
    bestFor: "Unit-test style evals for LLM apps.",
    metrics: "Many metrics; integrates with CI patterns.",
    tracing: "Partial",
    notes: "Good for engineering teams that want test-like workflows.",
    link: "https://docs.confident-ai.com/",
  },
  {
    tool: "TruLens",
    bestFor: "Feedback functions + evaluation pipelines.",
    metrics: "Flexible feedback scoring; app evaluation.",
    tracing: "Partial",
    notes: "Useful when you want customizable evaluators and scorecards.",
    link: "https://www.trulens.org/",
  },
  {
    tool: "LangSmith",
    bestFor: "Tracing + debugging LangChain/LangGraph apps.",
    metrics: "Custom evaluators; experiment tracking.",
    tracing: "Yes",
    notes: "Excellent operational visibility; opinionated around LangChain ecosystem.",
    link: "https://docs.smith.langchain.com/",
  },
  {
    tool: "Phoenix (Arize)",
    bestFor: "Observability, drift, dataset analysis for LLM apps.",
    metrics: "Flexible; integrates with eval workflows.",
    tracing: "Yes",
    notes: "Strong for production monitoring + debugging retrieval.",
    link: "https://docs.arize.com/phoenix",
  },
];

const EVAL_WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Build your golden set",
    desc: "Create 25–50 real queries with expected sources. Use the builder below or import from logs.",
    time: "1–2 hours",
  },
  {
    step: 2,
    title: "Run retrieval eval",
    desc: "Measure Recall@k, MRR, nDCG. This tells you if the right chunks are being retrieved.",
    time: "10 min",
  },
  {
    step: 3,
    title: "Run generation eval",
    desc: "Measure faithfulness and answer relevance. This tells you if the LLM is using context correctly.",
    time: "30 min (LLM calls)",
  },
  {
    step: 4,
    title: "Set baselines",
    desc: "Record current metrics. Any change should improve at least one metric without regressing others.",
    time: "5 min",
  },
  {
    step: 5,
    title: "Iterate",
    desc: "Make one change, re-run eval, compare. Small improvements compound.",
    time: "Ongoing",
  },
];

export default function CompareEvaluationPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">Compare / Evaluation</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Evaluation + Observability
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          If you can&apos;t measure retrieval quality and groundedness, you can&apos;t improve it. Start small:
          a 25–50 question golden set + Recall@k + citation/grounding checks.
        </p>
      </header>

      {/* Eval Workflow */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Minimum viable eval workflow</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Follow this sequence to go from &quot;it seems to work&quot; to &quot;I can prove it works.&quot;
            </p>
          </div>
          <Badge variant="accent">recommended</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EVAL_WORKFLOW_STEPS.map((s, i) => (
            <div
              key={s.step}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-[#8B5CF6] dark:text-white">
                {s.step}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{s.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">~{s.time}</p>
              </div>
              {i < EVAL_WORKFLOW_STEPS.length - 1 && (
                <span className="ml-1 text-gray-300 dark:text-gray-700">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Golden Set Builder */}
      <GoldenSetBuilder />

      {/* Metrics Reference */}
      <MetricsExplainer />

      {/* Tool Comparison */}
      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-medium">Evaluation frameworks comparison</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pick based on your needs: offline evals vs. production tracing vs. CI integration.
            </p>
          </div>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-gray-200 dark:border-white/10">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                {["Tool", "Best for", "Metrics", "Tracing", "Notes"].map((h) => (
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
              {TOOLS.map((t) => (
                <tr key={t.tool}>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-950 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-zinc-700 dark:hover:decoration-zinc-500 cursor-pointer"
                    >
                      {t.tool}
                    </a>
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {t.bestFor}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {t.metrics}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    <Badge variant={t.tracing === "Yes" ? "accent" : t.tracing === "Partial" ? "muted" : "default"}>
                      {t.tracing}
                    </Badge>
                  </td>
                  <td className="border-b border-gray-200 px-3 py-3 align-top dark:border-white/10">
                    {t.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Decision Callout */}
      <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-[#8B5CF6]-950">
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
          Default recommendation
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Start with <strong>Ragas</strong> for offline eval (it&apos;s free and RAG-specific). Add{" "}
          <strong>LangSmith</strong> or <strong>Phoenix</strong> when you need production tracing.
          Use <strong>DeepEval</strong> if you want eval-as-unit-tests in CI.
        </p>
      </Card>

      {/* Next Steps */}
      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/evaluator-recall-at-k"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Recall@k
          </Link>
          <Link
            href="/challenges/evaluator-mrr"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            MRR
          </Link>
          <Link
            href="/challenges/evaluator-ndcg"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            nDCG
          </Link>
          <Link
            href="/challenges/faithfulness-judge"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Faithfulness Judge
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            Production templates →
          </Link>
        </div>
      </Card>
    </div>
  );
}
