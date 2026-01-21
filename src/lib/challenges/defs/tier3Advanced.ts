import type { RawChallenge } from "@/lib/challenges/types";

export const TIER3_ADVANCED_CHALLENGES: RawChallenge[] = [
  // ============================================
  // REAL-TIME RAG CHALLENGES
  // ============================================
  {
    slug: "websocket-streaming-rag",
    title: "WebSocket Streaming RAG",
    description:
      "Implement WebSocket-based streaming for real-time RAG responses. Why: Users expect ChatGPT-like streaming. Solves: Reduces perceived latency by 10x through token-by-token delivery.",
    group: "Phase 7 — Real-time & Advanced Systems",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import AsyncIterator, List, Dict, Any
import asyncio
from dataclasses import dataclass

@dataclass
class StreamEvent:
    """Represents a streaming event."""
    event_type: str  # "retrieval_start", "retrieval_complete", "token", "done", "error"
    data: Any
    
class StreamingRAG:
    """
    WebSocket-style streaming RAG pipeline.
    
    Flow:
    1. Send "retrieval_start" when beginning retrieval
    2. Send "retrieval_complete" with retrieved docs
    3. Stream "token" events for each generated token
    4. Send "done" when complete
    """
    
    def __init__(self, retriever, generator):
        """
        Args:
            retriever: Function that takes query and returns List[str] documents
            generator: Async function that takes (query, context) and yields tokens
        """
        self.retriever = retriever
        self.generator = generator
    
    async def stream_response(self, query: str) -> AsyncIterator[StreamEvent]:
        """
        Stream the full RAG pipeline as events.
        
        Yields:
            StreamEvent objects for each stage of the pipeline
        """
        # TODO: Implement streaming pipeline
        raise NotImplementedError
    
    async def collect_response(self, query: str) -> Dict[str, Any]:
        """
        Collect all streamed events into a final response.
        
        Returns:
            Dict with 'tokens', 'full_response', 'documents', 'latency_ms'
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `import asyncio

# Mock retriever
def mock_retriever(query: str) -> List[str]:
    return ["Doc 1: RAG combines retrieval with generation.", "Doc 2: Streaming reduces latency."]

# Mock generator (async token stream)
async def mock_generator(query: str, context: List[str]) -> AsyncIterator[str]:
    response = "RAG is powerful for real-time applications."
    for word in response.split():
        await asyncio.sleep(0.01)  # Simulate generation delay
        yield word + " "

# Test streaming
async def test_streaming():
    rag = StreamingRAG(mock_retriever, mock_generator)
    
    events = []
    async for event in rag.stream_response("What is RAG?"):
        events.append(event)
    
    event_types = [e.event_type for e in events]
    assert "retrieval_start" in event_types, "Should emit retrieval_start"
    assert "retrieval_complete" in event_types, "Should emit retrieval_complete"
    assert "token" in event_types, "Should emit tokens"
    assert "done" in event_types, "Should emit done"
    assert event_types[0] == "retrieval_start", "First event should be retrieval_start"
    assert event_types[-1] == "done", "Last event should be done"
    
    # Test collect
    result = await rag.collect_response("What is RAG?")
    assert "full_response" in result
    assert "documents" in result
    assert len(result["documents"]) == 2
    
    print("✅ Streaming RAG passed!")

asyncio.run(test_streaming())
`,
    hints: [
      "Use 'yield' to emit StreamEvent objects at each stage",
      "Wrap retriever call and emit retrieval events before/after",
      "Use 'async for' to iterate over generator tokens",
      "Track timing with time.perf_counter() for latency",
    ],
    solution: `from typing import AsyncIterator, List, Dict, Any
import asyncio
import time
from dataclasses import dataclass

@dataclass
class StreamEvent:
    event_type: str
    data: Any

class StreamingRAG:
    def __init__(self, retriever, generator):
        self.retriever = retriever
        self.generator = generator
    
    async def stream_response(self, query: str) -> AsyncIterator[StreamEvent]:
        start = time.perf_counter()
        
        # Retrieval phase
        yield StreamEvent("retrieval_start", {"query": query})
        
        try:
            docs = self.retriever(query)
            yield StreamEvent("retrieval_complete", {"documents": docs, "count": len(docs)})
        except Exception as e:
            yield StreamEvent("error", {"stage": "retrieval", "message": str(e)})
            return
        
        # Generation phase (streaming tokens)
        try:
            async for token in self.generator(query, docs):
                yield StreamEvent("token", {"token": token})
        except Exception as e:
            yield StreamEvent("error", {"stage": "generation", "message": str(e)})
            return
        
        elapsed = (time.perf_counter() - start) * 1000
        yield StreamEvent("done", {"latency_ms": elapsed})
    
    async def collect_response(self, query: str) -> Dict[str, Any]:
        tokens = []
        documents = []
        latency_ms = 0
        
        async for event in self.stream_response(query):
            if event.event_type == "retrieval_complete":
                documents = event.data.get("documents", [])
            elif event.event_type == "token":
                tokens.append(event.data.get("token", ""))
            elif event.event_type == "done":
                latency_ms = event.data.get("latency_ms", 0)
        
        return {
            "tokens": tokens,
            "full_response": "".join(tokens),
            "documents": documents,
            "latency_ms": latency_ms,
        }
`,
    complexity: {
      time: "O(R + G) where R = retrieval, G = generation tokens",
      space: "O(D + T) for documents and tokens",
    },
    realWorld: {
      description: "Streaming is now table stakes for AI products. ChatGPT, Claude, and Gemini all stream tokens to reduce perceived latency from 5s to <500ms first-token time.",
      companies: ["OpenAI", "Anthropic", "Google", "Perplexity"],
      useCases: ["Chat interfaces", "Real-time assistants", "Live search"],
    },
    prerequisites: ["react-implementation"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-techniques-encyclopedia"],
  },
  {
    slug: "live-index-updates",
    title: "Live Index Updates",
    description:
      "Implement real-time index updates without service downtime. Why: Data changes constantly (news, docs, tickets). Solves: Keeps RAG current without rebuilding entire index.",
    group: "Phase 7 — Real-time & Advanced Systems",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import threading
import hashlib

@dataclass
class Document:
    id: str
    content: str
    metadata: Dict = field(default_factory=dict)
    version: int = 1

class LiveIndex:
    """
    Thread-safe index with live updates.
    
    Supports:
    - Add/update documents
    - Delete documents
    - Search during updates
    - Version tracking for dedup
    """
    
    def __init__(self, embed_fn):
        """
        Args:
            embed_fn: Function text -> List[float]
        """
        self.embed_fn = embed_fn
        self._lock = threading.RLock()
        self._documents: Dict[str, Document] = {}
        self._embeddings: Dict[str, List[float]] = {}
        self._update_log: List[Tuple[str, str, int]] = []  # (action, doc_id, version)
    
    def upsert(self, doc: Document) -> bool:
        """
        Insert or update a document.
        
        Returns:
            True if updated (new or newer version), False if skipped (older version)
        """
        # TODO: Implement with version checking
        raise NotImplementedError
    
    def delete(self, doc_id: str) -> bool:
        """
        Delete a document by ID.
        
        Returns:
            True if deleted, False if not found
        """
        # TODO: Implement
        raise NotImplementedError
    
    def search(self, query: str, k: int = 5) -> List[Tuple[Document, float]]:
        """
        Search index (thread-safe, works during updates).
        
        Returns:
            List of (Document, score) tuples
        """
        # TODO: Implement cosine search
        raise NotImplementedError
    
    def get_update_log(self) -> List[Tuple[str, str, int]]:
        """Return chronological log of updates."""
        return list(self._update_log)
`,
    testCode: `import time
import threading

# Simple embedding (hash-based)
def simple_embed(text: str) -> List[float]:
    vec = [0.0] * 16
    for word in text.lower().split():
        idx = hash(word) % 16
        vec[idx] += 1.0
    return vec

index = LiveIndex(simple_embed)

# Test upsert
doc1 = Document("doc1", "RAG is retrieval augmented generation", version=1)
assert index.upsert(doc1) == True, "Should insert new doc"

doc1_v2 = Document("doc1", "RAG combines retrieval with generation", version=2)
assert index.upsert(doc1_v2) == True, "Should update to newer version"

doc1_old = Document("doc1", "Old content", version=1)
assert index.upsert(doc1_old) == False, "Should skip older version"

# Test search
doc2 = Document("doc2", "Vector databases store embeddings")
index.upsert(doc2)

results = index.search("retrieval generation", k=2)
assert len(results) == 2
assert results[0][0].id == "doc1", "doc1 should be most relevant"

# Test delete
assert index.delete("doc2") == True
assert index.delete("nonexistent") == False

results_after = index.search("embeddings", k=2)
assert all(d.id != "doc2" for d, _ in results_after), "doc2 should be gone"

# Test thread safety
errors = []
def concurrent_upsert(i):
    try:
        doc = Document(f"concurrent{i}", f"Content {i}")
        index.upsert(doc)
    except Exception as e:
        errors.append(e)

threads = [threading.Thread(target=concurrent_upsert, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

assert len(errors) == 0, f"Thread errors: {errors}"

print("✅ Live index updates passed!")
`,
    hints: [
      "Use RLock for thread-safe access (reentrant for nested calls)",
      "Check version before update: only update if new_version > current_version",
      "Store embedding alongside document to avoid re-embedding on search",
      "Cosine similarity: dot(a,b) / (norm(a) * norm(b))",
    ],
    solution: `from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import threading
import math

@dataclass
class Document:
    id: str
    content: str
    metadata: Dict = field(default_factory=dict)
    version: int = 1

class LiveIndex:
    def __init__(self, embed_fn):
        self.embed_fn = embed_fn
        self._lock = threading.RLock()
        self._documents: Dict[str, Document] = {}
        self._embeddings: Dict[str, List[float]] = {}
        self._update_log: List[Tuple[str, str, int]] = []
    
    def _cosine(self, a: List[float], b: List[float]) -> float:
        dot = sum(x*y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x*x for x in a))
        norm_b = math.sqrt(sum(x*x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
    
    def upsert(self, doc: Document) -> bool:
        with self._lock:
            existing = self._documents.get(doc.id)
            if existing and existing.version >= doc.version:
                return False
            
            self._documents[doc.id] = doc
            self._embeddings[doc.id] = self.embed_fn(doc.content)
            self._update_log.append(("upsert", doc.id, doc.version))
            return True
    
    def delete(self, doc_id: str) -> bool:
        with self._lock:
            if doc_id not in self._documents:
                return False
            
            del self._documents[doc_id]
            del self._embeddings[doc_id]
            self._update_log.append(("delete", doc_id, -1))
            return True
    
    def search(self, query: str, k: int = 5) -> List[Tuple[Document, float]]:
        with self._lock:
            query_emb = self.embed_fn(query)
            
            scores = []
            for doc_id, doc in self._documents.items():
                emb = self._embeddings[doc_id]
                score = self._cosine(query_emb, emb)
                scores.append((doc, score))
            
            scores.sort(key=lambda x: -x[1])
            return scores[:k]
    
    def get_update_log(self) -> List[Tuple[str, str, int]]:
        with self._lock:
            return list(self._update_log)
`,
    complexity: {
      time: "O(1) upsert/delete, O(N) search",
      space: "O(N * D) for N docs with D-dimensional embeddings",
    },
    realWorld: {
      description: "All production vector databases (Pinecone, Weaviate, Qdrant) support live updates. Real-time indexing is essential for news, support tickets, and collaborative documents.",
      companies: ["Pinecone", "Weaviate", "Qdrant", "Milvus"],
      useCases: ["News RAG", "Support ticketing", "Real-time docs"],
    },
    prerequisites: ["embedding-cache"],
    relatedPlaybooks: ["production-deployment-checklist", "tool-comparison-matrix"],
  },
  
  // ============================================
  // RAG ANALYTICS CHALLENGES
  // ============================================
  {
    slug: "rag-usage-dashboard",
    title: "RAG Usage Dashboard Metrics",
    description:
      "Build metrics collection for a RAG usage dashboard. Why: 'What gets measured gets managed.' Solves: Provides visibility into cost, latency, and quality for optimization.",
    group: "Phase 7 — Analytics & Monitoring",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import time
from collections import defaultdict

@dataclass
class RAGRequest:
    """Represents a single RAG request."""
    request_id: str
    query: str
    timestamp: datetime
    user_id: Optional[str] = None
    
@dataclass
class RAGMetrics:
    """Metrics for a single RAG request."""
    request_id: str
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    docs_retrieved: int
    tokens_in: int
    tokens_out: int
    model: str
    success: bool
    error_message: Optional[str] = None

class RAGAnalytics:
    """
    Collects and aggregates RAG usage metrics.
    """
    
    def __init__(self):
        self._metrics: List[RAGMetrics] = []
        self._requests: Dict[str, RAGRequest] = {}
    
    def start_request(self, request: RAGRequest) -> None:
        """Register new request."""
        self._requests[request.request_id] = request
    
    def record_metrics(self, metrics: RAGMetrics) -> None:
        """Record metrics for a completed request."""
        self._metrics.append(metrics)
    
    def get_summary(self, hours: int = 24) -> Dict:
        """
        Get aggregated metrics for the last N hours.
        
        Returns:
            Dict with:
            - total_requests: int
            - success_rate: float (0-1)
            - avg_latency_ms: float
            - p95_latency_ms: float
            - total_tokens_in: int
            - total_tokens_out: int
            - estimated_cost_usd: float (assume $0.01 per 1K tokens in, $0.03 per 1K tokens out)
            - top_models: List[Tuple[str, int]] (model, count)
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_latency_breakdown(self) -> Dict[str, float]:
        """
        Get average latency breakdown.
        
        Returns:
            Dict with 'retrieval_pct', 'generation_pct' (percentages of total)
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_hourly_stats(self, hours: int = 24) -> List[Dict]:
        """
        Get per-hour statistics.
        
        Returns:
            List of dicts with 'hour', 'requests', 'avg_latency', 'success_rate'
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `from datetime import datetime, timedelta

analytics = RAGAnalytics()

# Simulate requests
now = datetime.now()
for i in range(100):
    req = RAGRequest(f"req{i}", f"Query {i}", now - timedelta(minutes=i))
    analytics.start_request(req)
    
    metrics = RAGMetrics(
        request_id=f"req{i}",
        retrieval_latency_ms=50 + (i % 20),
        generation_latency_ms=150 + (i % 50),
        total_latency_ms=200 + (i % 70),
        docs_retrieved=5,
        tokens_in=100 + i,
        tokens_out=200 + i * 2,
        model="gpt-4" if i % 3 == 0 else "gpt-3.5-turbo",
        success=i % 10 != 0  # 90% success rate
    )
    analytics.record_metrics(metrics)

# Test summary
summary = analytics.get_summary(hours=24)
assert summary["total_requests"] == 100
assert 0.85 <= summary["success_rate"] <= 0.95, f"Got {summary['success_rate']}"
assert "avg_latency_ms" in summary
assert "p95_latency_ms" in summary
assert summary["p95_latency_ms"] >= summary["avg_latency_ms"]
assert summary["estimated_cost_usd"] > 0
assert len(summary["top_models"]) >= 1

# Test latency breakdown
breakdown = analytics.get_latency_breakdown()
assert "retrieval_pct" in breakdown
assert "generation_pct" in breakdown
assert abs(breakdown["retrieval_pct"] + breakdown["generation_pct"] - 100) < 1

# Test hourly stats
hourly = analytics.get_hourly_stats(hours=2)
assert len(hourly) >= 1
assert all("hour" in h and "requests" in h for h in hourly)

print("✅ RAG usage dashboard passed!")
`,
    hints: [
      "Use datetime filtering to get metrics within time window",
      "P95 latency: sort latencies and take index at 0.95 * len",
      "Cost calculation: (tokens_in/1000)*0.01 + (tokens_out/1000)*0.03",
      "Group by hour using datetime.hour for hourly stats",
    ],
    solution: `from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict

@dataclass
class RAGRequest:
    request_id: str
    query: str
    timestamp: datetime
    user_id: Optional[str] = None

@dataclass
class RAGMetrics:
    request_id: str
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    docs_retrieved: int
    tokens_in: int
    tokens_out: int
    model: str
    success: bool
    error_message: Optional[str] = None

class RAGAnalytics:
    def __init__(self):
        self._metrics: List[RAGMetrics] = []
        self._requests: Dict[str, RAGRequest] = {}
    
    def start_request(self, request: RAGRequest) -> None:
        self._requests[request.request_id] = request
    
    def record_metrics(self, metrics: RAGMetrics) -> None:
        self._metrics.append(metrics)
    
    def _filter_recent(self, hours: int) -> List[RAGMetrics]:
        cutoff = datetime.now() - timedelta(hours=hours)
        return [m for m in self._metrics if 
                m.request_id in self._requests and 
                self._requests[m.request_id].timestamp >= cutoff]
    
    def get_summary(self, hours: int = 24) -> Dict:
        recent = self._filter_recent(hours)
        if not recent:
            return {"total_requests": 0, "success_rate": 0, "avg_latency_ms": 0,
                    "p95_latency_ms": 0, "total_tokens_in": 0, "total_tokens_out": 0,
                    "estimated_cost_usd": 0, "top_models": []}
        
        total = len(recent)
        successes = sum(1 for m in recent if m.success)
        latencies = sorted(m.total_latency_ms for m in recent)
        tokens_in = sum(m.tokens_in for m in recent)
        tokens_out = sum(m.tokens_out for m in recent)
        
        model_counts = defaultdict(int)
        for m in recent:
            model_counts[m.model] += 1
        
        p95_idx = int(0.95 * len(latencies))
        cost = (tokens_in / 1000) * 0.01 + (tokens_out / 1000) * 0.03
        
        return {
            "total_requests": total,
            "success_rate": successes / total,
            "avg_latency_ms": sum(latencies) / len(latencies),
            "p95_latency_ms": latencies[min(p95_idx, len(latencies)-1)],
            "total_tokens_in": tokens_in,
            "total_tokens_out": tokens_out,
            "estimated_cost_usd": cost,
            "top_models": sorted(model_counts.items(), key=lambda x: -x[1]),
        }
    
    def get_latency_breakdown(self) -> Dict[str, float]:
        if not self._metrics:
            return {"retrieval_pct": 0, "generation_pct": 0}
        
        total_retrieval = sum(m.retrieval_latency_ms for m in self._metrics)
        total_generation = sum(m.generation_latency_ms for m in self._metrics)
        total = total_retrieval + total_generation
        
        if total == 0:
            return {"retrieval_pct": 50, "generation_pct": 50}
        
        return {
            "retrieval_pct": (total_retrieval / total) * 100,
            "generation_pct": (total_generation / total) * 100,
        }
    
    def get_hourly_stats(self, hours: int = 24) -> List[Dict]:
        recent = self._filter_recent(hours)
        
        hourly = defaultdict(list)
        for m in recent:
            req = self._requests.get(m.request_id)
            if req:
                hour_key = req.timestamp.replace(minute=0, second=0, microsecond=0)
                hourly[hour_key].append(m)
        
        result = []
        for hour, metrics in sorted(hourly.items()):
            result.append({
                "hour": hour.isoformat(),
                "requests": len(metrics),
                "avg_latency": sum(m.total_latency_ms for m in metrics) / len(metrics),
                "success_rate": sum(1 for m in metrics if m.success) / len(metrics),
            })
        
        return result
`,
    complexity: {
      time: "O(N) for aggregations, O(N log N) for percentiles",
      space: "O(N) for storing all metrics",
    },
    realWorld: {
      description: "Every production RAG system needs observability. Datadog, New Relic, and custom dashboards track these metrics to identify issues and optimize costs.",
      companies: ["Datadog", "New Relic", "Langfuse", "Helicone"],
      useCases: ["Cost optimization", "Performance monitoring", "SLA tracking"],
    },
    prerequisites: ["retrieval-metrics"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-troubleshooting-guide"],
  },
  {
    slug: "rag-cost-tracker",
    title: "RAG Cost Tracker",
    description:
      "Build a cost tracking system for RAG API usage. Why: LLM costs can explode unexpectedly. Solves: Provides real-time cost visibility and budget alerts.",
    group: "Phase 7 — Analytics & Monitoring",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict

@dataclass
class PricingTier:
    """Pricing per 1K tokens."""
    model: str
    input_cost: float  # $ per 1K input tokens
    output_cost: float  # $ per 1K output tokens

# Common pricing (approximate)
PRICING = {
    "gpt-4": PricingTier("gpt-4", 0.03, 0.06),
    "gpt-4-turbo": PricingTier("gpt-4-turbo", 0.01, 0.03),
    "gpt-3.5-turbo": PricingTier("gpt-3.5-turbo", 0.0005, 0.0015),
    "claude-3-opus": PricingTier("claude-3-opus", 0.015, 0.075),
    "claude-3-sonnet": PricingTier("claude-3-sonnet", 0.003, 0.015),
}

@dataclass
class UsageRecord:
    timestamp: datetime
    model: str
    input_tokens: int
    output_tokens: int
    user_id: Optional[str] = None
    project_id: Optional[str] = None

class CostTracker:
    """
    Tracks API costs with budget alerts.
    """
    
    def __init__(self, pricing: Dict[str, PricingTier] = PRICING):
        self.pricing = pricing
        self._records: List[UsageRecord] = []
        self._budgets: Dict[str, float] = {}  # project_id -> budget_usd
    
    def record_usage(self, record: UsageRecord) -> float:
        """
        Record usage and return the cost.
        
        Returns:
            Cost in USD for this usage
        """
        # TODO: Implement
        raise NotImplementedError
    
    def set_budget(self, project_id: str, budget_usd: float) -> None:
        """Set budget for a project."""
        self._budgets[project_id] = budget_usd
    
    def get_cost_by_period(self, days: int = 30) -> Dict[str, float]:
        """
        Get total cost broken down by model for the period.
        
        Returns:
            Dict of model -> total_cost_usd
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_project_usage(self, project_id: str, days: int = 30) -> Dict:
        """
        Get usage summary for a project.
        
        Returns:
            Dict with 'total_cost', 'budget', 'budget_remaining', 'budget_pct_used'
        """
        # TODO: Implement
        raise NotImplementedError
    
    def check_budget_alerts(self) -> List[Dict]:
        """
        Check all projects for budget alerts.
        
        Returns:
            List of dicts with 'project_id', 'budget', 'used', 'pct_used', 'alert_level'
            alert_level: 'ok' (<80%), 'warning' (80-99%), 'exceeded' (>=100%)
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `from datetime import datetime, timedelta

tracker = CostTracker()

# Set budgets
tracker.set_budget("project-a", 100.0)
tracker.set_budget("project-b", 50.0)

# Record usage
now = datetime.now()
records = [
    UsageRecord(now, "gpt-4", 1000, 500, project_id="project-a"),
    UsageRecord(now, "gpt-3.5-turbo", 5000, 2000, project_id="project-a"),
    UsageRecord(now, "gpt-4", 2000, 1000, project_id="project-b"),
    UsageRecord(now - timedelta(days=40), "gpt-4", 10000, 5000, project_id="project-b"),  # Old
]

costs = []
for r in records:
    cost = tracker.record_usage(r)
    costs.append(cost)
    assert cost >= 0

# Verify GPT-4 cost calculation: (1000/1000)*0.03 + (500/1000)*0.06 = 0.06
assert abs(costs[0] - 0.06) < 0.001, f"Expected 0.06, got {costs[0]}"

# Test cost by period
cost_by_model = tracker.get_cost_by_period(days=30)
assert "gpt-4" in cost_by_model
assert "gpt-3.5-turbo" in cost_by_model

# Test project usage
usage_a = tracker.get_project_usage("project-a", days=30)
assert "total_cost" in usage_a
assert usage_a["budget"] == 100.0
assert usage_a["budget_remaining"] <= 100.0

# Test budget alerts
alerts = tracker.check_budget_alerts()
assert len(alerts) == 2
for alert in alerts:
    assert alert["alert_level"] in ["ok", "warning", "exceeded"]

print("✅ RAG cost tracker passed!")
`,
    hints: [
      "Cost = (input_tokens/1000)*input_cost + (output_tokens/1000)*output_cost",
      "Filter records by timestamp for period-based queries",
      "Alert levels: ok <80%, warning 80-99%, exceeded >=100%",
    ],
    solution: `from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict

@dataclass
class PricingTier:
    model: str
    input_cost: float
    output_cost: float

PRICING = {
    "gpt-4": PricingTier("gpt-4", 0.03, 0.06),
    "gpt-4-turbo": PricingTier("gpt-4-turbo", 0.01, 0.03),
    "gpt-3.5-turbo": PricingTier("gpt-3.5-turbo", 0.0005, 0.0015),
    "claude-3-opus": PricingTier("claude-3-opus", 0.015, 0.075),
    "claude-3-sonnet": PricingTier("claude-3-sonnet", 0.003, 0.015),
}

@dataclass
class UsageRecord:
    timestamp: datetime
    model: str
    input_tokens: int
    output_tokens: int
    user_id: Optional[str] = None
    project_id: Optional[str] = None

class CostTracker:
    def __init__(self, pricing: Dict[str, PricingTier] = PRICING):
        self.pricing = pricing
        self._records: List[UsageRecord] = []
        self._budgets: Dict[str, float] = {}
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        tier = self.pricing.get(model)
        if not tier:
            return 0.0
        return (input_tokens / 1000) * tier.input_cost + (output_tokens / 1000) * tier.output_cost
    
    def record_usage(self, record: UsageRecord) -> float:
        self._records.append(record)
        return self._calculate_cost(record.model, record.input_tokens, record.output_tokens)
    
    def set_budget(self, project_id: str, budget_usd: float) -> None:
        self._budgets[project_id] = budget_usd
    
    def _filter_by_days(self, days: int) -> List[UsageRecord]:
        cutoff = datetime.now() - timedelta(days=days)
        return [r for r in self._records if r.timestamp >= cutoff]
    
    def get_cost_by_period(self, days: int = 30) -> Dict[str, float]:
        recent = self._filter_by_days(days)
        costs = defaultdict(float)
        for r in recent:
            cost = self._calculate_cost(r.model, r.input_tokens, r.output_tokens)
            costs[r.model] += cost
        return dict(costs)
    
    def get_project_usage(self, project_id: str, days: int = 30) -> Dict:
        recent = self._filter_by_days(days)
        project_records = [r for r in recent if r.project_id == project_id]
        
        total_cost = sum(self._calculate_cost(r.model, r.input_tokens, r.output_tokens) 
                        for r in project_records)
        budget = self._budgets.get(project_id, 0)
        
        return {
            "total_cost": total_cost,
            "budget": budget,
            "budget_remaining": max(0, budget - total_cost),
            "budget_pct_used": (total_cost / budget * 100) if budget > 0 else 0,
        }
    
    def check_budget_alerts(self) -> List[Dict]:
        alerts = []
        for project_id, budget in self._budgets.items():
            usage = self.get_project_usage(project_id)
            pct = usage["budget_pct_used"]
            
            if pct >= 100:
                level = "exceeded"
            elif pct >= 80:
                level = "warning"
            else:
                level = "ok"
            
            alerts.append({
                "project_id": project_id,
                "budget": budget,
                "used": usage["total_cost"],
                "pct_used": pct,
                "alert_level": level,
            })
        
        return alerts
`,
    complexity: {
      time: "O(N) for queries over N records",
      space: "O(N) for storing records",
    },
    realWorld: {
      description: "LLM cost management is critical. Companies use tools like Helicone, Langfuse, and custom dashboards to prevent budget overruns and optimize model selection.",
      companies: ["Helicone", "Langfuse", "OpenMeter", "Portkey"],
      useCases: ["Budget management", "Cost allocation", "Usage optimization"],
    },
    prerequisites: ["rag-usage-dashboard"],
    relatedPlaybooks: ["production-deployment-checklist"],
  },
  
  // ============================================
  // AGENTIC WORKFLOW CHALLENGES
  // ============================================
  {
    slug: "multi-step-reasoning",
    title: "Multi-Step Reasoning Agent",
    description:
      "Build an agent that breaks complex queries into sub-steps and executes them sequentially. Why: Single-shot RAG fails on complex questions. Solves: Enables 'chain of thought' retrieval for multi-hop queries.",
    group: "Phase 7 — Agentic RAG Patterns",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class StepType(Enum):
    RETRIEVE = "retrieve"
    REASON = "reason"
    ANSWER = "answer"

@dataclass
class ReasoningStep:
    step_type: StepType
    query: str
    result: Optional[str] = None
    documents: List[str] = None
    
@dataclass
class ReasoningPlan:
    original_query: str
    steps: List[ReasoningStep]
    final_answer: Optional[str] = None

class MultiStepAgent:
    """
    Agent that decomposes complex queries into sub-steps.
    """
    
    def __init__(self, retriever, reasoner):
        """
        Args:
            retriever: Function(query) -> List[str] documents
            reasoner: Function(query, context) -> str answer
        """
        self.retriever = retriever
        self.reasoner = reasoner
    
    def decompose_query(self, query: str) -> List[str]:
        """
        Break a complex query into simpler sub-queries.
        
        For this challenge, use heuristics:
        - If query contains "and", split into parts
        - If query asks "compare", create queries for each item
        - If query asks "how many", add a counting step
        
        Returns:
            List of sub-queries
        """
        # TODO: Implement
        raise NotImplementedError
    
    def execute_plan(self, query: str) -> ReasoningPlan:
        """
        Execute the full multi-step reasoning pipeline.
        
        1. Decompose query into sub-queries
        2. For each sub-query: retrieve -> reason
        3. Synthesize final answer from all step results
        
        Returns:
            ReasoningPlan with all steps and final answer
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_execution_trace(self, plan: ReasoningPlan) -> str:
        """
        Format the execution trace for debugging.
        
        Returns:
            Multi-line string showing each step
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `# Mock retriever
def mock_retriever(query: str) -> List[str]:
    if "python" in query.lower():
        return ["Python is a programming language created in 1991."]
    elif "javascript" in query.lower():
        return ["JavaScript was created in 1995 for web browsers."]
    elif "compare" in query.lower():
        return ["Python and JavaScript are both popular languages."]
    return ["General information about the topic."]

# Mock reasoner
def mock_reasoner(query: str, context: List[str]) -> str:
    return f"Based on {len(context)} documents: Answer to '{query[:30]}...'"

agent = MultiStepAgent(mock_retriever, mock_reasoner)

# Test decomposition
sub_queries = agent.decompose_query("What is Python and what is JavaScript?")
assert len(sub_queries) >= 2, "Should decompose 'and' queries"

sub_queries2 = agent.decompose_query("Compare Python and JavaScript")
assert len(sub_queries2) >= 2, "Should decompose 'compare' queries"

# Test execution
plan = agent.execute_plan("What is Python and what is JavaScript?")
assert plan.original_query == "What is Python and what is JavaScript?"
assert len(plan.steps) >= 2
assert plan.final_answer is not None

# Verify steps have results
for step in plan.steps:
    if step.step_type == StepType.RETRIEVE:
        assert step.documents is not None
    elif step.step_type == StepType.REASON:
        assert step.result is not None

# Test trace
trace = agent.get_execution_trace(plan)
assert "Step" in trace or "step" in trace

print("✅ Multi-step reasoning agent passed!")
`,
    hints: [
      "Use regex or string matching to detect query patterns",
      "Split on ' and ' for conjunction queries",
      "For 'compare X and Y', extract X and Y as separate queries",
      "Aggregate step results in the final synthesis",
    ],
    solution: `from typing import List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
import re

class StepType(Enum):
    RETRIEVE = "retrieve"
    REASON = "reason"
    ANSWER = "answer"

@dataclass
class ReasoningStep:
    step_type: StepType
    query: str
    result: Optional[str] = None
    documents: List[str] = field(default_factory=list)

@dataclass
class ReasoningPlan:
    original_query: str
    steps: List[ReasoningStep] = field(default_factory=list)
    final_answer: Optional[str] = None

class MultiStepAgent:
    def __init__(self, retriever, reasoner):
        self.retriever = retriever
        self.reasoner = reasoner
    
    def decompose_query(self, query: str) -> List[str]:
        query_lower = query.lower()
        
        # Handle "compare X and Y"
        compare_match = re.search(r'compare\\s+(.+?)\\s+and\\s+(.+?)(?:\\?|$)', query_lower)
        if compare_match:
            item1, item2 = compare_match.groups()
            return [f"What is {item1.strip()}?", f"What is {item2.strip()}?"]
        
        # Handle "X and Y" conjunction
        if ' and ' in query_lower:
            parts = query.split(' and ')
            sub_queries = []
            for part in parts:
                part = part.strip().rstrip('?')
                if not part.lower().startswith(('what', 'how', 'why', 'when', 'where')):
                    part = f"What is {part}?"
                else:
                    part = part + "?"
                sub_queries.append(part)
            return sub_queries
        
        # Default: single query
        return [query]
    
    def execute_plan(self, query: str) -> ReasoningPlan:
        plan = ReasoningPlan(original_query=query)
        sub_queries = self.decompose_query(query)
        
        step_results = []
        for sq in sub_queries:
            # Retrieve step
            docs = self.retriever(sq)
            retrieve_step = ReasoningStep(StepType.RETRIEVE, sq, documents=docs)
            plan.steps.append(retrieve_step)
            
            # Reason step
            answer = self.reasoner(sq, docs)
            reason_step = ReasoningStep(StepType.REASON, sq, result=answer)
            plan.steps.append(reason_step)
            step_results.append(answer)
        
        # Synthesize final answer
        plan.final_answer = " | ".join(step_results)
        
        return plan
    
    def get_execution_trace(self, plan: ReasoningPlan) -> str:
        lines = [f"Query: {plan.original_query}", ""]
        for i, step in enumerate(plan.steps, 1):
            lines.append(f"Step {i}: {step.step_type.value}")
            lines.append(f"  Query: {step.query}")
            if step.documents:
                lines.append(f"  Documents: {len(step.documents)}")
            if step.result:
                lines.append(f"  Result: {step.result[:50]}...")
        lines.append(f"\\nFinal Answer: {plan.final_answer}")
        return "\\n".join(lines)
`,
    complexity: {
      time: "O(S * (R + G)) where S = steps, R = retrieval, G = generation",
      space: "O(S * D) for documents per step",
    },
    realWorld: {
      description: "Multi-hop reasoning is how agents like Devin and research assistants work. They break complex tasks into steps, gathering information iteratively.",
      companies: ["Cognition (Devin)", "Perplexity", "Elicit"],
      useCases: ["Research agents", "Complex QA", "Multi-document synthesis"],
    },
    prerequisites: ["react-implementation", "self-correction-loop"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  {
    slug: "tool-orchestration",
    title: "Tool Orchestration Agent",
    description:
      "Build an agent that orchestrates multiple tools (search, calculator, code execution). Why: Real agents need diverse capabilities. Solves: Enables autonomous problem-solving with multiple tools.",
    group: "Phase 7 — Agentic RAG Patterns",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass
from enum import Enum

@dataclass
class Tool:
    name: str
    description: str
    function: Callable[[str], str]
    
@dataclass
class ToolCall:
    tool_name: str
    input: str
    output: Optional[str] = None
    success: bool = True
    error: Optional[str] = None

class ToolOrchestrator:
    """
    Orchestrates multiple tools based on query intent.
    """
    
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
    
    def register_tool(self, tool: Tool) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
    
    def select_tools(self, query: str) -> List[str]:
        """
        Select which tools to use based on query.
        
        Returns:
            List of tool names to use (in order)
        """
        # TODO: Implement tool selection heuristics
        raise NotImplementedError
    
    def execute(self, query: str) -> Dict[str, Any]:
        """
        Execute the query using selected tools.
        
        Returns:
            Dict with 'tools_used', 'calls', 'final_result'
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_available_tools(self) -> List[Dict[str, str]]:
        """
        List available tools.
        
        Returns:
            List of dicts with 'name', 'description'
        """
        return [{"name": t.name, "description": t.description} 
                for t in self._tools.values()]
`,
    testCode: `# Define mock tools
def search_tool(query: str) -> str:
    if "capital" in query.lower():
        return "Paris is the capital of France."
    return f"Search results for: {query}"

def calculator_tool(expr: str) -> str:
    try:
        result = eval(expr)
        return str(result)
    except:
        return "Error: Invalid expression"

def weather_tool(location: str) -> str:
    return f"Weather in {location}: 72°F, sunny"

# Create orchestrator
orchestrator = ToolOrchestrator()
orchestrator.register_tool(Tool("search", "Search for information", search_tool))
orchestrator.register_tool(Tool("calculator", "Evaluate math expressions", calculator_tool))
orchestrator.register_tool(Tool("weather", "Get weather information", weather_tool))

# Test tool listing
tools = orchestrator.get_available_tools()
assert len(tools) == 3
assert any(t["name"] == "search" for t in tools)

# Test tool selection
selected = orchestrator.select_tools("What is the capital of France?")
assert "search" in selected, "Should select search for fact queries"

selected2 = orchestrator.select_tools("Calculate 25 * 4")
assert "calculator" in selected2, "Should select calculator for math"

selected3 = orchestrator.select_tools("What's the weather in Paris?")
assert "weather" in selected3, "Should select weather for weather queries"

# Test execution
result = orchestrator.execute("What is the capital of France?")
assert "tools_used" in result
assert "calls" in result
assert "final_result" in result
assert len(result["calls"]) >= 1

# Test math execution
result2 = orchestrator.execute("Calculate 25 * 4")
assert "100" in result2["final_result"]

print("✅ Tool orchestration agent passed!")
`,
    hints: [
      "Use keyword matching to select tools (e.g., 'calculate' -> calculator)",
      "Execute tools in order and aggregate results",
      "Handle tool failures gracefully with error capturing",
    ],
    solution: `from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass

@dataclass
class Tool:
    name: str
    description: str
    function: Callable[[str], str]

@dataclass
class ToolCall:
    tool_name: str
    input: str
    output: Optional[str] = None
    success: bool = True
    error: Optional[str] = None

class ToolOrchestrator:
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
    
    def register_tool(self, tool: Tool) -> None:
        self._tools[tool.name] = tool
    
    def select_tools(self, query: str) -> List[str]:
        query_lower = query.lower()
        selected = []
        
        # Weather detection
        if any(w in query_lower for w in ["weather", "temperature", "forecast"]):
            selected.append("weather")
        
        # Math detection
        if any(w in query_lower for w in ["calculate", "compute", "math", "*", "+", "/"]):
            selected.append("calculator")
        
        # Search for fact-based queries
        if any(w in query_lower for w in ["what is", "who is", "capital", "when", "where"]):
            selected.append("search")
        
        # Default to search if nothing matched
        if not selected and "search" in self._tools:
            selected.append("search")
        
        # Filter to available tools
        return [t for t in selected if t in self._tools]
    
    def execute(self, query: str) -> Dict[str, Any]:
        tools_to_use = self.select_tools(query)
        calls = []
        results = []
        
        for tool_name in tools_to_use:
            tool = self._tools.get(tool_name)
            if not tool:
                continue
            
            call = ToolCall(tool_name=tool_name, input=query)
            try:
                output = tool.function(query)
                call.output = output
                call.success = True
                results.append(output)
            except Exception as e:
                call.success = False
                call.error = str(e)
            
            calls.append(call)
        
        final_result = " | ".join(results) if results else "No results"
        
        return {
            "tools_used": tools_to_use,
            "calls": calls,
            "final_result": final_result,
        }
    
    def get_available_tools(self) -> List[Dict[str, str]]:
        return [{"name": t.name, "description": t.description} 
                for t in self._tools.values()]
`,
    complexity: {
      time: "O(T) where T = number of tools selected",
      space: "O(T) for storing tool calls",
    },
    realWorld: {
      description: "Tool orchestration is the foundation of AI agents. AutoGPT, BabyAGI, and modern assistants all use tool registries to extend their capabilities.",
      companies: ["OpenAI (GPT function calling)", "Anthropic (Claude tools)", "LangChain"],
      useCases: ["Autonomous agents", "Workflow automation", "Complex task solving"],
    },
    prerequisites: ["tool-use-basics", "react-implementation"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },
];
