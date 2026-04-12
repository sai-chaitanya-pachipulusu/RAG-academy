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
            <p className="mt-2 text-sm text-gray-500">
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
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-6 transition-all duration-200-all duration-200 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900/50 cursor-pointer">
                  {file ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Click to select PDF file</span>
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
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-6 py-3 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#8B5CF6] dark:text-white dark:hover:bg-[#7C3AED]"
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
                <p className="text-sm text-gray-500">
                  {result.pageCount} pages • {result.detectedTables.length} tables •{" "}
                  {result.detectedImages.length} images
                </p>
              </div>
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
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
                  className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-200-all duration-200 ${
                    selectedStrategy === strategy
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#7C3AED] dark:text-gray-400"
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
                    className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Table {index + 1}</span>
                      <span className="text-sm text-gray-500">
                        Page {table.page} • {table.rows}×{table.columns}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
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
                    className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{image.type}</span>
                      <span className="text-sm text-gray-500">
                        Page {image.page}
                      </span>
                    </div>
                    {image.caption && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                    className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      {block.isHeading && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          H{block.headingLevel}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        Page {block.page}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm">{block.text}</p>
                  </div>
                ))}
                {result.textBlocks.length > 10 && (
                  <p className="text-center text-sm text-gray-500">
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
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
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
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
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
          <span className="text-gray-500">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition-all duration-200={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-100 p-4 dark:border-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
