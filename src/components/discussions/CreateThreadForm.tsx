"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { DiscussionCategory } from "@/lib/discussions/types";

const CATEGORIES: { value: DiscussionCategory; label: string; icon: string; description: string }[] = [
  { value: "question", label: "Question", icon: "❓", description: "Ask for help or clarification" },
  { value: "solution", label: "Solution", icon: "✅", description: "Share your approach or solution" },
  { value: "optimization", label: "Optimization", icon: "⚡", description: "Discuss performance improvements" },
  { value: "bug_report", label: "Bug Report", icon: "🐛", description: "Report issues with the challenge" },
  { value: "tip", label: "Tip", icon: "💡", description: "Share helpful tips or tricks" },
  { value: "general", label: "General", icon: "💬", description: "General discussion" },
];

interface CreateThreadFormProps {
  challengeSlug: string;
  onSubmit: (data: {
    category: DiscussionCategory;
    title: string;
    content: string;
    codeSnippet?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreateThreadForm({ challengeSlug, onSubmit, onCancel }: CreateThreadFormProps) {
  const [category, setCategory] = useState<DiscussionCategory>("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      addToast("Please enter a title", "error");
      return;
    }
    
    if (!content.trim()) {
      addToast("Please enter some content", "error");
      return;
    }
    
    if (title.length > 200) {
      addToast("Title must be less than 200 characters", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        category,
        title: title.trim(),
        content: content.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
      });
      
      addToast("Thread created successfully!", "success");
      
      // Reset form
      setCategory("question");
      setTitle("");
      setContent("");
      setCodeSnippet("");
      setShowCodeInput(false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to create thread", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Discussion
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-200-all duration-200 ${
                  category === cat.value
                    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className={`text-sm font-medium ${
                  category === cat.value
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  {cat.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {cat.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your discussion about?"
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-[#7C3AED] dark:text-white dark:placeholder-zinc-500"
          />
          <div className="mt-1 flex justify-end">
            <span className={`text-xs ${title.length > 180 ? "text-amber-500" : "text-gray-400"}`}>
              {title.length}/200
            </span>
          </div>
        </div>

        {/* Content Textarea */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your question, solution, or idea in detail..."
            rows={6}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-[#7C3AED] dark:text-white dark:placeholder-zinc-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Markdown formatting is supported
          </p>
        </div>

        {/* Code Snippet (Optional) */}
        <div>
          {!showCodeInput ? (
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Add code snippet
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code Snippet
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeSnippet("");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Paste your code here..."
                rows={5}
                className="w-full resize-y rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-zinc-600"
              />
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create Thread"
            )}
          </button>
        </div>
      </form>
    </Card>
  );
}
