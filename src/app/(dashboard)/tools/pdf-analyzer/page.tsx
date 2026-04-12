import { PDFLayoutAnalyzer } from "@/components/pdf/PDFLayoutAnalyzer";

export default function PDFAnalyzerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">PDF Layout Analyzer</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Upload PDF documents to detect tables, images, columns, and extract structured content for RAG applications
        </p>
      </header>

      <PDFLayoutAnalyzer />
    </div>
  );
}
