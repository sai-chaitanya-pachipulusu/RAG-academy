export type DiscussionCategory = 
  | "question"       // Help request
  | "solution"       // Alternative solution share
  | "optimization"   // Performance improvement
  | "bug_report"     // Issue with challenge
  | "tip"            // Helpful tip
  | "general";       // General discussion

export interface DiscussionThread {
  id: string;
  challengeSlug: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  category: DiscussionCategory;
  title: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;      // ISO date
  updatedAt: string;      // ISO date
  upvotes: number;
  replyCount: number;
  isPinned?: boolean;
  isResolved?: boolean;   // For questions
  tags: string[];
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;
  upvotes: number;
  isAcceptedAnswer?: boolean;  // For Q&A threads
}

export interface DiscussionStats {
  totalThreads: number;
  totalReplies: number;
  uniqueContributors: number;
}
