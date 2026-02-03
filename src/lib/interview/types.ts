/**
 * Interview Mode Types
 * Enhanced interview practice with different question types and scenarios
 */

// ============================================
// Core Types
// ============================================

export type InterviewQuestionType = 
  | 'technical'      // Technical deep-dive questions
  | 'system_design'  // System design scenarios
  | 'behavioral'     // Behavioral questions
  | 'coding'         // Live coding challenges
  | 'architecture'   // Architecture discussion
  | 'troubleshooting'; // Debugging scenarios

export type InterviewDifficulty = 'entry' | 'mid' | 'senior' | 'staff';

export type InterviewMode = 
  | 'practice'       // Regular practice mode
  | 'timed'          // Timed interview simulation
  | 'adaptive'       // Difficulty adapts based on performance
  | 'mock_interview'; // Full mock interview experience

export interface InterviewQuestion {
  id: string;
  type: InterviewQuestionType;
  difficulty: InterviewDifficulty;
  category: string; // e.g., 'rag', 'embeddings', 'retrieval'
  
  // Question content
  title: string;
  question: string;
  context?: string; // Additional context for the question
  hints: string[];
  
  // Expected answer structure
  expectedPoints: string[]; // Key points expected in answer
  followUpQuestions?: string[]; // Potential follow-ups
  
  // Metadata
  timeLimitMinutes: number;
  relatedChallenges: string[]; // Related challenge slugs
  resources: string[]; // Links to relevant resources
  
  // Statistics
  averageScore: number;
  timesAsked: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  
  // Configuration
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  questionTypes: InterviewQuestionType[];
  targetDuration: number; // Minutes
  
  // Progress
  questions: InterviewSessionQuestion[];
  currentQuestionIndex: number;
  
  // Timing
  startedAt: string;
  endedAt?: string;
  totalTimeSeconds: number;
  
  // Results
  overallScore?: number;
  strengths: string[];
  areasForImprovement: string[];
  
  // Feedback
  aiFeedback?: string;
  
  createdAt: string;
}

export interface InterviewSessionQuestion {
  questionId: string;
  question: InterviewQuestion;
  
  // User response
  answer?: string;
  codeAnswer?: string;
  notes?: string;
  
  // Timing
  startedAt: string;
  endedAt?: string;
  timeSpentSeconds: number;
  
  // Evaluation
  score?: number; // 0-100
  pointsCovered: string[]; // Which expected points were covered
  feedback?: string;
  
  // Follow-ups
  followUpsAsked: string[];
  followUpResponses: string[];
}

// ============================================
// Interview Templates
// ============================================

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  difficulty: InterviewDifficulty;
  questionTypes: InterviewQuestionType[];
  questionCount: number;
  durationMinutes: number;
  
  // Question selection
  categories: string[]; // Focus categories
  excludeCategories?: string[];
  
  // Features
  includeFollowUps: boolean;
  includeTimePressure: boolean;
  includeAiFeedback: boolean;
}

// ============================================
// Performance Tracking
// ============================================

export interface InterviewPerformance {
  userId: string;
  
  // Overall stats
  totalSessions: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  
  // By category
  byCategory: Record<string, {
    questionsAnswered: number;
    averageScore: number;
    strength: 'weak' | 'average' | 'strong';
  }>;
  
  // By question type
  byType: Record<InterviewQuestionType, {
    questionsAnswered: number;
    averageScore: number;
  }>;
  
  // Progress over time
  recentTrend: 'improving' | 'stable' | 'declining';
  scoreHistory: { date: string; score: number }[];
  
  // Recommendations
  recommendedFocus: string[];
  recommendedTemplates: string[];
}

// ============================================
// AI Feedback
// ============================================

export interface InterviewAIFeedback {
  overallAssessment: string;
  
  // Strengths
  strengths: {
    area: string;
    description: string;
    examples: string[];
  }[];
  
  // Areas for improvement
  improvements: {
    area: string;
    description: string;
    suggestions: string[];
  }[];
  
  // Question-specific feedback
  questionFeedback: {
    questionId: string;
    score: number;
    whatWentWell: string[];
    whatToImprove: string[];
    modelAnswer: string;
  }[];
  
  // Study recommendations
  recommendedChallenges: string[];
  recommendedResources: string[];
  
  // Comparison
  percentileRank?: number; // How user compares to others
}

// ============================================
// Interview Scenarios
// ============================================

export interface InterviewScenario {
  id: string;
  name: string;
  description: string;
  
  // Scenario setup
  role: string; // e.g., "Senior RAG Engineer at TechCorp"
  companyContext: string;
  teamContext?: string;
  
  // Questions specific to this scenario
  questions: InterviewQuestion[];
  
  // Evaluation criteria
  evaluationCriteria: {
    category: string;
    weight: number;
    description: string;
  }[];
}

// ============================================
// API Types
// ============================================

export interface StartInterviewRequest {
  userId: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  questionTypes?: InterviewQuestionType[];
  templateId?: string;
  targetDuration?: number;
  categories?: string[];
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
  codeAnswer?: string;
  notes?: string;
  timeSpentSeconds: number;
}

export interface RequestHintRequest {
  sessionId: string;
  questionId: string;
  hintIndex: number;
}

export interface GetInterviewPerformanceRequest {
  userId: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

// ============================================
// Interview Tips & Guidance
// ============================================

export interface InterviewTip {
  id: string;
  category: InterviewQuestionType;
  difficulty: InterviewDifficulty;
  title: string;
  content: string;
  examples?: string[];
  commonMistakes?: string[];
}
