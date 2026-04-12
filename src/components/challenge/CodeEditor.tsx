"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState, useCallback } from "react";
import type { editor } from "monaco-editor";
import type { ErrorMarker } from "./editorTypes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-zinc-900 dark:border-gray-700 dark:border-t-zinc-100" />
        <span className="text-xs text-gray-500">Loading editor...</span>
      </div>
    </div>
  ),
});

type Props = {
  value: string;
  // eslint-disable-next-line
  onChange: (value: string) => void;
  /**
   * CSS height for the editor container.
   */
  height?: string;
  /**
   * Error markers to display in the editor
   */
  errorMarkers?: ErrorMarker[];
  /**
   * Font size in pixels
   */
  fontSize?: number;
  /**
   * Theme: 'light' or 'dark'
   */
  theme?: "light" | "dark";
  /**
   * Read-only mode
   */
  readOnly?: boolean;
  /**
   * Show line numbers
   */
  showLineNumbers?: boolean;
  /**
   * Callback when editor is mounted
   */
  // eslint-disable-next-line
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
};

export function CodeEditor({
  value,
  onChange,
  height = "clamp(420px, 70vh, 860px)",
  errorMarkers = [],
  fontSize = 14,
  theme = "light",
  readOnly = false,
  showLineNumbers = true,
  onEditorMount,
}: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  // Apply error decorations when markers change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Clear existing markers
    monaco.editor.setModelMarkers(model, "python-errors", []);

    if (errorMarkers.length === 0) return;

    // Convert our markers to Monaco markers
    const monacoMarkers = errorMarkers.map((marker) => ({
      startLineNumber: marker.lineNumber,
      startColumn: marker.column || 1,
      endLineNumber: marker.endLineNumber || marker.lineNumber,
      endColumn: marker.endColumn || model.getLineMaxColumn(marker.lineNumber),
      message: marker.message,
      severity:
        marker.severity === "error"
          ? monaco.MarkerSeverity.Error
          : marker.severity === "warning"
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
    }));

    monaco.editor.setModelMarkers(model, "python-errors", monacoMarkers);

    // Also add line decorations for visual emphasis
    const decorations = errorMarkers.map((marker) => ({
      range: new monaco.Range(marker.lineNumber, 1, marker.lineNumber, 1),
      options: {
        isWholeLine: true,
        className:
          marker.severity === "error"
            ? "error-line-highlight"
            : marker.severity === "warning"
            ? "warning-line-highlight"
            : "info-line-highlight",
        glyphMarginClassName:
          marker.severity === "error"
            ? "error-glyph"
            : marker.severity === "warning"
            ? "warning-glyph"
            : "info-glyph",
        glyphMarginHoverMessage: { value: marker.message },
      },
    }));

    editorRef.current.deltaDecorations([], decorations);
  }, [errorMarkers]);

  // Update font size when prop changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  const handleEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Configure Python language features
      monaco.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          // Python keywords and common functions
          const suggestions = [
            // Keywords
            ...["def", "class", "if", "elif", "else", "for", "while", "try", "except", "finally", "with", "as", "import", "from", "return", "yield", "lambda", "pass", "break", "continue", "raise", "assert", "True", "False", "None", "and", "or", "not", "in", "is"].map((keyword) => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range,
            })),
            // Built-in functions
            ...["print", "len", "range", "enumerate", "zip", "map", "filter", "sorted", "reversed", "sum", "min", "max", "abs", "round", "int", "float", "str", "list", "dict", "set", "tuple", "type", "isinstance", "hasattr", "getattr", "setattr", "open", "input"].map((func) => ({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: func + "(${1})",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            })),
            // RAG-specific suggestions
            ...["cosine_similarity", "dot_product", "euclidean_distance", "normalize", "embed", "chunk", "retrieve", "rerank", "generate"].map((func) => ({
              label: func,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: func + "(${1})",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: "RAG function",
              range,
            })),
          ];

          return { suggestions };
        },
      });

      // Add keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Prevent default save dialog
      });

      // Format document shortcut
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
        editor.getAction("editor.action.formatDocument")?.run();
      });

      if (onEditorMount) {
        onEditorMount(editor);
      }
    },
    [onEditorMount]
  );

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
      style={{ height }}
    >
      <style jsx global>{`
        .error-line-highlight {
          background-color: rgba(239, 68, 68, 0.15) !important;
        }
        .warning-line-highlight {
          background-color: rgba(245, 158, 11, 0.15) !important;
        }
        .info-line-highlight {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        .error-glyph {
          background-color: #ef4444;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 5px;
          margin-top: 6px;
        }
        .warning-glyph {
          background-color: #f59e0b;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 5px;
          margin-top: 6px;
        }
        .info-glyph {
          background-color: #3b82f6;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: 5px;
          margin-top: 6px;
        }
        /* Custom scrollbar */
        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider:hover {
          background: rgba(0, 0, 0, 0.4);
        }
      `}</style>
      <MonacoEditor
        height="100%"
        defaultLanguage="python"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize,
          lineHeight: Math.round(fontSize * 1.6),
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          roundedSelection: true,
          readOnly,
          lineNumbers: showLineNumbers ? "on" : "off",
          glyphMargin: true,
          folding: true,
          foldingHighlight: true,
          lineDecorationsWidth: 10,
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 12, bottom: 12 },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          wordWrap: "on",
          wrappingIndent: "indent",
        }}
      />
    </div>
  );
}

// ============================================
// Code Diff Viewer Component
// ============================================

type DiffViewerProps = {
  originalCode: string;
  modifiedCode: string;
  height?: string;
  originalTitle?: string;
  modifiedTitle?: string;
};

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <span className="text-xs text-gray-500">Loading diff viewer...</span>
      </div>
    ),
  }
);

export function CodeDiffViewer({
  originalCode,
  modifiedCode,
  height = "400px",
  originalTitle = "Your Code",
  modifiedTitle = "Solution",
}: DiffViewerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          {originalTitle}
        </div>
        <div className="flex-1 border-l border-gray-200 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:border-gray-800 dark:text-emerald-400">
          {modifiedTitle}
        </div>
      </div>
      <div style={{ height }}>
        <MonacoDiffEditor
          height="100%"
          language="python"
          original={originalCode}
          modified={modifiedCode}
          theme="vs"
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            scrollBeyondLastLine: false,
            renderOverviewRuler: false,
            diffWordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
