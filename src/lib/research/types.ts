export type FeedItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  publishedAt: string | null;
  summary: string | null;
  tags: string[];
};

export type FeedSource = {
  id: string;
  title: string;
  kind: "rss" | "atom" | "arxiv";
  url: string;
  tags: string[];
};


