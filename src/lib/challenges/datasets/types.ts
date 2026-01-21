
export type Doc = {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type Query = {
  id: string;
  text: string;
  relevantDocs: string[]; // List of doc IDs considered ground truth (qrels)
};

export type Dataset = {
  id: string;
  name: string;
  description: string;
  docs: Doc[];
  queries: Query[];
};
