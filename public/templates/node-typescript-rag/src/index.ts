/**
 * RAG Academy — Node.js/TypeScript Template
 * Production-ready RAG API with hybrid retrieval and reranking.
 */

import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { chunkDocument } from "./pipeline/chunker.js";
import { embedChunks, embedQuery } from "./pipeline/embedder.js";
import { generateAnswer } from "./pipeline/generator.js";
import { rerank } from "./pipeline/reranker.js";
import { hybridRetrieve } from "./pipeline/retriever.js";
import type {
  IngestRequest,
  IngestResponse,
  QueryRequest,
  QueryResponse,
} from "./types.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
  max: parseInt(process.env.RATE_LIMIT_MAX || "60"),
  message: { error: "Rate limit exceeded. Try again later." },
});
app.use("/query", limiter);

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    vectorDb: process.env.VECTOR_DB || "chroma",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// Ingest Endpoint
// ─────────────────────────────────────────────────────────────

app.post("/ingest", async (req: Request, res: Response) => {
  try {
    const { content, source, metadata } = req.body as IngestRequest;

    if (!content || !source) {
      res.status(400).json({ error: "content and source are required" });
      return;
    }

    // 1. Chunk the document
    const chunks = chunkDocument(content, source, {
      chunkSize: parseInt(process.env.CHUNK_SIZE || "512"),
      overlap: parseInt(process.env.CHUNK_OVERLAP || "50"),
      metadata,
    });

    // 2. Generate embeddings
    const embeddings = await embedChunks(chunks.map((c) => c.text));

    // 3. Store in vector DB (implement based on your choice)
    // await vectorStore.upsert(chunks.map((c, i) => ({ ...c, embedding: embeddings[i] })));

    const response: IngestResponse = {
      status: "success",
      chunksCreated: chunks.length,
      source,
    };

    res.json(response);
  } catch (error) {
    console.error("Ingest error:", error);
    res.status(500).json({
      error: "Ingestion failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Query Endpoint
// ─────────────────────────────────────────────────────────────

app.post("/query", async (req: Request, res: Response) => {
  const start = Date.now();

  try {
    const {
      query,
      topK = parseInt(process.env.TOP_K || "10"),
      rerank: shouldRerank = process.env.RERANK_ENABLED === "true",
      rerankTopN = parseInt(process.env.RERANK_TOP_N || "5"),
    } = req.body as QueryRequest;

    if (!query) {
      res.status(400).json({ error: "query is required" });
      return;
    }

    // 1. Embed query
    const queryEmbedding = await embedQuery(query);

    // 2. Hybrid retrieve
    let candidates = await hybridRetrieve(query, queryEmbedding, topK);

    // 3. Rerank (optional)
    if (shouldRerank && candidates.length > 0) {
      candidates = await rerank(query, candidates, rerankTopN);
    }

    // 4. Generate answer
    const { answer, sources } = await generateAnswer(query, candidates);

    const response: QueryResponse = {
      answer,
      sources,
      retrievalScores: candidates.map((c) => c.score),
      latencyMs: Date.now() - start,
    };

    res.json(response);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({
      error: "Query failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Evaluation Endpoint
// ─────────────────────────────────────────────────────────────

app.post("/eval", async (req: Request, res: Response) => {
  try {
    const { goldenSetPath = "eval/golden_set.json" } = req.body;

    // Import evaluation metrics
    const { evaluateRetrieval } = await import("./eval/metrics.js");

    const results = await evaluateRetrieval(goldenSetPath, async (q: string) => {
      const embedding = await embedQuery(q);
      return hybridRetrieve(q, embedding, 10);
    });

    res.json(results);
  } catch (error) {
    console.error("Eval error:", error);
    res.status(500).json({
      error: "Evaluation failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 RAG API running at http://localhost:${PORT}`);
  console.log(`   Vector DB: ${process.env.VECTOR_DB || "chroma"}`);
  console.log(`   Reranking: ${process.env.RERANK_ENABLED === "true" ? "enabled" : "disabled"}`);
});
