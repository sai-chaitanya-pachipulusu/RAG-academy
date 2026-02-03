/**
 * PDF Layout Analyzer Component
 * UI for analyzing PDF documents and extracting structured content
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Layout,
  Table,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { PDFDocumentLayout, ChunkingStrategy } from "@/lib/pdf/layout-detector";

export function PDFLayoutAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PDFDocumentLayout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("semantic");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a PDF file");
      }
    }
  }, []);

  const analyzePDF = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify({
        detectTables: true,
        detectImages: true,
        detectColumns: true,
        preserveReadingOrder: true,
        minConfidence: 0.7,
        ocrEnabled: false,
      }));

      const response = await fetch("/api/pdf/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze PDF");
      }

      const data = await response.json();
      setResult(data.layout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!result && (
        <Card className="p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Upload PDF for Analysis</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Detect tables, images, columns, and extract structured content
            </p>

            <div className="mt-6">
              <label className="flex cursor-pointer flex-col items-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-8 py-6 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/50">
                  {file ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-zinc-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Click to select PDF file</span>
                  )}
                </div>
              </label>
            </div>

            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={analyzePDF}
              disabled={!file || isAnalyzing}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze PDF"
              )}
            </button>
          </div>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{result.filename}</h3>
                <p className="text-sm text-zinc-500">
                  {result.pageCount} pages • {result.detectedTables.length} tables •{" "}
                  {result.detectedImages.length} images
                </p>
              </div>
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Analyze another
              </button>
            </div>
          </Card>

          {/* Chunking Strategy */}
          <Card className="p-6">
            <h4 className="font-semibold">Chunking Strategy</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {["by_page", "by_section", "by_table", "semantic"].map((strategy) => (
                <button
                  key={strategy}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    selectedStrategy === strategy
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {strategy.replace("_", " ")}
                </button>
              ))}
            </div>
          </Card>

          {/* Detected Tables */}
          {result.detectedTables.length > 0 && (
            <CollapsibleSection
              title={`Detected Tables (${result.detectedTables.length})`}
              icon={<Table className="h-5 w-5" />}
              isExpanded={expandedSections.has("tables")}
              onToggle={() => toggleSection("tables")}
            >
              <div className="space-y-3">
                {result.detectedTables.map((table, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Table {index + 1}</span>
                      <span className="text-sm text-zinc-500">
                        Page {table.page} • {table.rows}×{table.columns}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-zinc-500">
                      Confidence: {Math.round(table.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Detected Images */}
          {result.detectedImages.length > 0 && (
            <CollapsibleSection
              title={`Detected Images (${result.detectedImages.length})`}
              icon={<ImageIcon className="h-5 w-5" />}
              isExpanded={expandedSections.has("images")}
              onToggle={() => toggleSection("images")}
            >
              <div className="space-y-3">
                {result.detectedImages.map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{image.type}</span>
                      <span className="text-sm text-zinc-500">
                        Page {image.page}
                      </span>
                    </div>
                    {image.caption && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Text Blocks */}
          {result.textBlocks.length > 0 && (
            <CollapsibleSection
              title={`Text Blocks (${result.textBlocks.length})`}
              icon={<Layout className="h-5 w-5" />}
              isExpanded={expandedSections.has("text")}
              onToggle={() => toggleSection("text")}
            >
              <div className="space-y-3">
                {result.textBlocks.slice(0, 10).map((block, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {block.isHeading && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          H{block.headingLevel}
                        </span>
                      )}
                      <span className="text-sm text-zinc-500">
                        Page {block.page}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm">{block.text}</p>
                  </div>
                ))}
                {result.textBlocks.length > 10 && (
                  <p className="text-center text-sm text-zinc-500">
                    +{result.textBlocks.length - 10} more blocks
                  </p>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Export Options */}
          <Card className="p-6">
            <h4 className="font-semibold">Export</h4>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <Copy className="h-4 w-4" />
                Copy JSON
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${result.filename.replace(".pdf", "")}_layout.json`;
                  a.click();
                }}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function CollapsibleSection({
  title,
  icon,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-zinc-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
