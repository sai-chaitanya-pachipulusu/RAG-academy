import type { RawChallenge } from "@/lib/challenges/types";

export const MISSING_CHALLENGES: RawChallenge[] = [
  {
    slug: "embedding-model-selection",
    title: "Embedding Model Selection",
    description:
      "Compare and select embedding models based on performance, cost, and use case. Why: Different models excel at different tasks - choosing wrong impacts quality significantly. Solves: Make informed decisions about which embedding model to use.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List, Dict, Tuple
import json

EMBEDDING_MODELS = {
    "text-embedding-3-small": {
        "dimensions": 1536,
        "cost_per_1k": 0.00002,
        "latency_ms": 50,
        "mteb_score": 62.3,
    },
    "text-embedding-3-large": {
        "dimensions": 3072,
        "cost_per_1k": 0.00013,
        "latency_ms": 150,
        "mteb_score": 67.7,
    },
    "cohere-embed-english-v3": {
        "dimensions": 1024,
        "cost_per_1k": 0.00010,
        "latency_ms": 80,
        "mteb_score": 64.8,
    },
}

def calculate_cost_efficiency(
    model_name: str, 
    num_documents: int, 
    avg_doc_length: int,
    queries_per_day: int
) -> float:
    """
    Calculate cost efficiency score for a model.
    
    Consider:
    - Embedding cost (based on tokens)
    - Storage cost (dimensions)
    - Latency cost (affects user experience)
    
    Lower is better.
    """
    model = EMBEDDING_MODELS[model_name]
    # Estimate tokens (rough: 1 token ~ 4 chars)
    doc_tokens = num_documents * (avg_doc_length // 4)
    query_tokens_per_day = queries_per_day * 50  # Assume 50 tokens per query
    daily_tokens = doc_tokens + query_tokens_per_day
    
    # TODO: implement cost calculation
    # Consider: embedding cost + storage cost + latency impact
    raise NotImplementedError

def select_best_model(
    num_documents: int,
    avg_doc_length: int,
    queries_per_day: int,
    min_mteb_score: float = 60.0,
    budget_monthly: float = 100.0
) -> Tuple[str, Dict]:
    """
    Select the best embedding model based on constraints.
    
    Returns: (model_name, analysis_dict)
    """
    # TODO: implement model selection logic
    raise NotImplementedError
`,
    testCode: `def _almost_equal(x, y, eps=1e-3):
    return abs(x - y) < eps

# Test cost calculation
cost = calculate_cost_efficiency("text-embedding-3-small", 10000, 500, 1000)
assert cost > 0, "Cost should be positive"

# Test model selection - should meet MTEB threshold
model, analysis = select_best_model(10000, 500, 1000, min_mteb_score=60.0)
assert model in EMBEDDING_MODELS, f"Invalid model: {model}"
assert analysis["mteb_score"] >= 60.0, f"MTEB score too low: {analysis['mteb_score']}"
assert analysis["monthly_cost"] <= 100.0, f"Over budget: {analysis['monthly_cost']}"

# Test with high quality requirement
model, analysis = select_best_model(50000, 1000, 5000, min_mteb_score=65.0, budget_monthly=500.0)
print("Selected model:", model)
print("MTEB score:", analysis["mteb_score"])
print("Monthly cost: $" + str(round(analysis["monthly_cost"], 2)))

print("All tests passed!")`,
    hints: [
      "Cost = (embedding_cost_per_1k * tokens / 1000) + (dimensions * storage_cost_per_dim)",
      "Consider latency impact on user experience (convert to monetary impact)",
      "Filter models by minimum MTEB score first, then pick lowest cost",
    ],
    solution: `from typing import List, Dict, Tuple

EMBEDDING_MODELS = {
    "text-embedding-3-small": {
        "dimensions": 1536,
        "cost_per_1k": 0.00002,
        "latency_ms": 50,
        "mteb_score": 62.3,
    },
    "text-embedding-3-large": {
        "dimensions": 3072,
        "cost_per_1k": 0.00013,
        "latency_ms": 150,
        "mteb_score": 67.7,
    },
    "cohere-embed-english-v3": {
        "dimensions": 1024,
        "cost_per_1k": 0.00010,
        "latency_ms": 80,
        "mteb_score": 64.8,
    },
}

STORAGE_COST_PER_DIM_PER_MILLION = 0.0001  # $ per million vectors per dimension

def calculate_cost_efficiency(
    model_name: str, 
    num_documents: int, 
    avg_doc_length: int,
    queries_per_day: int
) -> float:
    model = EMBEDDING_MODELS[model_name]
    doc_tokens = num_documents * (avg_doc_length // 4)
    query_tokens_per_day = queries_per_day * 50
    daily_tokens = doc_tokens + query_tokens_per_day
    
    embedding_cost = (daily_tokens / 1000) * model["cost_per_1k"] * 30  # monthly
    storage_cost = num_documents * model["dimensions"] * STORAGE_COST_PER_DIM_PER_MILLION / 1_000_000
    latency_cost = model["latency_ms"] * queries_per_day * 30 * 0.00001  # $10 per minute wait time
    
    return embedding_cost + storage_cost + latency_cost

def select_best_model(
    num_documents: int,
    avg_doc_length: int,
    queries_per_day: int,
    min_mteb_score: float = 60.0,
    budget_monthly: float = 100.0
) -> Tuple[str, Dict]:
    candidates = []
    
    for name, props in EMBEDDING_MODELS.items():
        if props["mteb_score"] < min_mteb_score:
            continue
            
        cost = calculate_cost_efficiency(name, num_documents, avg_doc_length, queries_per_day)
        
        if cost <= budget_monthly:
            candidates.append((name, cost, props))
    
    if not candidates:
        raise ValueError("No model meets criteria: min_mteb=" + str(min_mteb_score) + ", budget=$" + str(budget_monthly))
    
    # Select lowest cost
    best = min(candidates, key=lambda x: x[1])
    return best[0], {
        "mteb_score": best[2]["mteb_score"],
        "monthly_cost": best[1],
        "dimensions": best[2]["dimensions"],
    }`,
    timeEstimate: { minutes: 30, label: "30-45 min" },
    realWorld: {
      description: "Embedding model selection directly impacts RAG quality and cost. OpenAI's models are general-purpose; domain-specific models (like scibert for science) may outperform on specific tasks.",
      companies: ["OpenAI", "Cohere", "Hugging Face"],
      useCases: ["Production RAG", "Cost Optimization", "Quality Assurance"],
    },
    relatedChallenges: ["embedding-finetuning", "cosine-similarity"],
    relatedPlaybooks: ["embedding-model-selection", "rag-cost-calculator"],
  },
  {
    slug: "rag-cost-calculator",
    title: "RAG Cost Calculator",
    description:
      "Build a comprehensive cost calculator for RAG systems. Why: RAG costs add up quickly - embeddings, vector DB, LLM calls. Solves: Predict and optimize RAG costs before going to production.",
    group: "Phase 6 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import Dict, List

# Pricing constants (example values)
LLM_PRICING = {
    "gpt-4o": {"input": 0.005, "output": 0.015},  # per 1K tokens
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
}

EMBEDDING_PRICING = {
    "text-embedding-3-small": 0.00002,  # per 1K tokens
    "text-embedding-3-large": 0.00013,
}

VECTOR_DB_PRICING = {
    "pinecone": {"storage": 0.08, "read_operations": 0.40},  # per 100K
    "weaviate": {"storage": 0.05, "read_operations": 0.10},
    "qdrant": {"storage": 0.03, "read_operations": 0.05},
}

def calculate_monthly_cost(
    llm_model: str,
    embedding_model: str,
    vector_db: str,
    num_documents: int,
    avg_doc_tokens: int,
    queries_per_day: int,
    avg_query_tokens: int,
    avg_context_tokens: int,
    avg_output_tokens: int,
) -> Dict:
    """
    Calculate monthly RAG system costs.
    
    Returns dict with breakdown:
    - embedding_costs
    - llm_costs  
    - vector_db_costs
    - total
    """
    # TODO: implement cost calculation
    raise NotImplementedError

def calculate_cost_per_query(
    llm_model: str,
    embedding_model: str,
    avg_query_tokens: int,
    avg_context_tokens: int,
    avg_output_tokens: int,
    retrieval_count: int = 10,
) -> Dict:
    """
    Calculate cost per individual query.
    """
    # TODO: implement per-query cost
    raise NotImplementedError
`,
    testCode: `cost = calculate_monthly_cost(
    llm_model="gpt-4o-mini",
    embedding_model="text-embedding-3-small",
    vector_db="qdrant",
    num_documents=10000,
    avg_doc_tokens=500,
    queries_per_day=1000,
    avg_query_tokens=50,
    avg_context_tokens=3000,
    avg_output_tokens=200,
)

print("Monthly cost breakdown:", cost)
assert cost["total"] > 0, "Total should be positive"
assert "embedding_costs" in cost
assert "llm_costs" in cost
assert "vector_db_costs" in cost

# Test per-query cost
per_query = calculate_cost_per_query(
    llm_model="gpt-4o-mini",
    embedding_model="text-embedding-3-small",
    avg_query_tokens=50,
    avg_context_tokens=3000,
    avg_output_tokens=200,
)
print("Cost per query: $" + str(round(per_query["total"], 6)))
assert per_query["total"] > 0

# Compare models
cost_small = calculate_monthly_cost(
    "gpt-4o-mini", "text-embedding-3-small", "qdrant",
    10000, 500, 1000, 50, 3000, 200
)
cost_large = calculate_monthly_cost(
    "gpt-4o", "text-embedding-3-large", "pinecone",
    10000, 500, 1000, 50, 3000, 200
)

print("GPT-4o-mini: $" + str(round(cost_small["total"], 2)) + "/month")
print("GPT-4o: $" + str(round(cost_large["total"], 2)) + "/month")

print("All tests passed!")`,
    hints: [
      "Embedding cost = (documents * doc_tokens + queries * query_tokens) * price_per_1k",
      "LLM cost = queries * (context_tokens + output_tokens) * price_per_1k",
      "Vector DB = storage_cost + (queries * read_ops)",
      "30 days per month for daily calculations",
    ],
    solution: `from typing import Dict

LLM_PRICING = {
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
}

EMBEDDING_PRICING = {
    "text-embedding-3-small": 0.00002,
    "text-embedding-3-large": 0.00013,
}

VECTOR_DB_PRICING = {
    "pinecone": {"storage": 0.08, "read_operations": 0.40},
    "weaviate": {"storage": 0.05, "read_operations": 0.10},
    "qdrant": {"storage": 0.03, "read_operations": 0.05},
}

def calculate_monthly_cost(
    llm_model: str,
    embedding_model: str,
    vector_db: str,
    num_documents: int,
    avg_doc_tokens: int,
    queries_per_day: int,
    avg_query_tokens: int,
    avg_context_tokens: int,
    avg_output_tokens: int,
) -> Dict:
    days_per_month = 30
    
    # Embedding costs
    doc_embedding_tokens = num_documents * avg_doc_tokens
    daily_query_tokens = queries_per_day * avg_query_tokens
    monthly_embedding_tokens = doc_embedding_tokens + (daily_query_tokens * days_per_month)
    embedding_costs = (monthly_embedding_tokens / 1000) * EMBEDDING_PRICING[embedding_model]
    
    # LLM costs
    daily_context_tokens = queries_per_day * avg_context_tokens
    daily_output_tokens = queries_per_day * avg_output_tokens
    monthly_context = daily_context_tokens * days_per_month
    monthly_output = daily_output_tokens * days_per_month
    llm_costs = (monthly_context / 1000) * LLM_PRICING[llm_model]["input"]
    llm_costs += (monthly_output / 1000) * LLM_PRICING[llm_model]["output"]
    
    # Vector DB costs
    db_pricing = VECTOR_DB_PRICING[vector_db]
    storage_costs = (num_documents / 1_000_000) * db_pricing["storage"]
    monthly_reads = queries_per_day * days_per_month / 100_000
    read_costs = monthly_reads * db_pricing["read_operations"]
    vector_db_costs = storage_costs + read_costs
    
    return {
        "embedding_costs": round(embedding_costs, 2),
        "llm_costs": round(llm_costs, 2),
        "vector_db_costs": round(vector_db_costs, 2),
        "total": round(embedding_costs + llm_costs + vector_db_costs, 2),
    }

def calculate_cost_per_query(
    llm_model: str,
    embedding_model: str,
    avg_query_tokens: int,
    avg_context_tokens: int,
    avg_output_tokens: int,
    retrieval_count: int = 10,
) -> Dict:
    # Embedding cost for query
    embedding_cost = (avg_query_tokens / 1000) * EMBEDDING_PRICING[embedding_model]
    
    # LLM cost
    llm_cost = (avg_context_tokens / 1000) * LLM_PRICING[llm_model]["input"]
    llm_cost += (avg_output_tokens / 1000) * LLM_PRICING[llm_model]["output"]
    
    # Vector DB read (minimal for one query)
    db_cost = (1 / 100_000) * VECTOR_DB_PRICING["qdrant"]["read_operations"]
    
    return {
        "embedding": round(embedding_cost, 6),
        "llm": round(llm_cost, 6),
        "vector_db": round(db_cost, 6),
        "total": round(embedding_cost + llm_cost + db_cost, 6),
    }`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "RAG costs can surprise teams - a system with 10K documents and 1K daily queries might cost $50-500/month depending on model choices. This challenge teaches cost-awareness.",
      companies: ["OpenAI", "Anthropic", "Pinecone"],
      useCases: ["Budget Planning", "Cost Optimization", "Vendor Selection"],
    },
    relatedChallenges: ["embedding-model-selection", "semantic-caching"],
    relatedPlaybooks: ["rag-cost-calculator", "rag-techniques-encyclopedia"],
  },
  {
    slug: "chunking-strategies",
    title: "Chunking Strategies Overview",
    description:
      "Implement multiple chunking strategies and compare their effectiveness. Why: Different content types need different approaches. Solves: Choose optimal chunking for your specific use case.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List, Callable
import re

def chunk_by_characters(text: str, chunk_size: int, overlap: int = 0) -> List[str]:
    """
    Fixed-size character-based chunking.
    """
    # TODO: implement
    raise NotImplementedError

def chunk_by_sentences(text: str, max_sentences: int) -> List[str]:
    """
    Split text by sentences, grouping multiple sentences per chunk.
    """
    # TODO: implement
    raise NotImplementedError

def chunk_by_paragraphs(text: str, max_paragraphs: int) -> List[str]:
    """
    Split by paragraphs (double newline separator).
    """
    # TODO: implement
    raise NotImplementedError

def chunk_by_markdown_headers(text: str, max_chunk_size: int) -> List[str]:
    """
    Split by markdown headers, grouping content under each header.
    """
    # TODO: implement
    raise NotImplementedError

def compare_chunking_strategies(
    text: str,
    strategies: List[Callable],
    chunk_size: int
) -> dict:
    """
    Compare different chunking strategies.
    
    Returns metrics for each strategy:
    - num_chunks
    - avg_chunk_length
    - coverage (how much of original text is preserved)
    """
    # TODO: implement comparison
    raise NotImplementedError
`,
    testCode: `text = "# Introduction to RAG\\n\\nRetrieval-Augmented Generation (RAG) is a technique for enhancing LLM responses.\\n\\n## What is RAG?\\n\\nRAG combines the power of retrieval systems with generative models.\\n\\n## Why use RAG?\\n\\n1. Factual accuracy\\n2. Source attribution\\n3. Up-to-date knowledge\\n\\n## How does it work?\\n\\nThe system retrieves relevant documents and feeds them to the LLM as context."

# Test character chunking
char_chunks = chunk_by_characters(text, 100, overlap=20)
assert len(char_chunks) > 0
print("Character chunks:", len(char_chunks))

# Test sentence chunking
sentence_chunks = chunk_by_sentences(text, max_sentences=2)
assert len(sentence_chunks) > 0
print("Sentence chunks:", len(sentence_chunks))

# Test paragraph chunking
para_chunks = chunk_by_paragraphs(text, max_paragraphs=2)
assert len(para_chunks) > 0
print("Paragraph chunks:", len(para_chunks))

# Test markdown chunking
md_chunks = chunk_by_markdown_headers(text, max_chunk_size=500)
assert len(md_chunks) > 0
print("Markdown chunks:", len(md_chunks))

# Test comparison
comparison = compare_chunking_strategies(
    text,
    [chunk_by_characters, chunk_by_sentences, chunk_by_paragraphs],
    chunk_size=100
)
print("Comparison:", comparison)

print("All tests passed!")`,
    hints: [
      "Character chunking: use slicing with overlap [i:i+size]",
      "Sentence chunking: split by [.!?] then group",
      "Paragraph: split by \\n\\n",
      "Markdown: find headers (# ## ###), group content between them",
    ],
    solution: `from typing import List, Callable
import re

def chunk_by_characters(text: str, chunk_size: int, overlap: int = 0) -> List[str]:
    if not text or chunk_size <= 0:
        return [text] if text else []
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap if overlap > 0 else end
    
    return chunks

def chunk_by_sentences(text: str, max_sentences: int) -> List[str]:
    sentences = re.split(r'(?<=[.!?])\\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    chunks = []
    for i in range(0, len(sentences), max_sentences):
        chunk = ' '.join(sentences[i:i + max_sentences])
        chunks.append(chunk)
    
    return chunks

def chunk_by_paragraphs(text: str, max_paragraphs: int) -> List[str]:
    paragraphs = text.split('\\n\\n')
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    chunks = []
    for i in range(0, len(paragraphs), max_paragraphs):
        chunk = '\\n\\n'.join(paragraphs[i:i + max_paragraphs])
        chunks.append(chunk)
    
    return chunks

def chunk_by_markdown_headers(text: str, max_chunk_size: int) -> List[str]:
    lines = text.split('\\n')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for line in lines:
        line_size = len(line)
        if current_size + line_size > max_chunk_size and current_chunk:
            chunks.append('\\n'.join(current_chunk))
            current_chunk = [line]
            current_size = line_size
        else:
            current_chunk.append(line)
            current_size += line_size
    
    if current_chunk:
        chunks.append('\\n'.join(current_chunk))
    
    return chunks

def compare_chunking_strategies(
    text: str,
    strategies: List[Callable],
    chunk_size: int
) -> dict:
    results = {}
    
    for strategy in strategies:
        if strategy.__name__ == "chunk_by_sentences":
            chunks = strategy(text, max_sentences=chunk_size)
        elif strategy.__name__ == "chunk_by_paragraphs":
            chunks = strategy(text, max_paragraphs=chunk_size)
        else:
            chunks = strategy(text, chunk_size)
        
        results[strategy.__name__] = {
            "num_chunks": len(chunks),
            "avg_chunk_length": sum(len(c) for c in chunks) / len(chunks) if chunks else 0,
            "coverage": sum(len(c) for c in chunks) / len(text) if text else 0,
        }
    
    return results`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Chunking strategy significantly impacts retrieval quality. Code needs different chunking than prose. Medical texts need sentence-level chunks while legal documents benefit from section-level.",
      companies: ["Notion", "Linear", "GitBook"],
      useCases: ["Documentation RAG", "Knowledge Bases", "Code Search"],
    },
    relatedChallenges: ["simple-chunking", "semantic-chunking", "recursive-chunking"],
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },
  {
    slug: "contextual-retrieval",
    title: "Contextual Retrieval",
    description:
      "Implement contextual retrieval - adding surrounding context to chunks before embedding. Why: Chunks lose meaning without context; this improves retrieval precision significantly. Solves: Better retrieval by preserving document structure.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Tuple

def get_surrounding_context(
    full_text: str,
    chunk_start: int,
    context_lines: int = 3
) -> str:
    """
    Extract surrounding context for a chunk.
    
    Returns text from before and after the chunk.
    """
    # TODO: implement
    raise NotImplementedError

def create_contextual_chunks(
    text: str,
    chunk_size: int,
    context_lines: int = 3
) -> List[Dict]:
    """
    Create chunks with surrounding context.
    
    Returns list of {
        "chunk": str,      # The actual chunk
        "context": str,    # Surrounding context
        "full_with_context": str  # Chunk + context combined
    }
    """
    # TODO: implement
    raise NotImplementedError

def contextual_embed_prep(
    chunks_with_context: List[Dict],
    include_context_in_embedding: bool = True
) -> List[str]:
    """
    Prepare text for embedding, optionally including context.
    
    If include_context_in_embedding is True, prepend context to chunk.
    Otherwise, just return the chunk.
    """
    # TODO: implement
    raise NotImplementedError

def evaluate_contextual_retrieval(
    queries: List[str],
    chunks_with_context: List[Dict],
    top_k: int = 3
) -> Dict:
    """
    Evaluate contextual retrieval effectiveness.
    
    Compare retrieval with and without context.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "# Chapter 1: Introduction\\n\\nThis is the introduction section of our document.\\nIt provides an overview of what will be covered.\\n\\n## Background\\n\\nMachine learning has revolutionized many fields.\\nDeep learning has made significant progress recently.\\n\\n## Objectives\\n\\nThe main objectives of this work are:\\n1. To understand RAG systems\\n2. To build production-ready pipelines\\n3. To optimize for cost and quality\\n\\n# Chapter 2: Technical Details\\n\\nThis chapter covers the technical implementation."

# Test surrounding context
context = get_surrounding_context(text, 50, context_lines=2)
print("Context:", context[:100], "...")

# Test contextual chunking
chunks = create_contextual_chunks(text, chunk_size=100, context_lines=2)
print("Created", len(chunks), "contextual chunks")

for i, c in enumerate(chunks[:2]):
    print("\\nChunk", i, ":", c["chunk"][:50], "...")
    print("Context:", c["context"][:50], "...")
    print("Full:", c["full_with_context"][:80], "...")

# Test embedding prep
prepared = contextual_embed_prep(chunks, include_context_in_embedding=True)
print("\\nPrepared", len(prepared), "texts for embedding")

# Test retrieval evaluation
queries = ["objectives of this work", "machine learning revolution"]
results = evaluate_contextual_retrieval(queries, chunks, top_k=2)
print("\\nEvaluation results:", results)

print("All tests passed!")`,
    hints: [
      "Get surrounding context by finding chunk position in full text",
      "Extract text before and after the chunk using the context_lines parameter",
      "Combine context + chunk for embedding (this is the key insight of contextual retrieval)",
      "For evaluation, compare retrieval precision with/without context",
    ],
    solution: `from typing import List, Dict, Tuple

def get_surrounding_context(
    full_text: str,
    chunk_start: int,
    context_lines: int = 3
) -> str:
    lines = full_text[:chunk_start].split('\\n')
    preceding = '\\n'.join(lines[-context_lines:]) if lines else ""
    
    chunk_end = chunk_start + 200  # approximate
    remaining = full_text[chunk_start:chunk_start + 500]
    following_lines = remaining.split('\\n')[:context_lines]
    following = '\\n'.join(following_lines)
    
    context_parts = []
    if preceding:
        context_parts.append(preceding)
    if following:
        context_parts.append(following)
    
    return '\\n'.join(context_parts)

def create_contextual_chunks(
    text: str,
    chunk_size: int,
    context_lines: int = 3
) -> List[Dict]:
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        
        context = get_surrounding_context(text, start, context_lines)
        
        chunks.append({
            "chunk": chunk,
            "context": context,
            "full_with_context": "Context: {}\\n\\nChunk: {}".format(context, chunk)
        })
        
        start = end
    
    return chunks

def contextual_embed_prep(
    chunks_with_context: List[Dict],
    include_context_in_embedding: bool = True
) -> List[str]:
    if include_context_in_embedding:
        return [c["full_with_context"] for c in chunks_with_context]
    else:
        return [c["chunk"] for c in chunks_with_context]

def evaluate_contextual_retrieval(
    queries: List[str],
    chunks_with_context: List[Dict],
    top_k: int = 3
) -> Dict:
    results = {}
    for query in queries:
        query_lower = query.lower()
        
        with_context_scores = []
        without_context_scores = []
        
        for c in chunks_with_context:
            with_ctx = sum(1 for word in query_lower.split() if word in c["full_with_context"].lower())
            with_context_scores.append(with_ctx)
            
            without_ctx = sum(1 for word in query_lower.split() if word in c["chunk"].lower())
            without_context_scores.append(without_ctx)
        
        top_with = sorted(zip(range(len(chunks_with_context)), with_context_scores), 
                         key=lambda x: x[1], reverse=True)[:top_k]
        top_without = sorted(zip(range(len(chunks_with_context)), without_context_scores),
                           key=lambda x: x[1], reverse=True)[:top_k]
        
        results[query] = {
            "with_context": [i for i, s in top_with],
            "without_context": [i for i, s in top_without],
            "improvement": len(set(top_with) & set(top_without)) / top_k
        }
    
    return results`,
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "Anthropic's contextual retrieval paper showed 49% improvement in retrieval precision. By embedding 'Summary: This is about X. Content: [chunk]' instead of just the chunk, you preserve document structure.",
      companies: ["Anthropic", "Notion", "Confluence"],
      useCases: ["Enterprise Search", "Documentation RAG", "Knowledge Management"],
    },
    relatedChallenges: ["contextual-chunk-headers", "semantic-chunking"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "chunking-strategies"],
  },
  {
    slug: "splade-learned-sparse",
    title: "SPLADE Learned Sparse Embeddings",
    description:
      "Implement SPLADE (Sparse Lexical and Expansion) learned sparse embeddings. Why: SPLADE combines dense retrieval's semantic power with sparse BM25's exact matching. Solves: Better recall by adding learned term expansion.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Tuple
import math

class SPLADEEncoder:
    def __init__(self, vocab_size: int = 30000, expansion_factor: int = 3):
        self.vocab_size = vocab_size
        self.expansion_factor = expansion_factor
        self.term_weights = self._init_weights()
    
    def _init_weights(self) -> Dict[int, float]:
        """Initialize term importance weights."""
        weights = {}
        common_terms = ["the", "is", "are", "a", "an", "to", "of", "in", "on", "for"]
        for i, term in enumerate(common_terms):
            weights[hash(term) % self.vocab_size] = 0.1
        return weights
    
    def encode(self, text: str) -> Dict[int, float]:
        """
        Encode text into sparse vector (term -> importance).
        
        SPLADE expands terms and weights by importance.
        """
        # TODO: implement SPLADE encoding
        # 1. Tokenize text
        # 2. Look up term importance
        # 3. Apply expansion (add related terms)
        # 4. Return sparse representation
        raise NotImplementedError

def compute_sparse_similarity(
    sparse_a: Dict[int, float],
    sparse_b: Dict[int, float]
) -> float:
    """
    Compute similarity between two sparse vectors.
    
    Uses dot product of non-zero entries.
    """
    # TODO: implement
    raise NotImplementedError

def retrieve_with_splade(
    query: str,
    documents: List[str],
    encoder: SPLADEEncoder,
    top_k: int = 5
) -> List[Tuple[int, float]]:
    """
    Retrieve documents using SPLADE embeddings.
    
    Returns: [(doc_index, score), ...]
    """
    # TODO: implement retrieval
    raise NotImplementedError

def compare_bm25_vs_splade(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> Dict:
    """
    Compare BM25 vs SPLADE retrieval results.
    """
    # TODO: implement comparison
    raise NotImplementedError
`,
    testCode: `encoder = SPLADEEncoder(vocab_size=1000, expansion_factor=2)

# Test encoding
text = "machine learning is transforming artificial intelligence"
sparse = encoder.encode(text)
print("Sparse encoding:", len(sparse), "non-zero terms")
print("Sample weights:", dict(list(sparse.items())[:5]))

# Test similarity
sparse_a = {1: 0.5, 2: 0.3, 5: 0.8}
sparse_b = {1: 0.4, 2: 0.5, 3: 0.2}
sim = compute_sparse_similarity(sparse_a, sparse_b)
print("\\nSimilarity:", sim)
assert sim > 0, "Similarity should be positive"

# Test retrieval
documents = [
    "machine learning algorithms process data",
    "deep learning uses neural networks",
    "cooking recipes use ingredients",
    "artificial intelligence and machine learning",
    "web development with JavaScript",
]

results = retrieve_with_splade("machine learning", documents, encoder, top_k=3)
print("\\nTop 3 results:", results)
assert len(results) == 3

# Test comparison
comparison = compare_bm25_vs_splade("machine learning", documents, top_k=3)
print("\\nBM25 vs SPLADE comparison:", comparison)
assert "splade_results" in comparison
assert "bm25_results" in comparison

print("All tests passed!")`,
    hints: [
      "SPLADE encodes text as sparse vector: {token_id: importance_weight}",
      "Term expansion: for each token, add related terms with lower weights",
      "Similarity = sum(a[i] * b[i]) for all non-zero indices",
      "BM25 comparison: use standard BM25 scoring for comparison",
    ],
    solution: `from typing import List, Dict, Tuple
import re
import math

class SPLADEEncoder:
    def __init__(self, vocab_size: int = 30000, expansion_factor: int = 3):
        self.vocab_size = vocab_size
        self.expansion_factor = expansion_factor
        self.term_weights = self._init_weights()
        self.expansion_terms = self._init_expansion()
    
    def _init_weights(self) -> Dict[int, float]:
        weights = {}
        common_terms = ["the", "is", "are", "a", "an", "to", "of", "in", "on", "for"]
        for term in common_terms:
            weights[hash(term) % self.vocab_size] = 0.1
        return weights
    
    def _init_expansion(self) -> Dict[int, List[int]]:
        expansion = {}
        ml_terms = [hash("machine") % self.vocab_size, 
                   hash("learning") % self.vocab_size]
        expansion[hash("ml") % self.vocab_size] = ml_terms
        return expansion
    
    def encode(self, text: str) -> Dict[int, float]:
        tokens = re.findall(r'[a-z]+', text.lower())
        sparse = {}
        
        for token in tokens:
            token_id = hash(token) % self.vocab_size
            
            base_weight = self.term_weights.get(token_id, 1.0)
            sparse[token_id] = sparse.get(token_id, 0) + base_weight
            
            if token_id in self.expansion_terms:
                for exp_term in self.expansion_terms[token_id]:
                    exp_weight = base_weight * 0.5
                    sparse[exp_term] = sparse.get(exp_term, 0) + exp_weight
        
        sparse = {k: math.log(1 + max(0, v)) for k, v in sparse.items()}
        
        return sparse

def compute_sparse_similarity(
    sparse_a: Dict[int, float],
    sparse_b: Dict[int, float]
) -> float:
    similarity = 0.0
    for idx, weight_a in sparse_a.items():
        if idx in sparse_b:
            similarity += weight_a * sparse_b[idx]
    return similarity

def retrieve_with_splade(
    query: str,
    documents: List[str],
    encoder: SPLADEEncoder,
    top_k: int = 5
) -> List[Tuple[int, float]]:
    query_sparse = encoder.encode(query)
    doc_sparses = [encoder.encode(doc) for doc in documents]
    
    scores = []
    for idx, doc_sparse in enumerate(doc_sparses):
        score = compute_sparse_similarity(query_sparse, doc_sparse)
        scores.append((idx, score))
    
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_k]

def compute_bm25_score(
    query: str,
    document: str,
    avg_doc_len: float,
    k1: float = 1.5,
    b: float = 0.75
) -> float:
    doc_len = len(document.split())
    query_terms = query.lower().split()
    doc_terms = document.lower().split()
    doc_freq = {}
    for term in doc_terms:
        doc_freq[term] = doc_freq.get(term, 0) + 1
    
    score = 0.0
    for term in query_terms:
        if term in doc_freq:
            tf = doc_freq[term]
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * doc_len / avg_doc_len)
            score += numerator / denominator
    
    return score

def compare_bm25_vs_splade(
    query: str,
    documents: List[str],
    top_k: int = 5
) -> Dict:
    encoder = SPLADEEncoder()
    splade_results = retrieve_with_splade(query, documents, encoder, top_k)
    
    avg_doc_len = sum(len(d.split()) for d in documents) / len(documents)
    bm25_scores = []
    for idx, doc in enumerate(documents):
        score = compute_bm25_score(query, doc, avg_doc_len)
        bm25_scores.append((idx, score))
    bm25_scores.sort(key=lambda x: x[1], reverse=True)
    bm25_results = bm25_scores[:top_k]
    
    return {
        "splade_results": splade_results,
        "bm25_results": bm25_results,
    }`,
    timeEstimate: { minutes: 50, label: "50-65 min" },
    realWorld: {
      description: "SPLADE (Sparse Lexical and Expansion) from Facebook achieves state-of-the-art on BEIR benchmark. It learns which terms to expand - e.g., 'AI' expands to 'artificial intelligence, machine learning, deep learning'.",
      companies: ["Meta", "Facebook"],
      useCases: ["High-recall Retrieval", "Academic Search", "Enterprise Search"],
    },
    relatedChallenges: ["bm25-from-scratch", "hybrid-search-tuning", "colbert-maxsim"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "semantic-cache-advanced",
    title: "Advanced Semantic Caching",
    description:
      "Build a semantic cache that uses embedding similarity to serve instant responses for repeated or highly similar queries, reducing LLM costs and latency.",
    group: "Phase 11 — Production Ops",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import Dict, List, Optional
import math

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.95):
        # Format: [ {"query": "...", "vector": [...], "response": "..."} ]
        self.cache = []
        self.threshold = similarity_threshold
        
    def get(self, query_vector: List[float]) -> Optional[str]:
        """
        Check if a highly similar query exists in the cache.
        If similarity >= self.threshold, return the cached response.
        Otherwise return None.
        """
        # TODO: Implement semantic cache retrieval
        raise NotImplementedError
        
    def set(self, query_text: str, query_vector: List[float], response: str):
        """
        Store a new query and response in the cache.
        """
        # TODO: Implement cache storage
        raise NotImplementedError

def compute_similarity(v1: List[float], v2: List[float]) -> float:
    # Assuming normalized vectors, return dot product
    return sum(a * b for a, b in zip(v1, v2))
`,
    testCode: `cache = SemanticCache(similarity_threshold=0.90)

# Mock some query embeddings
q1_vec = [1.0, 0.0, 0.0]  # "What is RAG?"
q2_vec = [0.99, 0.14, 0.0] # "Can you explain RAG to me?" (Highly similar)
q3_vec = [0.0, 1.0, 0.0]  # "How do I bake a cake?" (Different)

# Populate cache
cache.set("What is RAG?", q1_vec, "RAG stands for Retrieval-Augmented Generation.")

# Test exact match (or very close)
result1 = cache.get(q2_vec)
print("Query 2 cache hit:", result1)
assert result1 == "RAG stands for Retrieval-Augmented Generation.", "Should hit cache for similar query"

# Test cache miss
result2 = cache.get(q3_vec)
print("Query 3 cache hit:", result2)
assert result2 is None, "Should miss cache for different query"

print("All tests passed!")`,
    hints: [
      "Iterate through all items in self.cache and compute similarity.",
      "Keep track of the highest similarity found.",
      "If the highest similarity is greater than or equal to self.threshold, return that item's response.",
    ],
    solution: `from typing import Dict, List, Optional

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.95):
        self.cache = []
        self.threshold = similarity_threshold
        
    def get(self, query_vector: List[float]) -> Optional[str]:
        if not self.cache:
            return None
            
        best_sim = -1.0
        best_response = None
        
        for item in self.cache:
            sim = compute_similarity(query_vector, item["vector"])
            if sim > best_sim:
                best_sim = sim
                best_response = item["response"]
                
        if best_sim >= self.threshold:
            return best_response
            
        return None
        
    def set(self, query_text: str, query_vector: List[float], response: str):
        self.cache.append({
            "query": query_text,
            "vector": query_vector,
            "response": response
        })

def compute_similarity(v1: List[float], v2: List[float]) -> float:
    return sum(a * b for a, b in zip(v1, v2))`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Semantic caching (like GPTCache) intercepts queries before they hit the expensive retrieval/LLM generation steps. If a user asks 'how do I reset password' and another asks 'how to change password', they both get the same cached answer instantly.",
      companies: ["Zilliz", "Redis", "Cloudflare"],
      useCases: ["Cost Reduction", "Latency Optimization", "FAQ Chatbots"],
    },
    relatedChallenges: ["embedding-cache", "rag-cost-calculator"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "query-router",
    title: "Query Router (Fast vs Slow Path)",
    description:
      "Route queries to different RAG pipelines based on their difficulty. Send simple factual questions to a fast path and complex multi-step reasoning to a slow path.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List, Dict

# Mock pipelines
def fast_path_rag(query: str) -> str:
    return f"[FAST PATH] Direct keyword match for: {query}"

def slow_path_rag(query: str) -> str:
    return f"[SLOW PATH] Deep reasoning & multi-hop retrieval for: {query}"

def direct_answer(query: str) -> str:
    return f"[NO RAG] Generic conversational response to: {query}"

def route_query(query: str) -> str:
    """
    Analyze the query and determine the routing path.
    1. If greeting/chit-chat -> 'direct'
    2. If contains 'compare', 'analyze', 'why', 'how does' -> 'slow'
    3. Default -> 'fast'
    
    Then call the appropriate function.
    """
    # TODO: Implement routing logic
    raise NotImplementedError
`,
    testCode: `res1 = route_query("Hello! How are you today?")
print("Res 1:", res1)
assert "NO RAG" in res1, "Greetings should bypass RAG"

res2 = route_query("What is the capital of France?")
print("Res 2:", res2)
assert "FAST PATH" in res2, "Simple fact questions should use fast path"

res3 = route_query("Can you compare the architecture of Transformer and RNN, and explain why Transformers are faster?")
print("Res 3:", res3)
assert "SLOW PATH" in res3, "Complex analysis should use slow path"

print("All tests passed!")`,
    hints: [
      "Use simple keyword matching (`in query.lower()`) to classify.",
      "Greetings: 'hello', 'hi', 'hey', 'how are you'.",
      "Analysis: 'compare', 'analyze', 'why', 'how does'.",
    ],
    solution: `from typing import List, Dict

def fast_path_rag(query: str) -> str:
    return f"[FAST PATH] Direct keyword match for: {query}"

def slow_path_rag(query: str) -> str:
    return f"[SLOW PATH] Deep reasoning & multi-hop retrieval for: {query}"

def direct_answer(query: str) -> str:
    return f"[NO RAG] Generic conversational response to: {query}"

def route_query(query: str) -> str:
    q_lower = query.lower()
    
    # Check for chit-chat
    chit_chat_words = ["hello", "hi", "hey", "how are you", "good morning"]
    if any(q_lower.startswith(w) or q_lower == w for w in chit_chat_words):
        return direct_answer(query)
        
    # Check for complex reasoning
    complex_words = ["compare", "analyze", "why", "how does", "explain the difference"]
    if any(w in q_lower for w in complex_words):
        return slow_path_rag(query)
        
    # Default to fast path for standard retrieval
    return fast_path_rag(query)`,
    timeEstimate: { minutes: 20, label: "20-30 min" },
    realWorld: {
      description: "In production, not all queries require a $0.05 GPT-4o call + 3 Vector DB searches. Routing 'Hello' to a fast cheap model, and 'Compare our Q3 revenue to Q4' to a deep-research agent saves massive amounts of money and time.",
      companies: ["Anthropic", "Cohere", "LangChain"],
      useCases: ["Cost Optimization", "Adaptive RAG", "Agentic Systems"],
    },
    relatedChallenges: ["tool-use-basics", "route-by-difficulty"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "adaptive-rag-router",
    title: "Adaptive RAG Router",
    description: "Build a query router that dynamically selects the optimal RAG strategy based on query complexity. Why: Not all queries need the same treatment — routing saves cost and latency. Solves: Intelligent query dispatching.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "medium",
    xpReward: 150,
    starterCode: `from typing import Dict, List

QUERY_COMPLEXITY = {
    "simple": {"strategy": "fast-retrieval", "model": "gpt-3.5"},
    "moderate": {"strategy": "standard-rag", "model": "gpt-4o-mini"},
    "complex": {"strategy": "deep-research", "model": "gpt-4o"},
}

def classify_complexity(query: str) -> str:
    """Classify query as simple, moderate, or complex."""
    # TODO: Implement classification logic
    raise NotImplementedError

def route_query(query: str) -> Dict:
    """Route query to appropriate RAG strategy."""
    # TODO: Implement routing
    raise NotImplementedError`,
    testCode: `def test_adaptive_rag_router():
    assert classify_complexity("What is 2+2?") == "simple"
    assert classify_complexity("Compare our Q3 revenue to Q4") == "complex"
    assert route_query("Hello")["strategy"] == "fast-retrieval"
    print("All tests passed!")`,
    hints: ["Use keyword-based classification first", "Consider query length and complexity indicators", "Route based on classification result"],
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "Production RAG systems route queries to optimize cost/latency. Simple factual queries use fast retrieval + cheap models, while complex analytical queries use multi-step reasoning with powerful models.",
      companies: ["Anthropic", "Cohere"],
      useCases: ["Cost Optimization", "Adaptive RAG"],
    },
    relatedChallenges: ["cost-aware-router", "route-by-difficulty"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "agentic-rag-workflows",
    title: "Agentic RAG Workflows",
    description: "Build end-to-end agentic RAG workflows with tool use, planning, and self-correction. Why: Static pipelines can't handle complex multi-step tasks. Solves: Dynamic reasoning with retrieval.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "hard",
    xpReward: 180,
    starterCode: `class AgenticRAGWorkflow:
    def __init__(self, tools: List):
        self.tools = tools
        self.memory = []

    def execute(self, query: str, max_steps: int = 5) -> str:
        """Execute agentic RAG workflow."""
        # TODO: Implement tool selection, planning, execution
        raise NotImplementedError`,
    testCode: `def test_agentic_workflow():
    workflow = AgenticRAGWorkflow(tools=["search", "calculator"])
    result = workflow.execute("What is the population of Paris?", max_steps=3)
    assert len(result) > 0
    print("All tests passed!")`,
    hints: ["Start with single tool use", "Add memory between steps", "Implement self-correction loop"],
    timeEstimate: { minutes: 60, label: "60-90 min" },
    realWorld: {
      description: "Agentic RAG goes beyond simple retrieve-and-generate by using tools, planning multi-step approaches, and self-correcting when retrieval fails.",
      companies: ["LangChain", "LlamaIndex", "CrewAI"],
      useCases: ["Research Agents", "Code Assistants"],
    },
    relatedChallenges: ["tool-use-basics", "react-implementation", "multi-step-reasoning"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "answer-relevancy-score",
    title: "Answer Relevancy Score",
    description: "Calculate how relevant generated answers are to the original query using LLM-as-judge. Why: High retrieval scores don't guarantee relevant answers. Solves: Answer quality measurement.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def answer_relevancy(query: str, answer: str, contexts: List[str]) -> float:
    """Calculate answer relevancy score (0-1)."""
    # TODO: Implement relevancy scoring
    raise NotImplementedError`,
    testCode: `def test_answer_relevancy():
    score = answer_relevancy("What is Paris?", "Paris is the capital of France", ["Paris is a city"])
    assert 0 <= score <= 1
    print("All tests passed!")`,
    hints: ["Use LLM to judge relevance", "Compare answer entities to query entities", "Score based on information overlap"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Answer relevancy measures whether the generated response actually addresses the user's question, not just whether it's grounded in retrieved context.",
      companies: ["Ragas", "DeepEval", "Arize"],
      useCases: ["RAG Evaluation", "Quality Monitoring"],
    },
    relatedChallenges: ["faithfulness-judge", "relevance-judge", "llm-as-judge"],
    relatedPlaybooks: ["rag-evaluation-suite"],
  },
  {
    slug: "bert-vs-sentence-transformers",
    title: "BERT vs Sentence Transformers",
    description: "Compare BERT-based embeddings with sentence-transformers for RAG retrieval quality. Why: Model choice dramatically impacts retrieval accuracy. Solves: Informed embedding model selection.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `def compare_embedding_models(sentences: List[str]) -> Dict:
    """Compare BERT and sentence-transformers embeddings."""
    # TODO: Implement comparison
    raise NotImplementedError`,
    testCode: `def test_embedding_comparison():
    sentences = ["The cat sat on the mat", "A feline rested on a rug"]
    result = compare_embedding_models(sentences)
    assert "bert_similarity" in result
    assert "st_similarity" in result
    print("All tests passed!")`,
    hints: ["Use mean pooling for BERT", "Compare cosine similarities", "Measure retrieval quality differences"],
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Understanding the difference between token-level (BERT) and sentence-level embeddings is crucial for choosing the right model for your RAG pipeline.",
      companies: ["HuggingFace", "SentenceTransformers"],
      useCases: ["Model Selection", "Retrieval Optimization"],
    },
    relatedChallenges: ["embedding-model-selection", "cosine-similarity"],
    relatedPlaybooks: ["embedding-model-selection"],
  },
  {
    slug: "claude-native-citations",
    title: "Claude Native Citations",
    description: "Implement native citation generation using Claude's built-in citation capabilities. Why: Citations improve trust and verifiability. Solves: Source attribution in RAG outputs.",
    group: "Phase 6 — Grounding & Safety",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def generate_citation(query: str, context: str, answer: str) -> Dict:
    """Generate native citations for RAG answer."""
    # TODO: Implement citation generation
    raise NotImplementedError`,
    testCode: `def test_citation_generation():
    result = generate_citation("What is RAG?", "RAG is retrieval-augmented generation", "RAG combines retrieval with generation")
    assert "citations" in result
    print("All tests passed!")`,
    hints: ["Use Claude's citation format", "Map answer claims to context spans", "Include source identifiers"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Claude's native citation feature automatically links answer claims to source text, improving transparency and reducing hallucinations.",
      companies: ["Anthropic"],
      useCases: ["Research", "Legal", "Medical"],
    },
    relatedChallenges: ["citation-range-validator", "prompt-template"],
    relatedPlaybooks: ["rag_troubleshooting_guide"],
  },
  {
    slug: "context-recall-calculator",
    title: "Context Recall Calculator",
    description: "Calculate context recall — what fraction of ground truth answer is supported by retrieved context. Why: Measures retrieval completeness. Solves: Identifying missing information.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def context_recall(retrieved_contexts: List[str], ground_truth_answer: str) -> float:
    """Calculate context recall score (0-1)."""
    # TODO: Implement recall calculation
    raise NotImplementedError`,
    testCode: `def test_context_recall():
    contexts = ["Paris is the capital of France", "Population is 2.2 million"]
    answer = "Paris is France's capital with 2.2M people"
    score = context_recall(contexts, answer)
    assert 0 <= score <= 1
    print("All tests passed!")`,
    hints: ["Break answer into claims", "Check each claim against contexts", "Calculate fraction supported"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Context recall measures whether your retrieval is comprehensive enough to answer the question, separate from generation quality.",
      companies: ["Ragas", "DeepEval"],
      useCases: ["RAG Evaluation", "Retrieval Tuning"],
    },
    relatedChallenges: ["context-recall-judge", "retrieval-metrics"],
    relatedPlaybooks: ["rag-evaluation-suite"],
  },
  {
    slug: "customer-support-bot",
    title: "Customer Support Bot",
    description: "Build a complete customer support RAG bot with FAQ retrieval, ticket creation, and escalation. Why: Most common RAG production use case. Solves: End-to-end support automation.",
    group: "Phase 13 — Capstone Projects",
    difficulty: "hard",
    xpReward: 200,
    starterCode: `class CustomerSupportBot:
    def __init__(self, knowledge_base: str):
        # TODO: Initialize
        pass

    def handle_query(self, query: str) -> Dict:
        """Handle customer support query."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_support_bot():
    bot = CustomerSupportBot(knowledge_base="faq.txt")
    result = bot.handle_query("How do I reset my password?")
    assert "answer" in result
    print("All tests passed!")`,
    hints: ["Start with FAQ retrieval", "Add intent classification", "Implement escalation logic"],
    timeEstimate: { minutes: 90, label: "90-120 min" },
    realWorld: {
      description: "Customer support bots are the #1 RAG use case in production, handling FAQs, troubleshooting, and ticket routing.",
      companies: ["Intercom", "Zendesk", "Ada"],
      useCases: ["Customer Support", "Help Desks"],
    },
    relatedChallenges: ["end-to-end-rag-pipeline", "conversational-rag"],
    relatedPlaybooks: ["capstone-projects"],
  },
  {
    slug: "evaluator-f1-score",
    title: "Evaluator F1 Score",
    description: "Calculate F1 score for RAG retrieval evaluation — balancing precision and recall. Why: F1 gives a single metric for retrieval quality. Solves: Holistic retrieval measurement.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def f1_score(retrieved: set, relevant: set) -> float:
    """Calculate F1 score for retrieval."""
    # TODO: Implement
    raise NotImplementedError`,
    testCode: `def test_f1_score():
    retrieved = {1, 2, 3, 4, 5}
    relevant = {3, 4, 5, 6, 7}
    score = f1_score(retrieved, relevant)
    assert abs(score - 0.5) < 0.01
    print("All tests passed!")`,
    hints: ["Calculate precision first", "Calculate recall second", "F1 = 2 * (precision * recall) / (precision + recall)"],
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "F1 score balances precision (are retrieved docs relevant?) and recall (did we find all relevant docs?) into one metric.",
      companies: ["TREC", "BEIR"],
      useCases: ["Retrieval Evaluation", "Benchmarking"],
    },
    relatedChallenges: ["evaluator-recall-at-k", "evaluator-precision-at-k"],
    relatedPlaybooks: ["rag-evaluation-suite"],
  },
  {
    slug: "gemini-grounding",
    title: "Gemini Grounding",
    description: "Implement Google Gemini's grounding feature to connect LLM outputs to verified sources. Why: Grounding reduces hallucinations with real-time data. Solves: Factual accuracy in generation.",
    group: "Phase 6 — Grounding & Safety",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def grounded_generation(query: str, sources: List[str]) -> Dict:
    """Generate grounded response with Gemini."""
    # TODO: Implement grounding
    raise NotImplementedError`,
    testCode: `def test_grounded_generation():
    result = grounded_generation("What is the weather?", ["Weather API: Sunny"])
    assert "response" in result
    assert "sources" in result
    print("All tests passed!")`,
    hints: ["Use Gemini's grounding API", "Include source citations", "Verify factual claims"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Gemini's grounding connects generation to Google Search results and enterprise data, providing verified citations.",
      companies: ["Google"],
      useCases: ["Search", "Enterprise RAG"],
    },
    relatedChallenges: ["prompt-template", "refusal-policy"],
    relatedPlaybooks: ["rag_troubleshooting_guide"],
  },
  {
    slug: "hyde-retrieval",
    title: "HyDE Retrieval",
    description: "Implement Hypothetical Document Embeddings (HyDE) — generate a fake answer, embed it, and search. Why: Bridges the query-document vocabulary gap. Solves: Retrieval for complex queries.",
    group: "Phase 3 — Query Transforms",
    difficulty: "medium",
    xpReward: 130,
    starterCode: `def hyde_retrieval(query: str, corpus: List[Dict], k: int = 5) -> List[Dict]:
    """HyDE: Generate hypothetical doc, embed, retrieve."""
    # TODO: Implement
    raise NotImplementedError`,
    testCode: `def test_hyde_retrieval():
    corpus = [{"id": 1, "text": "Paris is the capital of France"}]
    results = hyde_retrieval("What is France's capital?", corpus, k=1)
    assert len(results) == 1
    print("All tests passed!")`,
    hints: ["Generate hypothetical answer first", "Embed the hypothetical", "Search corpus with hypothetical embedding"],
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "HyDE improves retrieval by generating a hypothetical answer first, then using that as the query — bridging the vocabulary gap between questions and documents.",
      companies: ["CMU", "Meta"],
      useCases: ["Research", "Complex QA"],
    },
    relatedChallenges: ["hyde-search", "hyde-implementation", "step-back-prompting"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "ivf-pq-index",
    title: "IVF-PQ Index",
    description: "Implement Inverted File with Product Quantization — the most common ANN index for billion-scale vector search. Why: Enables fast search over massive datasets. Solves: Scalable retrieval.",
    group: "Phase 4 — Advanced Retrieval",
    difficulty: "hard",
    xpReward: 180,
    starterCode: `import numpy as np

class IVFPQIndex:
    def __init__(self, nlist: int, m: int, nbits: int):
        # TODO: Initialize IVF-PQ index
        pass

    def add(self, vectors: np.ndarray):
        # TODO: Add vectors to index
        raise NotImplementedError

    def search(self, query: np.ndarray, k: int) -> List[int]:
        # TODO: Search index
        raise NotImplementedError`,
    testCode: `def test_ivf_pq():
    index = IVFPQIndex(nlist=100, m=8, nbits=8)
    vectors = np.random.randn(1000, 128).astype(np.float32)
    index.add(vectors)
    results = index.search(vectors[0], k=5)
    assert len(results) == 5
    print("All tests passed!")`,
    hints: ["Start with IVF clustering", "Add product quantization", "Implement approximate search"],
    timeEstimate: { minutes: 60, label: "60-90 min" },
    realWorld: {
      description: "IVF-PQ is the backbone of Faiss and powers billion-scale vector search at companies like Meta, Spotify, and Pinterest.",
      companies: ["Meta (Faiss)", "Spotify"],
      useCases: ["Large-scale Search", "Recommendation"],
    },
    relatedChallenges: ["ivf-flat-index", "hnsw-index", "product-quantization"],
    relatedPlaybooks: ["rag-performance-benchmarks"],
  },
  {
    slug: "knowledge-graph-extraction",
    title: "Knowledge Graph Extraction",
    description: "Extract entities and relationships from text to build a knowledge graph for GraphRAG. Why: Structured knowledge enables multi-hop reasoning. Solves: Complex relationship queries.",
    group: "Phase 8 — Graph & Knowledge",
    difficulty: "hard",
    xpReward: 160,
    starterCode: `def extract_knowledge_graph(text: str) -> Dict:
    """Extract (entity, relation, entity) triples from text."""
    # TODO: Implement extraction
    raise NotImplementedError`,
    testCode: `def test_kg_extraction():
    text = "Apple was founded by Steve Jobs in Cupertino."
    graph = extract_knowledge_graph(text)
    assert "entities" in graph
    assert "relations" in graph
    print("All tests passed!")`,
    hints: ["Use NER for entities", "Use dependency parsing for relations", "Build adjacency list"],
    timeEstimate: { minutes: 55, label: "55-70 min" },
    realWorld: {
      description: "Knowledge graphs power Microsoft's GraphRAG, enabling summarization and discovery across large document collections.",
      companies: ["Microsoft", "Neo4j"],
      useCases: ["Research", "Due Diligence", "Compliance"],
    },
    relatedChallenges: ["entity-extraction", "graphrag-knowledge-graph"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "kv-cache-optimization",
    title: "KV Cache Optimization",
    description: "Optimize Key-Value cache for RAG generation — reuse cached context across queries. Why: KV cache is the largest memory consumer in generation. Solves: Generation cost and latency.",
    group: "Phase 11 — Production Ops",
    difficulty: "hard",
    xpReward: 160,
    starterCode: `class KVCacheOptimizer:
    def __init__(self):
        self.cache = {}

    def generate_with_cache(self, query: str, shared_context: str) -> str:
        """Generate with KV cache reuse."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_kv_cache():
    optimizer = KVCacheOptimizer()
    result1 = optimizer.generate_with_cache("Q1", "Shared context")
    result2 = optimizer.generate_with_cache("Q2", "Shared context")
    assert len(optimizer.cache) > 0
    print("All tests passed!")`,
    hints: ["Cache shared context KV pairs", "Reuse cache across queries", "Measure memory savings"],
    timeEstimate: { minutes: 50, label: "50-65 min" },
    realWorld: {
      description: "KV cache optimization can reduce generation latency by 40-60% and memory by 50% in RAG systems with shared context.",
      companies: ["vLLM", "TGI", "Together AI"],
      useCases: ["High-throughput RAG", "Cost Reduction"],
    },
    relatedChallenges: ["context-window-optimization", "token-budget-packing"],
    relatedPlaybooks: ["production-rag-blueprint"],
  },
  {
    slug: "llm-as-judge",
    title: "LLM-as-Judge",
    description: "Use an LLM to evaluate RAG output quality across multiple dimensions. Why: Automated evaluation scales better than human review. Solves: Continuous quality monitoring.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 130,
    starterCode: `def llm_judge(query: str, answer: str, contexts: List[str]) -> Dict:
    """Evaluate RAG output using LLM-as-judge."""
    # TODO: Implement multi-dimension evaluation
    raise NotImplementedError`,
    testCode: `def test_llm_judge():
    result = llm_judge("What is RAG?", "RAG is retrieval-augmented generation", ["RAG combines retrieval"])
    assert "relevance" in result
    assert "faithfulness" in result
    print("All tests passed!")`,
    hints: ["Define evaluation dimensions", "Create judge prompt template", "Parse LLM scores"],
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "LLM-as-judge is the most popular RAG evaluation method in production, scoring answers on relevance, faithfulness, completeness, and helpfulness.",
      companies: ["OpenAI", "Anthropic", "Ragas"],
      useCases: ["Quality Monitoring", "A/B Testing"],
    },
    relatedChallenges: ["faithfulness-judge", "relevance-judge", "multi-judge-consensus"],
    relatedPlaybooks: ["rag-evaluation-suite"],
  },
  {
    slug: "multi-hop-qa",
    title: "Multi-Hop QA",
    description: "Build a multi-hop question answering system that chains multiple retrieval steps. Why: Complex questions require information from multiple sources. Solves: Multi-step reasoning.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "hard",
    xpReward: 160,
    starterCode: `def multi_hop_qa(query: str, retriever, max_hops: int = 3) -> str:
    """Answer questions requiring multiple retrieval steps."""
    # TODO: Implement multi-hop reasoning
    raise NotImplementedError`,
    testCode: `def test_multi_hop_qa():
    class MockRetriever:
        def retrieve(self, q): return [{"text": "Answer info"}]
    result = multi_hop_qa("Who founded the company that acquired X?", MockRetriever())
    assert len(result) > 0
    print("All tests passed!")`,
    hints: ["Decompose query into sub-questions", "Retrieve for each sub-question", "Synthesize final answer"],
    timeEstimate: { minutes: 55, label: "55-70 min" },
    realWorld: {
      description: "Multi-hop QA handles questions like 'What company founded by the person who wrote The Lean Startup is based in SF?' — requiring 2+ retrieval steps.",
      companies: ["Meta (HotpotQA)", "DeepMind"],
      useCases: ["Research", "Complex Analysis"],
    },
    relatedChallenges: ["query-decomposition", "react-implementation"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "query-complexity-classifier",
    title: "Query Complexity Classifier",
    description: "Build a classifier that categorizes queries by complexity to route to appropriate processing. Why: Different queries need different resources. Solves: Efficient resource allocation.",
    group: "Phase 3 — Query Transforms",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def classify_query_complexity(query: str) -> str:
    """Classify query as simple, moderate, or complex."""
    # TODO: Implement classification
    raise NotImplementedError`,
    testCode: `def test_query_classifier():
    assert classify_query_complexity("What is 2+2?") == "simple"
    assert classify_query_complexity("Compare Q3 and Q4 revenue trends") == "complex"
    print("All tests passed!")`,
    hints: ["Count question words", "Check for comparison operators", "Measure query length"],
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Query complexity classification enables smart routing — simple queries get fast answers, complex ones get deep analysis.",
      companies: ["Cohere", "LangChain"],
      useCases: ["Query Routing", "Cost Optimization"],
    },
    relatedChallenges: ["route-by-difficulty", "adaptive-rag-router"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "rag-failure-diagnosis",
    title: "RAG Failure Diagnosis",
    description: "Build a diagnostic tool that identifies why a RAG query failed — was it retrieval, context, or generation? Why: Debugging RAG is hard without systematic diagnosis. Solves: Root cause analysis.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 130,
    starterCode: `def diagnose_rag_failure(query: str, answer: str, contexts: List[str]) -> Dict:
    """Diagnose why a RAG query failed."""
    # TODO: Implement failure diagnosis
    raise NotImplementedError`,
    testCode: `def test_failure_diagnosis():
    result = diagnose_rag_failure("What is RAG?", "I don't know", [])
    assert "failure_type" in result
    assert result["failure_type"] == "retrieval"
    print("All tests passed!")`,
    hints: ["Check retrieval quality first", "Then context relevance", "Finally generation faithfulness"],
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "Systematic failure diagnosis identifies whether issues stem from retrieval (wrong docs), context (too much noise), or generation (hallucination).",
      companies: ["Arize", "LangSmith", "Ragas"],
      useCases: ["Debugging", "Quality Improvement"],
    },
    relatedChallenges: ["retrieval-metrics", "rag-usage-dashboard"],
    relatedPlaybooks: ["rag_troubleshooting_guide"],
  },
  {
    slug: "rag-observability",
    title: "RAG Observability",
    description: "Build an observability dashboard for RAG systems tracking latency, cost, quality, and errors. Why: Production RAG needs monitoring. Solves: Visibility into system health.",
    group: "Phase 12 — Evaluation Ops",
    difficulty: "medium",
    xpReward: 140,
    starterCode: `class RAGOberservability:
    def __init__(self):
        self.metrics = {}

    def track_query(self, query: str, latency: float, cost: float, quality: float):
        """Track RAG query metrics."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_observability():
    obs = RAGOberservability()
    obs.track_query("test", 0.5, 0.01, 0.9)
    assert len(obs.metrics) > 0
    print("All tests passed!")`,
    hints: ["Track latency per query", "Accumulate costs", "Calculate quality averages"],
    timeEstimate: { minutes: 50, label: "50-65 min" },
    realWorld: {
      description: "RAG observability tracks retrieval quality, generation quality, latency, cost, and error rates across all queries.",
      companies: ["LangSmith", "Arize Phoenix", "Helicone"],
      useCases: ["Production Monitoring", "Debugging"],
    },
    relatedChallenges: ["audit-logger", "rag-usage-dashboard"],
    relatedPlaybooks: ["rag-observability-guide"],
  },
  {
    slug: "realtime-document-sync",
    title: "Real-time Document Sync",
    description: "Implement real-time synchronization between document changes and vector index updates. Why: Stale indices return outdated information. Solves: Fresh retrieval results.",
    group: "Phase 11 — Production Ops",
    difficulty: "hard",
    xpReward: 160,
    starterCode: `class RealtimeDocSync:
    def __init__(self, index, db):
        # TODO: Initialize
        pass

    def on_document_change(self, doc_id: str, new_content: str):
        """Handle document change and update index."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_realtime_sync():
    sync = RealtimeDocSync(index={}, db={})
    sync.on_document_change("doc1", "New content")
    assert "doc1" in sync.index or "doc1" in sync.db
    print("All tests passed!")`,
    hints: ["Use change data capture", "Update embeddings incrementally", "Handle deletions"],
    timeEstimate: { minutes: 55, label: "55-70 min" },
    realWorld: {
      description: "Real-time sync ensures vector indices reflect the latest document changes, critical for wikis, knowledge bases, and collaborative docs.",
      companies: ["Notion", "Confluence", "SharePoint"],
      useCases: ["Knowledge Management", "Wikis"],
    },
    relatedChallenges: ["live-index-updates", "index-warmup"],
    relatedPlaybooks: ["production-rag-blueprint"],
  },
  {
    slug: "reasoning-rag-implementation",
    title: "Reasoning RAG Implementation",
    description: "Implement reasoning-enhanced RAG that plans before retrieving and synthesizes across multiple sources. Why: Complex tasks require reasoning, not just retrieval. Solves: Analytical RAG.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "hard",
    xpReward: 170,
    starterCode: `class ReasoningRAG:
    def __init__(self, retriever, llm):
        # TODO: Initialize
        pass

    def reason_and_answer(self, query: str) -> str:
        """Plan, retrieve, reason, and answer."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_reasoning_rag():
    rag = ReasoningRAG(retriever=None, llm=None)
    # Mock test
    assert hasattr(rag, "reason_and_answer")
    print("All tests passed!")`,
    hints: ["Plan retrieval steps first", "Execute retrieval", "Synthesize with reasoning"],
    timeEstimate: { minutes: 60, label: "60-80 min" },
    realWorld: {
      description: "Reasoning RAG combines chain-of-thought reasoning with retrieval for complex analytical tasks like financial analysis and legal research.",
      companies: ["Anthropic", "OpenAI"],
      useCases: ["Financial Analysis", "Legal Research"],
    },
    relatedChallenges: ["react-implementation", "multi-step-reasoning"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "reranker-selection",
    title: "Reranker Selection",
    description: "Compare and select the optimal reranker model for your RAG pipeline based on quality, latency, and cost. Why: Different rerankers excel at different tasks. Solves: Optimal reranker choice.",
    group: "Phase 5 — Post-retrieval",
    difficulty: "medium",
    xpReward: 120,
    starterCode: `def evaluate_rerankers(queries: List[str], docs: List[List[str]], labels: List[List[int]]) -> Dict:
    """Compare multiple reranker models."""
    # TODO: Implement comparison
    raise NotImplementedError`,
    testCode: `def test_reranker_selection():
    queries = ["What is RAG?"]
    docs = [["RAG is retrieval", "RAG is generation"]]
    labels = [[1, 0]]
    result = evaluate_rerankers(queries, docs, labels)
    assert "ndcg" in result
    print("All tests passed!")`,
    hints: ["Test multiple rerankers", "Measure NDCG@k", "Compare latency and cost"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Choosing between Cohere Rerank, Cross-Encoder, and ColBERT rerankers depends on your quality requirements, latency budget, and cost constraints.",
      companies: ["Cohere", "HuggingFace", "Voyage AI"],
      useCases: ["Retrieval Optimization", "Quality Improvement"],
    },
    relatedChallenges: ["reranker-score-function", "reranker-cascade"],
    relatedPlaybooks: ["tool-comparison-matrix"],
  },
  {
    slug: "sentence-window-retrieval",
    title: "Sentence Window Retrieval",
    description: "Implement sentence window retrieval — retrieve by sentence but return surrounding context. Why: Sentence-level precision with contextual completeness. Solves: Retrieval granularity mismatch.",
    group: "Phase 5 — Post-retrieval",
    difficulty: "medium",
    xpReward: 130,
    starterCode: `def sentence_window_retrieve(query: str, sentences: List[str], window_size: int = 2) -> List[str]:
    """Retrieve sentences with surrounding context windows."""
    # TODO: Implement
    raise NotImplementedError`,
    testCode: `def test_sentence_window():
    sentences = ["S1", "S2", "S3", "S4", "S5"]
    results = sentence_window_retrieve("query", sentences, window_size=1)
    assert len(results) > 0
    print("All tests passed!")`,
    hints: ["Split document into sentences", "Embed each sentence", "Return window around retrieved sentences"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Sentence window retrieval (LlamaIndex) retrieves at sentence granularity for precision but returns surrounding sentences for context.",
      companies: ["LlamaIndex"],
      useCases: ["Legal Documents", "Technical Manuals"],
    },
    relatedChallenges: ["sentence-window-retriever", "contextual-retrieval"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "sentence-window-retriever",
    title: "Sentence Window Retriever",
    description: "Build a sentence-level retriever that expands retrieved sentences into context windows. Why: Improves context quality without losing retrieval precision. Solves: Context completeness.",
    group: "Phase 5 — Post-retrieval",
    difficulty: "medium",
    xpReward: 130,
    starterCode: `class SentenceWindowRetriever:
    def __init__(self, embed_fn, window_size: int = 2):
        # TODO: Initialize
        pass

    def retrieve(self, query: str, k: int = 5) -> List[Dict]:
        """Retrieve with sentence window expansion."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_sentence_window_retriever():
    retriever = SentenceWindowRetriever(embed_fn=lambda x: [0.1], window_size=1)
    results = retriever.retrieve("query", k=3)
    assert isinstance(results, list)
    print("All tests passed!")`,
    hints: ["Store sentence indices", "Expand to window on retrieval", "Maintain document references"],
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Sentence window retrievers are ideal for documents where individual sentences carry specific meaning but need surrounding context for full understanding.",
      companies: ["LlamaIndex"],
      useCases: ["Legal", "Medical", "Technical"],
    },
    relatedChallenges: ["sentence-window-retrieval", "contextual-retrieval"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
  {
    slug: "user-profile-rag",
    title: "User Profile RAG",
    description: "Build a personalized RAG system that adapts responses based on user profiles, history, and preferences. Why: Personalization improves user satisfaction. Solves: One-size-fits-all answers.",
    group: "Phase 7 — Agentic RAG",
    difficulty: "medium",
    xpReward: 140,
    starterCode: `class UserProfileRAG:
    def __init__(self, retriever, llm):
        # TODO: Initialize
        pass

    def personalized_query(self, user_id: str, query: str) -> str:
        """Generate personalized response based on user profile."""
        # TODO: Implement
        raise NotImplementedError`,
    testCode: `def test_user_profile_rag():
    rag = UserProfileRAG(retriever=None, llm=None)
    assert hasattr(rag, "personalized_query")
    print("All tests passed!")`,
    hints: ["Store user preferences", "Augment query with profile", "Adapt response style"],
    timeEstimate: { minutes: 50, label: "50-65 min" },
    realWorld: {
      description: "User profile RAG personalizes answers based on expertise level, past interactions, and preferences — essential for enterprise knowledge systems.",
      companies: ["Notion AI", "Slack AI"],
      useCases: ["Enterprise Search", "Personal Assistants"],
    },
    relatedChallenges: ["personalized-rag", "conversation-buffer-memory"],
    relatedPlaybooks: ["rag-techniques-encyclopedia"],
  },
];
