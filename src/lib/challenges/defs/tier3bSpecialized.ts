import type { RawChallenge } from "@/lib/challenges/types";

/**
 * TIER 3B: GRAPH RAG, MULTI-TENANCY, AND SPECIALIZED SYSTEMS
 */
export const TIER3B_SPECIALIZED_CHALLENGES: RawChallenge[] = [
  // ============================================
  // GRAPH RAG
  // ============================================
  {
    slug: "graph-traversal-rag",
    title: "Graph Traversal for Multi-hop RAG",
    description:
      "Implement graph traversal for multi-hop question answering. Why: Standard RAG fails on questions like 'Who founded the company that employs Alice?' Solves: Enables reasoning across document relationships.",
    group: "Phase 7 — Graph RAG & Knowledge Graphs",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, field

@dataclass
class GraphNode:
    id: str
    entity_type: str  # "person", "company", "location"
    name: str
    properties: Dict = field(default_factory=dict)
    
@dataclass
class GraphEdge:
    source: str  # node id
    target: str  # node id
    relation: str  # "works_at", "founded", "located_in"

class KnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[GraphEdge] = []
        self._adjacency: Dict[str, List[Tuple[str, str]]] = {}  # node_id -> [(target_id, relation)]
    
    def add_node(self, node: GraphNode) -> None:
        """Add a node to the graph."""
        self.nodes[node.id] = node
        if node.id not in self._adjacency:
            self._adjacency[node.id] = []
    
    def add_edge(self, edge: GraphEdge) -> None:
        """Add an edge to the graph."""
        self.edges.append(edge)
        if edge.source not in self._adjacency:
            self._adjacency[edge.source] = []
        self._adjacency[edge.source].append((edge.target, edge.relation))
    
    def get_neighbors(self, node_id: str, relation: Optional[str] = None) -> List[str]:
        """
        Get neighbors of a node, optionally filtered by relation type.
        
        Returns list of neighbor node IDs.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def find_path(self, start_id: str, end_id: str, max_hops: int = 3) -> Optional[List[str]]:
        """
        Find shortest path between two nodes using BFS.
        
        Returns list of node IDs in the path, or None if no path exists.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def multi_hop_query(self, start_entity: str, hops: List[str]) -> List[GraphNode]:
        """
        Execute multi-hop traversal.
        
        Example: multi_hop_query("Alice", ["works_at", "located_in"])
        -> Find where Alice works, then where that company is located.
        
        Returns list of final destination nodes.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `# Build test graph
kg = KnowledgeGraph()

# Add nodes
kg.add_node(GraphNode("alice", "person", "Alice"))
kg.add_node(GraphNode("bob", "person", "Bob"))
kg.add_node(GraphNode("techcorp", "company", "TechCorp"))
kg.add_node(GraphNode("sf", "location", "San Francisco"))

# Add edges
kg.add_edge(GraphEdge("alice", "techcorp", "works_at"))
kg.add_edge(GraphEdge("bob", "techcorp", "founded"))
kg.add_edge(GraphEdge("techcorp", "sf", "located_in"))

# Test neighbors
neighbors = kg.get_neighbors("alice")
assert "techcorp" in neighbors

filtered = kg.get_neighbors("alice", relation="works_at")
assert "techcorp" in filtered

# Test path finding
path = kg.find_path("alice", "sf")
assert path is not None
assert path[0] == "alice"
assert path[-1] == "sf"

no_path = kg.find_path("sf", "bob")  # No path from location to person
# May or may not find path depending on edge directions

# Test multi-hop query
# "Where does Alice work?" -> "TechCorp"
# "Where is TechCorp located?" -> "San Francisco"
result = kg.multi_hop_query("alice", ["works_at", "located_in"])
assert any(n.id == "sf" for n in result)

print("✅ Graph traversal RAG passed!")
`,
    hints: [
      "Use BFS with a queue for shortest path",
      "Track visited nodes to avoid cycles",
      "For multi-hop, chain the relation filters",
    ],
    solution: `from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, field
from collections import deque

@dataclass
class GraphNode:
    id: str
    entity_type: str
    name: str
    properties: Dict = field(default_factory=dict)

@dataclass
class GraphEdge:
    source: str
    target: str
    relation: str

class KnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[GraphEdge] = []
        self._adjacency: Dict[str, List[Tuple[str, str]]] = {}
    
    def add_node(self, node: GraphNode) -> None:
        self.nodes[node.id] = node
        if node.id not in self._adjacency:
            self._adjacency[node.id] = []
    
    def add_edge(self, edge: GraphEdge) -> None:
        self.edges.append(edge)
        if edge.source not in self._adjacency:
            self._adjacency[edge.source] = []
        self._adjacency[edge.source].append((edge.target, edge.relation))
    
    def get_neighbors(self, node_id: str, relation: Optional[str] = None) -> List[str]:
        if node_id not in self._adjacency:
            return []
        
        neighbors = []
        for target, rel in self._adjacency[node_id]:
            if relation is None or rel == relation:
                neighbors.append(target)
        return neighbors
    
    def find_path(self, start_id: str, end_id: str, max_hops: int = 3) -> Optional[List[str]]:
        if start_id not in self.nodes or end_id not in self.nodes:
            return None
        
        queue = deque([(start_id, [start_id])])
        visited = {start_id}
        
        while queue:
            current, path = queue.popleft()
            
            if current == end_id:
                return path
            
            if len(path) > max_hops:
                continue
            
            for neighbor in self.get_neighbors(current):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        
        return None
    
    def multi_hop_query(self, start_entity: str, hops: List[str]) -> List[GraphNode]:
        # Find starting node by name
        current_nodes = [n.id for n in self.nodes.values() if n.name.lower() == start_entity.lower() or n.id == start_entity]
        
        for relation in hops:
            next_nodes = []
            for node_id in current_nodes:
                neighbors = self.get_neighbors(node_id, relation)
                next_nodes.extend(neighbors)
            current_nodes = list(set(next_nodes))
        
        return [self.nodes[nid] for nid in current_nodes if nid in self.nodes]
`,
    complexity: {
      time: "O(V + E) for BFS path finding",
      space: "O(V) for visited set",
    },
    realWorld: {
      description: "Microsoft's GraphRAG and Neo4j-based RAG systems use knowledge graphs for complex reasoning that requires multiple document hops.",
      companies: ["Microsoft", "Neo4j", "TigerGraph"],
      useCases: ["Legal discovery", "Scientific literature", "Enterprise knowledge"],
    },
    prerequisites: ["graphrag-knowledge-graph"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  
  // ============================================
  // MULTI-TENANCY
  // ============================================
  {
    slug: "multi-tenant-rag",
    title: "Multi-Tenant RAG Architecture",
    description:
      "Build a multi-tenant RAG system with complete data isolation. Why: SaaS products serve multiple customers. Solves: Ensures tenant A never sees tenant B's data.",
    group: "Phase 7 — Production Multi-tenancy",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import hashlib

@dataclass
class TenantConfig:
    tenant_id: str
    name: str
    embedding_model: str = "default"
    max_docs: int = 10000
    features: List[str] = field(default_factory=list)

@dataclass
class TenantDocument:
    doc_id: str
    tenant_id: str
    content: str
    metadata: Dict = field(default_factory=dict)

class MultiTenantRAG:
    """
    Multi-tenant RAG with strict data isolation.
    """
    
    def __init__(self):
        self._tenants: Dict[str, TenantConfig] = {}
        self._documents: Dict[str, List[TenantDocument]] = {}  # tenant_id -> docs
        self._embeddings: Dict[str, Dict[str, List[float]]] = {}  # tenant_id -> {doc_id -> embedding}
    
    def create_tenant(self, config: TenantConfig) -> bool:
        """
        Create a new tenant.
        
        Returns True if created, False if already exists.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def add_document(self, doc: TenantDocument) -> bool:
        """
        Add document for a tenant.
        
        Validates tenant exists and respects max_docs limit.
        Returns True if added, False otherwise.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def search(self, tenant_id: str, query: str, k: int = 5) -> List[Tuple[TenantDocument, float]]:
        """
        Search within a tenant's documents only.
        
        CRITICAL: Must never return documents from other tenants.
        
        Returns list of (document, score) tuples.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_tenant_stats(self, tenant_id: str) -> Dict:
        """
        Get statistics for a tenant.
        
        Returns doc_count, storage_usage, etc.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def delete_tenant(self, tenant_id: str) -> bool:
        """
        Delete a tenant and all their data.
        
        Returns True if deleted, False if not found.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `mtrag = MultiTenantRAG()

# Create tenants
config_a = TenantConfig("tenant_a", "Company A")
config_b = TenantConfig("tenant_b", "Company B", max_docs=5)

assert mtrag.create_tenant(config_a) == True
assert mtrag.create_tenant(config_b) == True
assert mtrag.create_tenant(config_a) == False  # Already exists

# Add documents
doc_a1 = TenantDocument("doc1", "tenant_a", "Company A's secret policy")
doc_b1 = TenantDocument("doc1", "tenant_b", "Company B's private data")

assert mtrag.add_document(doc_a1) == True
assert mtrag.add_document(doc_b1) == True

# Search isolation test
results_a = mtrag.search("tenant_a", "policy")
assert all(doc.tenant_id == "tenant_a" for doc, _ in results_a), "CRITICAL: Cross-tenant leak!"

results_b = mtrag.search("tenant_b", "policy")
assert all(doc.tenant_id == "tenant_b" for doc, _ in results_b), "CRITICAL: Cross-tenant leak!"

# Verify A cannot see B's data
results_a2 = mtrag.search("tenant_a", "private data")
assert not any("Company B" in doc.content for doc, _ in results_a2), "CRITICAL: Tenant B data leaked!"

# Test stats
stats_a = mtrag.get_tenant_stats("tenant_a")
assert stats_a["doc_count"] == 1

# Test deletion
assert mtrag.delete_tenant("tenant_a") == True
assert mtrag.delete_tenant("tenant_a") == False  # Already deleted

print("✅ Multi-tenant RAG passed!")
`,
    hints: [
      "Use tenant_id as partition key for all data structures",
      "Always validate tenant_id before any operation",
      "Search should ONLY look in tenant's document list",
    ],
    solution: `from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import hashlib
import math

@dataclass
class TenantConfig:
    tenant_id: str
    name: str
    embedding_model: str = "default"
    max_docs: int = 10000
    features: List[str] = field(default_factory=list)

@dataclass
class TenantDocument:
    doc_id: str
    tenant_id: str
    content: str
    metadata: Dict = field(default_factory=dict)

class MultiTenantRAG:
    def __init__(self):
        self._tenants: Dict[str, TenantConfig] = {}
        self._documents: Dict[str, List[TenantDocument]] = {}
        self._embeddings: Dict[str, Dict[str, List[float]]] = {}
    
    def _embed(self, text: str) -> List[float]:
        # Simple hash-based embedding for demo
        vec = [0.0] * 16
        for word in text.lower().split():
            idx = hash(word) % 16
            vec[idx] += 1.0
        return vec
    
    def _cosine(self, a: List[float], b: List[float]) -> float:
        dot = sum(x*y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x*x for x in a))
        norm_b = math.sqrt(sum(x*x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
    
    def create_tenant(self, config: TenantConfig) -> bool:
        if config.tenant_id in self._tenants:
            return False
        self._tenants[config.tenant_id] = config
        self._documents[config.tenant_id] = []
        self._embeddings[config.tenant_id] = {}
        return True
    
    def add_document(self, doc: TenantDocument) -> bool:
        if doc.tenant_id not in self._tenants:
            return False
        
        tenant = self._tenants[doc.tenant_id]
        if len(self._documents[doc.tenant_id]) >= tenant.max_docs:
            return False
        
        self._documents[doc.tenant_id].append(doc)
        self._embeddings[doc.tenant_id][doc.doc_id] = self._embed(doc.content)
        return True
    
    def search(self, tenant_id: str, query: str, k: int = 5) -> List[Tuple[TenantDocument, float]]:
        if tenant_id not in self._tenants:
            return []
        
        query_emb = self._embed(query)
        docs = self._documents[tenant_id]
        embeddings = self._embeddings[tenant_id]
        
        scores = []
        for doc in docs:
            emb = embeddings.get(doc.doc_id, [0.0] * 16)
            score = self._cosine(query_emb, emb)
            scores.append((doc, score))
        
        scores.sort(key=lambda x: -x[1])
        return scores[:k]
    
    def get_tenant_stats(self, tenant_id: str) -> Dict:
        if tenant_id not in self._tenants:
            return {}
        
        docs = self._documents.get(tenant_id, [])
        total_chars = sum(len(d.content) for d in docs)
        
        return {
            "tenant_id": tenant_id,
            "doc_count": len(docs),
            "total_chars": total_chars,
            "max_docs": self._tenants[tenant_id].max_docs,
        }
    
    def delete_tenant(self, tenant_id: str) -> bool:
        if tenant_id not in self._tenants:
            return False
        
        del self._tenants[tenant_id]
        del self._documents[tenant_id]
        del self._embeddings[tenant_id]
        return True
`,
    complexity: {
      time: "O(N) for search within tenant's docs",
      space: "O(T * D) for T tenants with D docs each",
    },
    realWorld: {
      description: "Every SaaS RAG product (Glean, Moveworks, Notion AI) implements multi-tenancy. Data isolation is a P0 security requirement.",
      companies: ["Glean", "Moveworks", "Notion", "Salesforce"],
      useCases: ["SaaS platforms", "Enterprise search", "Customer portals"],
    },
    prerequisites: ["metadata-filtering", "document-access-control"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-troubleshooting-guide"],
  },
  
  // ============================================
  // HYBRID SEARCH OPTIMIZATION
  // ============================================
  {
    slug: "hybrid-search-tuning",
    title: "Hybrid Search Weight Optimization",
    description:
      "Tune the balance between BM25 and dense retrieval for optimal results. Why: The optimal balance varies by domain. Solves: Maximizes retrieval quality for your specific use case.",
    group: "Phase 7 — Retrieval Optimization",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Tuple
import math

def bm25_score(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Simple BM25 scoring (provided)."""
    from collections import Counter
    q_counts = Counter(query_tokens)
    d_counts = Counter(doc_tokens)
    
    score = 0.0
    for term, qf in q_counts.items():
        if term in d_counts:
            tf = d_counts[term]
            score += tf / (tf + 1.5)  # Simplified BM25
    return score

def dense_score(query_emb: List[float], doc_emb: List[float]) -> float:
    """Cosine similarity (provided)."""
    dot = sum(a*b for a, b in zip(query_emb, doc_emb))
    norm_q = math.sqrt(sum(a*a for a in query_emb))
    norm_d = math.sqrt(sum(b*b for b in doc_emb))
    if norm_q == 0 or norm_d == 0:
        return 0.0
    return dot / (norm_q * norm_d)

class HybridSearchTuner:
    """
    Tune hybrid search weights using evaluation data.
    """
    
    def __init__(self):
        self.bm25_weight = 0.5
        self.dense_weight = 0.5
    
    def hybrid_score(self, bm25: float, dense: float) -> float:
        """
        Compute weighted hybrid score.
        """
        return self.bm25_weight * bm25 + self.dense_weight * dense
    
    def evaluate(self, queries: List[Dict], docs: List[Dict], 
                 qrels: Dict[str, List[str]], k: int = 10) -> Dict[str, float]:
        """
        Evaluate retrieval quality with current weights.
        
        Args:
            queries: List of {id, text, tokens, embedding}
            docs: List of {id, tokens, embedding}
            qrels: Dict of query_id -> list of relevant doc_ids
        
        Returns:
            Dict with ndcg, recall, mrr metrics
        """
        # TODO: Implement
        raise NotImplementedError
    
    def grid_search(self, queries: List[Dict], docs: List[Dict],
                    qrels: Dict[str, List[str]], 
                    weight_steps: int = 11) -> Tuple[float, float, Dict]:
        """
        Find optimal weights via grid search.
        
        Try weights from 0 to 1 in equal steps.
        
        Returns:
            (best_bm25_weight, best_dense_weight, best_metrics)
        """
        # TODO: Implement
        raise NotImplementedError
    
    def bayesian_optimize(self, queries: List[Dict], docs: List[Dict],
                          qrels: Dict[str, List[str]], n_trials: int = 20) -> Tuple[float, float]:
        """
        Find optimal weights using simple Bayesian optimization.
        
        Simpler approach: random search with top performers.
        """
        # TODO: Implement (can use random search as approximation)
        raise NotImplementedError
`,
    testCode: `import random

# Create test data
queries = [
    {"id": "q1", "text": "python programming", "tokens": ["python", "programming"], "embedding": [1.0, 0.5, 0.2]},
    {"id": "q2", "text": "machine learning", "tokens": ["machine", "learning"], "embedding": [0.3, 0.9, 0.4]},
]

docs = [
    {"id": "d1", "tokens": ["python", "programming", "tutorial"], "embedding": [0.9, 0.6, 0.1]},
    {"id": "d2", "tokens": ["machine", "learning", "basics"], "embedding": [0.2, 0.95, 0.5]},
    {"id": "d3", "tokens": ["java", "programming"], "embedding": [0.5, 0.3, 0.1]},
]

qrels = {
    "q1": ["d1"],  # Python query -> Python doc is relevant
    "q2": ["d2"],  # ML query -> ML doc is relevant
}

tuner = HybridSearchTuner()

# Test evaluation
metrics = tuner.evaluate(queries, docs, qrels, k=3)
assert "ndcg" in metrics or "recall" in metrics or "mrr" in metrics

# Test grid search
best_bm25, best_dense, best_metrics = tuner.grid_search(queries, docs, qrels, weight_steps=5)
assert 0 <= best_bm25 <= 1
assert 0 <= best_dense <= 1
assert abs(best_bm25 + best_dense - 1.0) < 0.01  # Should sum to 1

print("✅ Hybrid search tuning passed!")
`,
    hints: [
      "For evaluation, rank all docs by hybrid score and compute metrics",
      "Grid search: iterate bm25_weight from 0 to 1, dense = 1 - bm25",
      "Keep track of best performing weights",
    ],
    solution: `from typing import Dict, List, Tuple
import math
import random

def bm25_score(query_tokens: List[str], doc_tokens: List[str]) -> float:
    from collections import Counter
    q_counts = Counter(query_tokens)
    d_counts = Counter(doc_tokens)
    score = 0.0
    for term, qf in q_counts.items():
        if term in d_counts:
            tf = d_counts[term]
            score += tf / (tf + 1.5)
    return score

def dense_score(query_emb: List[float], doc_emb: List[float]) -> float:
    dot = sum(a*b for a, b in zip(query_emb, doc_emb))
    norm_q = math.sqrt(sum(a*a for a in query_emb))
    norm_d = math.sqrt(sum(b*b for b in doc_emb))
    if norm_q == 0 or norm_d == 0:
        return 0.0
    return dot / (norm_q * norm_d)

class HybridSearchTuner:
    def __init__(self):
        self.bm25_weight = 0.5
        self.dense_weight = 0.5
    
    def hybrid_score(self, bm25: float, dense: float) -> float:
        return self.bm25_weight * bm25 + self.dense_weight * dense
    
    def _rank_docs(self, query: Dict, docs: List[Dict]) -> List[str]:
        scores = []
        for doc in docs:
            bm25 = bm25_score(query["tokens"], doc["tokens"])
            dense = dense_score(query["embedding"], doc["embedding"])
            hybrid = self.hybrid_score(bm25, dense)
            scores.append((doc["id"], hybrid))
        scores.sort(key=lambda x: -x[1])
        return [d[0] for d in scores]
    
    def evaluate(self, queries: List[Dict], docs: List[Dict], 
                 qrels: Dict[str, List[str]], k: int = 10) -> Dict[str, float]:
        total_recall = 0.0
        total_mrr = 0.0
        
        for query in queries:
            ranked = self._rank_docs(query, docs)[:k]
            relevant = set(qrels.get(query["id"], []))
            
            # Recall@k
            found = len(set(ranked) & relevant)
            recall = found / len(relevant) if relevant else 0.0
            total_recall += recall
            
            # MRR
            for i, doc_id in enumerate(ranked, 1):
                if doc_id in relevant:
                    total_mrr += 1.0 / i
                    break
        
        n = len(queries)
        return {
            "recall": total_recall / n if n else 0,
            "mrr": total_mrr / n if n else 0,
        }
    
    def grid_search(self, queries: List[Dict], docs: List[Dict],
                    qrels: Dict[str, List[str]], 
                    weight_steps: int = 11) -> Tuple[float, float, Dict]:
        best_score = -1
        best_bm25 = 0.5
        best_dense = 0.5
        best_metrics = {}
        
        for i in range(weight_steps):
            bm25_w = i / (weight_steps - 1)
            dense_w = 1.0 - bm25_w
            
            self.bm25_weight = bm25_w
            self.dense_weight = dense_w
            
            metrics = self.evaluate(queries, docs, qrels)
            score = metrics.get("mrr", 0) + metrics.get("recall", 0)
            
            if score > best_score:
                best_score = score
                best_bm25 = bm25_w
                best_dense = dense_w
                best_metrics = metrics
        
        self.bm25_weight = best_bm25
        self.dense_weight = best_dense
        return (best_bm25, best_dense, best_metrics)
    
    def bayesian_optimize(self, queries: List[Dict], docs: List[Dict],
                          qrels: Dict[str, List[str]], n_trials: int = 20) -> Tuple[float, float]:
        best_score = -1
        best_bm25 = 0.5
        
        for _ in range(n_trials):
            bm25_w = random.random()
            dense_w = 1.0 - bm25_w
            
            self.bm25_weight = bm25_w
            self.dense_weight = dense_w
            
            metrics = self.evaluate(queries, docs, qrels)
            score = metrics.get("mrr", 0) + metrics.get("recall", 0)
            
            if score > best_score:
                best_score = score
                best_bm25 = bm25_w
        
        return (best_bm25, 1.0 - best_bm25)
`,
    complexity: {
      time: "O(W * Q * D) for W weight trials, Q queries, D docs",
      space: "O(D) for storing scores",
    },
    realWorld: {
      description: "Pinecone, Weaviate, and Elasticsearch all provide hybrid search. The optimal alpha (weight) differs significantly by domain and query type.",
      companies: ["Pinecone", "Weaviate", "Elasticsearch"],
      useCases: ["Search optimization", "Domain tuning", "A/B testing"],
    },
    prerequisites: ["rrf-fusion", "bm25-from-scratch"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
];
