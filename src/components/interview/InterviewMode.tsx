/**
 * Interview Mode Component
 * Enhanced interview practice interface
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Clock,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
  MessageSquare,
  Code,
  Wrench,
  Sparkles,
  Timer,
  Pause,
  Play,
  Flag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type {
  InterviewQuestion,
  InterviewTemplate,
  InterviewSession,
  InterviewSessionQuestion,
  InterviewQuestionType,
  InterviewDifficulty,
} from "@/lib/interview/types";
import {
  getRandomQuestions,
  getTemplateById,
  interviewTemplates,
  interviewTips,
} from "@/lib/interview/questions";

interface InterviewModeProps {
  userId: string;
}

type InterviewState = 'setup' | 'intro' | 'question' | 'review' | 'complete';

export function InterviewMode({ userId }: InterviewModeProps) {
  const [state, setState] = useState<InterviewState>('setup');
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [customConfig, setCustomConfig] = useState({
    questionCount: 5,
    difficulty: 'mid' as InterviewDifficulty,
    types: ['technical'] as InterviewQuestionType[],
    timeLimit: true,
  });
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);

  // Timer effect
  useEffect(() => {
    if (state === 'question' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state, timeRemaining]);

  const startInterview = useCallback(() => {
    const template = selectedTemplate;
    const config = template || {
      questionCount: customConfig.questionCount,
      difficulty: customConfig.difficulty,
      questionTypes: customConfig.types,
    };

    const questions = getRandomQuestions(config.questionCount, {
      types: config.questionTypes,
      difficulties: template ? undefined : [config.difficulty],
    });

    const sessionQuestions: InterviewSessionQuestion[] = questions.map((q) => ({
      questionId: q.id,
      question: q,
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      pointsCovered: [],
      followUpsAsked: [],
      followUpResponses: [],
    }));

    const newSession: InterviewSession = {
      id: generateId(),
      userId,
      mode: template ? 'mock_interview' : 'practice',
      difficulty: (template?.difficulty || customConfig.difficulty) as InterviewDifficulty,
      questionTypes: config.questionTypes as InterviewQuestionType[],
      targetDuration: template?.durationMinutes || 30,
      questions: sessionQuestions,
      currentQuestionIndex: 0,
      startedAt: new Date().toISOString(),
      totalTimeSeconds: 0,
      strengths: [],
      areasForImprovement: [],
      createdAt: new Date().toISOString(),
    };

    setSession(newSession);
    setCurrentQuestionIndex(0);
    setTimeRemaining(questions[0].timeLimitMinutes * 60);
    setState('intro');
  }, [selectedTemplate, customConfig, userId]);

  const handleTimeUp = () => {
    // Auto-submit when time is up
    submitAnswer();
  };

  const submitAnswer = () => {
    if (!session) return;

    const updatedQuestions = [...session.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      answer,
      endedAt: new Date().toISOString(),
      timeSpentSeconds: updatedQuestions[currentQuestionIndex].question.timeLimitMinutes * 60 - timeRemaining,
    };

    const updatedSession = {
      ...session,
      questions: updatedQuestions,
    };

    setSession(updatedSession);

    if (currentQuestionIndex < session.questions.length - 1) {
      setState('review');
    } else {
      setState('complete');
    }
  };

  const nextQuestion = () => {
    if (!session) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < session.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(session.questions[nextIndex].question.timeLimitMinutes * 60);
      setAnswer('');
      setShowHints(false);
      setState('question');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render different states
  if (state === 'setup') {
    return (
      <InterviewSetup
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        customConfig={customConfig}
        onUpdateConfig={setCustomConfig}
        onStart={startInterview}
      />
    );
  }

  if (state === 'intro') {
    return (
      <InterviewIntro
        session={session!}
        onBegin={() => setState('question')}
        onBack={() => setState('setup')}
      />
    );
  }

  if (state === 'question' && session) {
    const currentQuestion = session.questions[currentQuestionIndex];
    return (
      <QuestionView
        question={currentQuestion.question}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        timeRemaining={timeRemaining}
        answer={answer}
        onAnswerChange={setAnswer}
        showHints={showHints}
        onToggleHints={() => setShowHints(!showHints)}
        onSubmit={submitAnswer}
      />
    );
  }

  if (state === 'review' && session) {
    return (
      <QuestionReview
        question={session.questions[currentQuestionIndex]}
        onNext={nextQuestion}
      />
    );
  }

  if (state === 'complete' && session) {
    return (
      <InterviewComplete
        session={session}
        onRestart={() => setState('setup')}
      />
    );
  }

  return null;
}

// ============================================
// Sub-Components
// ============================================

function InterviewSetup({
  selectedTemplate,
  onSelectTemplate,
  customConfig,
  onUpdateConfig,
  onStart,
}: {
  selectedTemplate: InterviewTemplate | null;
  onSelectTemplate: (t: InterviewTemplate | null) => void;
  customConfig: any;
  onUpdateConfig: (c: any) => void;
  onStart: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  const questionTypeIcons = {
    technical: Code,
    system_design: Target,
    behavioral: MessageSquare,
    coding: Code,
    architecture: Target,
    troubleshooting: Wrench,
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Interview Practice</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Practice with realistic interview questions and get AI-powered feedback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setActiveTab('templates')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'custom'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          Custom
        </button>
      </div>

      {activeTab === 'templates' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interviewTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{template.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  template.difficulty === 'entry' ? 'bg-emerald-100 text-emerald-700' :
                  template.difficulty === 'mid' ? 'bg-blue-100 text-blue-700' :
                  template.difficulty === 'senior' ? 'bg-amber-100 text-amber-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {template.difficulty}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{template.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                <span>{template.questionCount} questions</span>
                <span>{template.durationMinutes} min</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Number of Questions</label>
              <input
                type="range"
                min="3"
                max="10"
                value={customConfig.questionCount}
                onChange={(e) => onUpdateConfig({ ...customConfig, questionCount: parseInt(e.target.value) })}
                className="mt-2 w-full"
              />
              <div className="text-center text-sm text-zinc-500">{customConfig.questionCount} questions</div>
            </div>

            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <div className="mt-2 flex gap-2">
                {(['entry', 'mid', 'senior', 'staff'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => onUpdateConfig({ ...customConfig, difficulty: d })}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      customConfig.difficulty === d
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Question Types</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(questionTypeIcons).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => {
                      const types = customConfig.types.includes(type)
                        ? customConfig.types.filter((t: string) => t !== type)
                        : [...customConfig.types, type];
                      onUpdateConfig({ ...customConfig, types });
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      customConfig.types.includes(type)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <button
        onClick={onStart}
        disabled={activeTab === 'templates' && !selectedTemplate}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Start Interview
      </button>
    </div>
  );
}

function InterviewIntro({
  session,
  onBegin,
  onBack,
}: {
  session: InterviewSession;
  onBegin: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl dark:bg-blue-900/30">
        🎯
      </div>
      <h2 className="text-2xl font-semibold">Ready to Begin?</h2>
      <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
        <p>{session.questions.length} questions</p>
        <p>Target duration: {session.targetDuration} minutes</p>
        <p>Difficulty: {session.difficulty}</p>
      </div>

      <div className="rounded-xl bg-amber-50 p-4 text-left dark:bg-amber-950/20">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Lightbulb className="h-4 w-4" />
          <span className="font-medium">Pro Tip</span>
        </div>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          {interviewTips[0].content}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Back
        </button>
        <button
          onClick={onBegin}
          className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Begin Interview
        </button>
      </div>
    </div>
  );
}

function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  answer,
  onAnswerChange,
  showHints,
  onToggleHints,
  onSubmit,
}: {
  question: InterviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  answer: string;
  onAnswerChange: (a: string) => void;
  showHints: boolean;
  onToggleHints: () => void;
  onSubmit: () => void;
}) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-zinc-500">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${
          timeRemaining < 60 ? 'text-red-500' : 'text-zinc-500'
        }`}>
          <Clock className="mr-1 inline h-4 w-4" />
          {formatTime(timeRemaining)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          question.difficulty === 'entry' ? 'bg-emerald-100 text-emerald-700' :
          question.difficulty === 'mid' ? 'bg-blue-100 text-blue-700' :
          question.difficulty === 'senior' ? 'bg-amber-100 text-amber-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold">{question.title}</h3>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">{question.question}</p>

        {question.context && (
          <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
            <strong>Context:</strong> {question.context}
          </div>
        )}

        {/* Hints */}
        <button
          onClick={onToggleHints}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Lightbulb className="h-4 w-4" />
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </button>

        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <ul className="space-y-2 rounded-lg bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
                {question.hints.map((hint, i) => (
                  <li key={i} className="flex gap-2 text-amber-800 dark:text-amber-200">
                    <span className="font-bold">{i + 1}.</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Answer Input */}
      <Card className="p-4">
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[150px] w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
        />
      </Card>

      {/* Submit */}
      <button
        onClick={onSubmit}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Submit Answer
      </button>
    </div>
  );
}

