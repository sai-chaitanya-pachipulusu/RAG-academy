import Link from "next/link";

import {
  MCP_DISPLAY_NAME,
  MCP_DOCS_PATH,
  MCP_ENV_VARS,
  MCP_FEATURED_TOOLS,
  MCP_HTTP_CONNECT_COMMAND,
  MCP_HTTP_ENDPOINT_URL,
  MCP_LESSON_PATH,
  MCP_PUBLIC_SITE_URL,
  MCP_REPO_CWD_PLACEHOLDER,
  MCP_RESOURCES,
  MCP_SERVER_ID,
  MCP_TAGLINE,
} from "@/lib/mcp/branding";
import { MCP_SERVER_VERSION } from "@/lib/mcp/mcpMeta";

type CurriculumCompassDocsProps = {
  variant?: "full" | "compact";
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-950 p-4 text-xs leading-relaxed text-gray-100">
      <code>{children.trim()}</code>
    </pre>
  );
}

const CURSOR_CONFIG = `{
  "mcpServers": {
    "${MCP_SERVER_ID}": {
      "command": "node",
      "args": ["scripts/mcp-stdio.mjs"],
      "cwd": "${MCP_REPO_CWD_PLACEHOLDER}",
      "env": {
        "RAG_ACADEMY_SITE_URL": "${MCP_PUBLIC_SITE_URL}"
      }
    }
  }
}`;

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "${MCP_SERVER_ID}": {
      "command": "node",
      "args": ["scripts/mcp-stdio.mjs"],
      "cwd": "${MCP_REPO_CWD_PLACEHOLDER}",
      "env": {
        "RAG_ACADEMY_SITE_URL": "${MCP_PUBLIC_SITE_URL}"
      }
    }
  }
}`;

export function CurriculumCompassDocs({ variant = "full" }: CurriculumCompassDocsProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
              Model Context Protocol
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-gray-900 font-heading">
              {MCP_DISPLAY_NAME}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{MCP_TAGLINE}</p>
            <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-950 px-3 py-2 text-[11px] leading-relaxed text-gray-100">
              <code>{MCP_HTTP_CONNECT_COMMAND}</code>
            </pre>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {MCP_FEATURED_TOOLS.slice(0, 3).map((tool) => (
                <li key={tool.name} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span>
                    <span className="font-mono text-xs text-gray-800">{tool.name}</span>
                    <span className="text-gray-500"> — {tool.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              href={MCP_DOCS_PATH}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Setup guide
            </Link>
            <Link
              href={MCP_LESSON_PATH}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              MCP lesson
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          Model Context Protocol · v{MCP_SERVER_VERSION}
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-gray-900 font-heading">{MCP_DISPLAY_NAME}</h1>
        <p className="max-w-2xl text-base text-gray-500 leading-relaxed">{MCP_TAGLINE}</p>
        <p className="text-sm text-gray-500">
          Server id for client configs:{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{MCP_SERVER_ID}</code>
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">What it exposes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tools</h3>
            <ul className="space-y-2">
              {MCP_FEATURED_TOOLS.map((tool) => (
                <li key={tool.name} className="text-sm">
                  <code className="text-xs text-indigo-700">{tool.name}</code>
                  <p className="mt-0.5 text-xs text-gray-500">{tool.description}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              Plus research feeds, platform stats, and optional authenticated progress tools.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources & prompts</h3>
            <ul className="space-y-2">
              {MCP_RESOURCES.map((resource) => (
                <li key={resource.uri} className="text-sm">
                  <code className="text-xs text-indigo-700">{resource.uri}</code>
                  <p className="mt-0.5 text-xs text-gray-500">{resource.description}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Prompts include <code className="text-xs">rag_academy_pricing_advisor</code>,{" "}
              <code className="text-xs">rag_academy_study_plan</code>, and{" "}
              <code className="text-xs">rag_academy_tutor_session</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Connect instantly — hosted endpoint</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          No clone, no install. The server is hosted at{" "}
          <code className="text-xs">{MCP_HTTP_ENDPOINT_URL}</code> (Streamable HTTP). One command in
          Claude Code:
        </p>
        <CodeBlock>{MCP_HTTP_CONNECT_COMMAND}</CodeBlock>
        <p className="text-sm text-gray-600 leading-relaxed">
          For signed-in features (grounded Q&A with your daily quota, Pro architecture analysis,
          progress, recommendations), send your Supabase access token as{" "}
          <code className="text-xs">Authorization: Bearer &lt;token&gt;</code>. Anonymous callers get
          the full curriculum toolset: search, learning paths, challenges, content, pricing, and feeds.
          Sampling-powered Q&A (your editor&apos;s own LLM) is available on the stdio setup below.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Run locally (stdio)</h2>
        <p className="text-sm text-gray-500">
          The stdio server unlocks MCP sampling (zero-key Q&A via your editor&apos;s LLM) and local
          API keys.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
          <li>Clone the RAG Academy repo and run <code className="text-xs">npm install</code>.</li>
          <li>From the repo root, verify the server: <code className="text-xs">npm run mcp:dev</code>.</li>
          <li>
            Optional: run the MCP Inspector — <code className="text-xs">npm run mcp:inspect</code>.
          </li>
          <li>Add the server to your MCP client using the config below (replace the cwd path).</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">MCP Inspector</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Use <strong>node</strong>, not <strong>npm run</strong>. npm prints lines like{" "}
          <code className="text-xs">{"> rag-academy@0.1.0 mcp:dev"}</code> to stdout, which breaks MCP stdio
          (only JSON-RPC is allowed on stdout).
        </p>
        <CodeBlock>{`Command: node
Arguments: scripts/mcp-stdio.mjs
(Or run from repo root: npm run mcp:inspect)`}</CodeBlock>
        <p className="text-sm text-gray-500">
          Skip <strong>Authentication</strong>. Click <strong>Connect</strong>, then open <strong>Tools</strong>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cursor</h2>
        <p className="text-sm text-gray-500">
          Add to your project <code className="text-xs">.cursor/mcp.json</code> or global Cursor MCP settings.
        </p>
        <CodeBlock>{CURSOR_CONFIG}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Claude Desktop</h2>
        <p className="text-sm text-gray-500">
          Add to <code className="text-xs">claude_desktop_config.json</code> (macOS:{" "}
          <code className="text-xs">~/Library/Application Support/Claude/</code>).
        </p>
        <CodeBlock>{CLAUDE_DESKTOP_CONFIG}</CodeBlock>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Environment variables</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Variable</th>
                <th className="px-4 py-3 font-medium">Required</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {MCP_ENV_VARS.map((env) => (
                <tr key={env.name}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">{env.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{env.required ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{env.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-5">
        <h2 className="text-sm font-semibold text-gray-900">Pricing in MCP</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Agents should call <code className="text-xs">rag_academy_get_pricing</code> for tier ranges and phase
          countdowns. Clients can subscribe to <code className="text-xs">ragacademy://pricing/public</code> for
          discovery. Checkout stays on the website — MCP never exposes payment product IDs.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href={MCP_LESSON_PATH}
          className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Read the MCP curriculum lesson
        </Link>
        <a
          href="https://modelcontextprotocol.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          MCP specification
        </a>
      </section>
    </div>
  );
}
