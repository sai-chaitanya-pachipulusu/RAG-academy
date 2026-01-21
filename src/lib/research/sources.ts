import type { FeedSource } from "./types";

export const DEFAULT_FEED_SOURCES: FeedSource[] = [
  {
    id: "arxiv-rag",
    title: "arXiv (RAG / Retrieval-Augmented Generation)",
    kind: "arxiv",
    url: "https://export.arxiv.org/api/query?search_query=all:%22retrieval%20augmented%20generation%22+OR+all:RAG&sortBy=submittedDate&sortOrder=descending&max_results=15",
    tags: ["papers", "rag", "retrieval"],
  },
  {
    id: "arxiv-llm-security",
    title: "arXiv (LLM Security / Prompt Injection)",
    kind: "arxiv",
    url: "https://export.arxiv.org/api/query?search_query=all:%22prompt%20injection%22+OR+all:%22data%20exfiltration%22+OR+all:%22jailbreak%22&sortBy=submittedDate&sortOrder=descending&max_results=10",
    tags: ["papers", "security"],
  },
  {
    id: "reddit-local-llama",
    title: "Reddit: r/LocalLLaMA",
    kind: "rss",
    url: "https://www.reddit.com/r/LocalLLaMA/.rss",
    tags: ["community", "tooling", "production"],
  },
  {
    id: "reddit-machinelearning",
    title: "Reddit: r/MachineLearning",
    kind: "rss",
    url: "https://www.reddit.com/r/MachineLearning/.rss",
    tags: ["community", "papers"],
  },
  {
    id: "pinecone-blog",
    title: "Pinecone blog",
    kind: "rss",
    url: "https://www.pinecone.io/blog/rss.xml",
    tags: ["vector-db", "rag", "production"],
  },
  {
    id: "weaviate-blog",
    title: "Weaviate blog",
    kind: "rss",
    url: "https://weaviate.io/blog/rss.xml",
    tags: ["vector-db", "rag", "production"],
  },
];