function QuestionReview({
  question,
  onNext,
}: {
  question: InterviewSessionQuestion;
  onNext: () => void;
}) {
  const q = question.question;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Answer Submitted!</span>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold">Expected Answer Points</h3>
        <ul className="mt-3 space-y-2">
          {q.expectedPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span className="text-zinc-700 dark:text-zinc-300">{point}</span>
            </li>
          ))}
        </ul>

        {q.followUpQuestions && q.followUpQuestions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Potential Follow-ups</h4>
            <ul className="mt-2 space-y-1">
              {q.followUpQuestions.map((followUp, i) => (
                <li key={i} className="text-sm text-zinc-500">
                  • {followUp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {q.relatedChallenges.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Related Challenges</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.relatedChallenges.map((slug) => (
                <Link
                  key={slug}
                  href={`/challenges/${slug}`}
                  className="rounded-lg bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  {slug}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Next Question
      </button>
    </div>
  );
}

function InterviewComplete({
  session,
  onRestart,
}: {
  session: InterviewSession;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/30">
        🎉
      </div>
      <h2 className="text-2xl font-semibold">Interview Complete!</h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        You answered {session.questions.length} questions in{' '}
        {Math.round(session.totalTimeSeconds / 60)} minutes
      </p>

      <Card className="p-6">
        <h3 className="font-semibold">Session Summary</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-2xl font-bold">{session.questions.length}</p>
            <p className="text-xs text-zinc-500">Questions</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-2xl font-bold">
              {Math.round(session.totalTimeSeconds / 60)}m
            </p>
            <p className="text-xs text-zinc-500">Duration</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-2xl font-bold">{session.difficulty}</p>
            <p className="text-xs text-zinc-500">Difficulty</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Practice Again
        </button>
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
