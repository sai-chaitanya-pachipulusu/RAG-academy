export type ContributionType =
  | "challenge"         // New challenge submission
  | "solution"          // Alternative solution
  | "paper"             // Research paper suggestion
  | "correction"        // Bug fix or correction
  | "translation";      // Content translation

export type ContributionStatus =
  | "draft"            // Work in progress
  | "submitted"        // Awaiting review
  | "in_review"        // Being reviewed
  | "approved"         // Accepted
  | "changes_requested" // Needs changes
  | "rejected";        // Not accepted

export interface Contribution {
  id: string;
  type: ContributionType;
  status: ContributionStatus;
  title: string;
  description: string;
  
  // Submitter
  userId: string;
  userName: string;
  
  // Content based on type
  challengeData?: ChallengeContribution;
  solutionData?: SolutionContribution;
  paperData?: PaperContribution;
  correctionData?: CorrectionContribution;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Recognition
  xpAwarded?: number;
}

export interface ChallengeContribution {
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  group: string;
  starterCode: string;
  testCode: string;
  hints: string[];
  solution: string;
  prompt: string;  // MDX content
  
  // Context
  relatedTo?: string[];  // Related challenge slugs
  prereqs?: string[];    // Prerequisite challenges
}

export interface SolutionContribution {
  challengeSlug: string;
  language: "python" | "typescript";
  code: string;
  explanation: string;
  complexity?: {
    time: string;
    space: string;
  };
  approach: string;  // e.g., "functional", "iterative", "optimized"
}

export interface PaperContribution {
  title: string;
  authors: string;
  year: number;
  venue: string;
  arxivUrl?: string;
  pdfUrl?: string;
  tags: string[];
  summary: string;
  relevance: string;  // Why this paper matters for RAG
}

export interface CorrectionContribution {
  targetType: "challenge" | "lesson" | "playbook";
  targetSlug: string;
  issueDescription: string;
  suggestedFix: string;
  codeChanges?: string;
}

export interface ContributorStats {
  totalContributions: number;
  approved: number;
  pending: number;
  xpEarned: number;
  rank?: string;  // e.g., "Top Contributor", "Rising Star"
}
