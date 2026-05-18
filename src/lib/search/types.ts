export type SearchResult = {
  type: "lesson" | "challenge" | "playbook";
  /** Stable handle for citations (index id or challenge:slug). */
  contentId?: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
  excerpt?: string;
};


