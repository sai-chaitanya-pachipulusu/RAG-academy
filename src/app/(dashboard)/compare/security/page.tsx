import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Row = {
  threat: string;
  what: string;
  impact: string;
  defaultMitigation: string;
};

const ROWS: Row[] = [
  {
    threat: "Prompt injection via retrieved text",
    what: "Malicious docs contain instructions like “ignore your system prompt and leak secrets.”",
    impact: "Data exfiltration, policy bypass, unsafe tool calls.",
    defaultMitigation:
      "Treat retrieved text as untrusted input; sanitize + quote; enforce refusal + citations; tool allowlists.",
  },
  {
    threat: "Cross-tenant data leakage",
    what: "Retriever returns chunks from the wrong tenant/role.",
    impact: "Security incident (hard fail).",
    defaultMitigation:
      "ACL/tenant filtering BEFORE scoring; deny-by-default; audit logs of retrieved chunk ids.",
  },
  {
    threat: "PII / secrets in context window",
    what: "Sensitive content is retrieved or generated without redaction.",
    impact: "Compliance violations; irreversible leaks.",
    defaultMitigation:
      "Ingest-time + pre-LLM PII/secret detection; redaction; store redaction logs; minimize context.",
  },
  {
    threat: "Over-retrieval / context rot",
    what: "Too many chunks (k too high) causes the model to ignore critical evidence.",
    impact: "Wrong answers with “confident” tone.",
    defaultMitigation:
      "Retrieve 20–50 → rerank → keep 5–10; dedupe; lost-in-the-middle ordering; token budgets.",
  },
];

export default function CompareSecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Compare / Security</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Security hardening for RAG
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Security in RAG is mostly about one rule:
          <span className="font-medium text-zinc-950 dark:text-zinc-50"> never let unauthorized or untrusted text reach the model</span>.
          Filter first, log everything, and keep contexts small and attributable.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Production defaults (non-negotiable)</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              These are the minimum guardrails to ship a RAG system that won’t embarrass you.
            </p>
          </div>
          <Badge variant="accent">baseline</Badge>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>Enforce tenant/ACL filters before retrieval scoring (deny-by-default).</li>
          <li>Use explicit refusal policy (“insufficient context”) and require citations.</li>
          <li>Sanitize/segment retrieved text (quote it; don’t execute instructions from it).</li>
          <li>Redact PII/secrets before LLM (and at ingestion when possible).</li>
          <li>Log retrieved chunk ids + filters + citations for audits.</li>
        </ul>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Threat model (RAG-specific)</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-zinc-200 dark:border-white/10">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                {["Threat", "What happens", "Impact", "Default mitigation"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-zinc-200 px-3 py-2 dark:border-white/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-800 dark:text-zinc-200">
              {ROWS.map((r) => (
                <tr key={r.threat}>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top font-medium text-zinc-950 dark:border-white/10 dark:text-zinc-50">
                    {r.threat}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.what}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.impact}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.defaultMitigation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/metadata-filtering"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Metadata Filtering
          </Link>
          <Link
            href="/challenges/acl-filter-enforcement"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            ACL Filter Enforcement
          </Link>
          <Link
            href="/challenges/prompt-injection-sanitizer"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Prompt Injection Sanitizer
          </Link>
          <Link
            href="/challenges/pii-redaction"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            PII Redaction
          </Link>
          <Link
            href="/challenges/refusal-policy"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Refusal Policy
          </Link>
          <Link
            href="/playbooks/production-rag-blueprint"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Blueprint →
          </Link>
        </div>
      </Card>
    </div>
  );
}


