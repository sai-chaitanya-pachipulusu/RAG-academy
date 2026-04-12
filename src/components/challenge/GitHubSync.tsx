"use client";

import { useState } from "react";

interface GitHubRepo {
  owner: string;
  repo: string;
  branch: string;
}

interface Props {
  code: string;
  challengeSlug: string;
  challengeTitle: string;
}

export function GitHubSync({ code, challengeSlug, challengeTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [repoConfig, setRepoConfig] = useState<GitHubRepo>({
    owner: "",
    repo: "rag-academy-solutions",
    branch: "main",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleExport = () => {
    // Generate markdown file content
    const content = `# ${challengeTitle}

## Challenge
Slug: \`${challengeSlug}\`

## Solution

\`\`\`python
${code}
\`\`\`

## Notes
- Completed on: ${new Date().toISOString().split("T")[0]}
- Platform: RAG Academy

---
*Exported from [RAG Academy](https://rag-academy.com)*
`;

    // Create download
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${challengeSlug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus("success");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setStatus("success");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-[#2563EB] dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
      >
        <span>💾</span>
        Export Solution
      </button>

      {isOpen && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
          <h4 className="text-sm font-semibold">Export Options</h4>

          <div className="mt-4 space-y-3">
            {/* Download as Markdown */}
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all duration-200-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 cursor-pointer"
            >
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-medium">Download as Markdown</p>
                <p className="text-xs text-gray-500">
                  Save {challengeSlug}.md to your computer
                </p>
              </div>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all duration-200-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 cursor-pointer"
            >
              <span className="text-xl">📋</span>
              <div>
                <p className="text-sm font-medium">Copy Code to Clipboard</p>
                <p className="text-xs text-gray-500">
                  Paste into your own repository
                </p>
              </div>
            </button>

            {/* GitHub Instructions */}
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                💡 Pro Tip: Create a GitHub repository
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Track all your RAG Academy solutions in a repo called{" "}
                <code className="rounded bg-gray-200 px-1 dark:bg-[#2563EB]">
                  rag-academy-solutions
                </code>
                . Great for showcasing your skills to employers!
              </p>
            </div>
          </div>

          {status === "success" && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-center text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
              ✅ Done!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Quick export button for challenge completion
export function QuickExportButton({ code, slug }: { code: string; slug: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
      title="Copy solution to clipboard"
    >
      <span>📋</span>
      Copy
    </button>
  );
}
