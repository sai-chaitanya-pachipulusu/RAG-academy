"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface ReplyFormProps {
  threadId: string;
  onSubmit: (data: { content: string; codeSnippet?: string }) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
}

export function ReplyForm({ 
  threadId, 
  onSubmit, 
  onCancel, 
  placeholder = "Write your reply...",
  buttonText = "Post Reply"
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      addToast("Please enter a reply", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        content: content.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
      });
      
      // Reset form
      setContent("");
      setCodeSnippet("");
      setShowCodeInput(false);
      
      addToast("Reply posted successfully!", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to post reply", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Textarea */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={4}
            disabled={isSubmitting}
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
          />
        </div>

        {/* Code Snippet (Optional) */}
        {showCodeInput ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Code Snippet
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowCodeInput(false);
                  setCodeSnippet("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Remove
              </button>
            </div>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste your code here..."
              rows={4}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCodeInput(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Add code snippet
          </button>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Posting...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>
      </form>
    </Card>
  );
}
