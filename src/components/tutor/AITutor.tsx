/**
 * AI Tutor Component
 * 
 * Interactive tutoring widget for challenges. Provides contextual hints,
 * debugging help, explanations, and encouragement.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  Bug, 
  BookOpen, 
  MessageSquare, 
  Sparkles,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import type { Challenge } from "@/lib/challenges/types";
import type { 
  TutorMessage, 
  TutorContext, 
  TutorSession,
  TutorRequest,
  TutorResponse 
} from "@/lib/ai/tutor";
import {
  createTutorSession,
  updateTutorSession,
  addMessageToSession,
  handleTutorRequest,
} from "@/lib/ai/tutor";

interface AITutorProps {
  challenge: Challenge;
  userCode: string;
  testOutput?: string;
  errorOutput?: string;
  attemptCount: number;
  hintsRevealed: number;
  timeSpentMinutes: number;
  onHintRevealed?: () => void;
  className?: string;
}

type MessageBubble = {
  id: string;
  type: "user" | "tutor";
  content: string;
  codeExample?: string;
  relatedConcept?: string;
  timestamp: number;
  feedback?: "helpful" | "not_helpful";
};

const MESSAGE_ICONS = {
  hint: Lightbulb,
  debug: Bug,
  explanation: BookOpen,
  review: MessageSquare,
  encouragement: Sparkles,
};

const MESSAGE_COLORS = {
  hint: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100",
  debug: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
  explanation: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
  review: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100",
  encouragement: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100",
};

export function AITutor({
  challenge,
  userCode,
  testOutput,
  errorOutput,
  attemptCount,
  hintsRevealed,
  timeSpentMinutes,
  onHintRevealed,
  className,
}: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session when challenge changes
  useEffect(() => {
    const newSession = createTutorSession(challenge, userCode);
    setSession(newSession);
    setMessages([
      {
        id: "welcome",
        type: "tutor",
        content: `Hi! I'm your AI tutor for "${challenge.title}". I can help you with hints, debugging, explanations, or just give you some encouragement!`,
        timestamp: Date.now(),
      },
    ]);
  }, [challenge.slug]);

  // Update session context when code changes
  useEffect(() => {
    if (session) {
      const updatedSession = updateTutorSession(session, {
        userCode,
        testOutput,
        errorOutput,
        attemptCount,
        hintsRevealed,
        timeSpentMinutes,
      });
      setSession(updatedSession);
    }
  }, [userCode, testOutput, errorOutput, attemptCount, hintsRevealed, timeSpentMinutes]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (type: TutorRequest["type"], specificQuestion?: string) => {
    if (!session) return;

    setIsTyping(true);
    setShowQuickActions(false);

    // Add user message
    const userMessage: MessageBubble = {
      id: `user_${Date.now()}`,
      type: "user",
      content: specificQuestion || getDefaultUserMessage(type),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Get tutor response
    const request: TutorRequest = {
      type,
      context: session.context,
      specificQuestion,
    };

    // Simulate typing delay for more natural feel
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = handleTutorRequest(request);
    
    const tutorMessage: MessageBubble = {
      id: response.message.id,
      type: "tutor",
      content: response.message.content,
      codeExample: response.message.codeExample,
      relatedConcept: response.message.relatedConcept,
      timestamp: response.message.timestamp,
    };

    setMessages((prev) => [...prev, tutorMessage]);
    setIsTyping(false);

    // Update session
    const updatedSession = addMessageToSession(session, response.message);
    setSession(updatedSession);

    // Track hint reveal
    if (type === "hint" && onHintRevealed) {
      onHintRevealed();
    }
  };

  const getDefaultUserMessage = (type: TutorRequest["type"]): string => {
    switch (type) {
      case "hint":
        return "Can you give me a hint?";
      case "debug":
        return "I'm getting an error. Can you help debug?";
      case "explanation":
        return "Can you explain this concept?";
      case "review":
        return "Can you review my code?";
      case "encouragement":
        return "I need some encouragement!";
      default:
        return "I need help";
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "hint":
        handleSendMessage("hint");
        break;
      case "debug":
        handleSendMessage("debug");
        break;
      case "explain":
        handleSendMessage("explanation", "Can you explain the key concept here?");
        break;
      case "review":
        handleSendMessage("review");
        break;
      case "encourage":
        handleSendMessage("encouragement");
        break;
    }
  };

  const handleFeedback = (messageId: string, feedback: "helpful" | "not_helpful") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    // TODO: Send feedback to analytics
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white shadow-lg hover:shadow-xl transition-all duration-200-shadow ${className}`}
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">AI Tutor</span>
        {errorOutput && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            !
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] ${className}`}
    >
      <Card className="flex h-[600px] max-h-[80vh] flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">AI Tutor</span>
          </div>
          <div className="flex items-center gap-1">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setSession(createTutorSession(challenge, userCode));
                setMessages([
                  {
                    id: "welcome",
                    type: "tutor",
                    content: `Hi! I'm your AI tutor for "${challenge.title}". I can help you with hints, debugging, explanations, or just give you some encouragement!`,
                    timestamp: Date.now(),
                  },
                ]);
                setShowQuickActions(true);
              }}
              className="text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </TouchButton>
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </TouchButton>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-[#2563EB]"
                }`}
              >
                {message.type === "tutor" && (
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      AI Tutor
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                
                {message.codeExample && (
                  <div className="mt-3 rounded-lg bg-gray-900 p-3">
                    <pre className="overflow-x-auto text-xs text-gray-100">
                      <code>{message.codeExample}</code>
                    </pre>
                  </div>
                )}

                {message.type === "tutor" && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback(message.id, "helpful")}
                      className={`rounded p-1 transition-all duration-200-all duration-200 ${
                        message.feedback === "helpful"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, "not_helpful")}
                      className={`rounded p-1 transition-all duration-200-all duration-200 ${
                        message.feedback === "not_helpful"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-[#2563EB]">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition-all duration-200={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition-all duration-200={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition-all duration-200={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="h-2 w-2 rounded-full bg-gray-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction("hint")}
                className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 transition-all duration-200-all duration-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50 cursor-pointer"
              >
                <Lightbulb className="h-3 w-3" />
                Get Hint
              </button>
              {errorOutput && (
                <button
                  onClick={() => handleQuickAction("debug")}
                  className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all duration-200-all duration-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50 cursor-pointer"
                >
                  <Bug className="h-3 w-3" />
                  Debug Error
                </button>
              )}
              <button
                onClick={() => handleQuickAction("explain")}
                className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 transition-all duration-200-all duration-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 cursor-pointer"
              >
                <BookOpen className="h-3 w-3" />
                Explain
              </button>
              <button
                onClick={() => handleQuickAction("review")}
                className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800 transition-all duration-200-all duration-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:hover:bg-purple-900/50 cursor-pointer"
              >
                <MessageSquare className="h-3 w-3" />
                Review Code
              </button>
              <button
                onClick={() => handleQuickAction("encourage")}
                className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 transition-all duration-200-all duration-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Encourage Me
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  handleSendMessage("explanation", inputValue.trim());
                  setInputValue("");
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <TouchButton
              onClick={() => {
                if (inputValue.trim()) {
                  handleSendMessage("explanation", inputValue.trim());
                  setInputValue("");
                }
              }}
              disabled={!inputValue.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-white transition-all duration-200-all duration-200 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </TouchButton>
          </div>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            AI Tutor provides educational guidance. For best results, try to solve challenges yourself first!
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
