export type SearchResult = {
  type: "lesson" | "challenge" | "playbook";
  title: string;
  url: string;
  snippet: string;
  score: number;
  excerpt?: string;
};


