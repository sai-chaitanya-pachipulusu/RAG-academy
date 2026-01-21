import type { RawChallenge } from "@/lib/challenges/types";

export const BENCHMARKING_CHALLENGES: RawChallenge[] = [
  {
    slug: "beir-evaluation-setup",
    title: "BEIR Benchmark Setup",
    description:
      "Set up the BEIR (Benchmarking IR) framework to evaluate your retrieval system across standardized datasets. Why: BEIR is the industry standard for measuring retrieval quality. Solves: 'Is my retriever actually good?'",
    group: "Phase 6 — Benchmarking & Evaluation",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class BEIRDataset:
    """Represents a BEIR-format dataset."""
    name: str
    queries: Dict[str, str]        # query_id -> query_text
    corpus: Dict[str, str]         # doc_id -> doc_text
    qrels: Dict[str, Dict[str, int]]  # query_id -> {doc_id: relevance}

def load_beir_dataset(name: str) -> BEIRDataset:
    """
    Load a BEIR dataset by name.
    
    For this exercise, return a mock dataset representing 
    a simplified version of the structure.
    
    Supported names: "scifact", "fiqa", "nfcorpus"
    
    Each should have:
    - At least 5 queries
    - At least 10 corpus documents
    - Relevance judgments linking queries to relevant docs
    """
    # TODO: Implement with mock data
    raise NotImplementedError

def evaluate_retriever(
    dataset: BEIRDataset,
    retrieve_fn,  # Function: (query: str, k: int) -> List[str]
    k: int = 10
) -> Dict[str, float]:
    """
    Evaluate a retriever on a BEIR dataset.
    
    Returns:
        Dict with metrics: {'ndcg@10', 'recall@10', 'precision@10', 'mrr'}
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test loading datasets
scifact = load_beir_dataset("scifact")
assert len(scifact.queries) >= 5, "Should have at least 5 queries"
assert len(scifact.corpus) >= 10, "Should have at least 10 docs"
assert len(scifact.qrels) >= 1, "Should have relevance judgments"

# Verify qrels structure
for qid, doc_rels in scifact.qrels.items():
    assert qid in scifact.queries, "qrel query_id must exist in queries"
    for did, rel in doc_rels.items():
        assert did in scifact.corpus, "qrel doc_id must exist in corpus"
        assert isinstance(rel, int), "relevance must be an integer"

# Test evaluation with a mock retriever
def mock_retriever(query: str, k: int) -> List[str]:
    """Returns first k document IDs (not a good retriever!)"""
    return list(scifact.corpus.keys())[:k]

results = evaluate_retriever(scifact, mock_retriever, k=10)
assert "ndcg@10" in results, "Should compute nDCG"
assert "recall@10" in results, "Should compute Recall"
assert "precision@10" in results, "Should compute Precision"
assert "mrr" in results, "Should compute MRR"

print("✅ BEIR setup passed!")
`,
    hints: [
      "Create mock data that mimics real BEIR datasets (scientific, financial, medical)",
      "For evaluation, iterate through each query and compute metrics",
      "Use the metric functions from evaluator challenges (recall_at_k, ndcg, etc.)",
      "nDCG is the primary metric reported in BEIR leaderboards",
    ],
    solution: `from typing import Dict, List, Tuple
from dataclasses import dataclass
import math

@dataclass
class BEIRDataset:
    name: str
    queries: Dict[str, str]
    corpus: Dict[str, str]
    qrels: Dict[str, Dict[str, int]]

def load_beir_dataset(name: str) -> BEIRDataset:
    """Load mock BEIR dataset."""
    if name == "scifact":
        return BEIRDataset(
            name="scifact",
            queries={
                "q1": "Does vitamin D prevent COVID-19?",
                "q2": "Is coffee good for heart health?",
                "q3": "Can exercise reduce cancer risk?",
                "q4": "Does smoking cause lung cancer?",
                "q5": "Is aspirin effective for headaches?",
            },
            corpus={
                "d1": "Vitamin D supplementation has shown no significant effect on COVID-19 outcomes.",
                "d2": "Coffee consumption is associated with reduced cardiovascular risk.",
                "d3": "Regular physical activity reduces colorectal cancer risk by 25%.",
                "d4": "Smoking is the leading cause of lung cancer worldwide.",
                "d5": "Aspirin inhibits prostaglandin synthesis, reducing pain.",
                "d6": "Vitamin D is essential for bone health.",
                "d7": "Caffeine can increase blood pressure temporarily.",
                "d8": "Exercise improves cardiovascular function.",
                "d9": "Passive smoking also increases lung cancer risk.",
                "d10": "Ibuprofen is an alternative to aspirin for pain relief.",
            },
            qrels={
                "q1": {"d1": 2, "d6": 1},
                "q2": {"d2": 2, "d7": 1},
                "q3": {"d3": 2, "d8": 1},
                "q4": {"d4": 2, "d9": 2},
                "q5": {"d5": 2, "d10": 1},
            }
        )
    elif name == "fiqa":
        return BEIRDataset(
            name="fiqa",
            queries={f"q{i}": f"Financial query {i}" for i in range(1, 6)},
            corpus={f"d{i}": f"Financial document {i}" for i in range(1, 11)},
            qrels={"q1": {"d1": 1}, "q2": {"d2": 1, "d3": 1}},
        )
    else:  # nfcorpus
        return BEIRDataset(
            name="nfcorpus",
            queries={f"q{i}": f"Medical query {i}" for i in range(1, 6)},
            corpus={f"d{i}": f"Medical document {i}" for i in range(1, 11)},
            qrels={"q1": {"d1": 2}, "q2": {"d2": 1}},
        )

def _ndcg_at_k(retrieved: List[str], relevance: Dict[str, int], k: int) -> float:
    def dcg(scores, k):
        return sum(rel / math.log2(i + 2) for i, rel in enumerate(scores[:k]))
    
    actual = [relevance.get(d, 0) for d in retrieved[:k]]
    ideal = sorted(relevance.values(), reverse=True)[:k]
    
    idcg = dcg(ideal, k)
    return dcg(actual, k) / idcg if idcg > 0 else 0.0

def _recall_at_k(retrieved: List[str], relevant: set, k: int) -> float:
    if not relevant:
        return 0.0
    return len(set(retrieved[:k]) & relevant) / len(relevant)

def _precision_at_k(retrieved: List[str], relevant: set, k: int) -> float:
    top_k = retrieved[:k]
    if not top_k:
        return 0.0
    return len(set(top_k) & relevant) / len(top_k)

def _mrr(retrieved: List[str], relevant: set) -> float:
    for i, doc in enumerate(retrieved, 1):
        if doc in relevant:
            return 1.0 / i
    return 0.0

def evaluate_retriever(dataset: BEIRDataset, retrieve_fn, k: int = 10) -> Dict[str, float]:
    ndcg_scores, recall_scores, precision_scores, mrr_scores = [], [], [], []
    
    for qid, query in dataset.queries.items():
        retrieved = retrieve_fn(query, k)
        qrel = dataset.qrels.get(qid, {})
        relevant = {d for d, r in qrel.items() if r > 0}
        
        ndcg_scores.append(_ndcg_at_k(retrieved, qrel, k))
        recall_scores.append(_recall_at_k(retrieved, relevant, k))
        precision_scores.append(_precision_at_k(retrieved, relevant, k))
        mrr_scores.append(_mrr(retrieved, relevant))
    
    n = len(dataset.queries)
    return {
        f"ndcg@{k}": sum(ndcg_scores) / n,
        f"recall@{k}": sum(recall_scores) / n,
        f"precision@{k}": sum(precision_scores) / n,
        "mrr": sum(mrr_scores) / n,
    }
`,
    complexity: {
      time: "O(Q * D) where Q = queries, D = docs per query",
      space: "O(D) per query",
    },
    realWorld: {
      description: "BEIR is the standard benchmark suite used to evaluate and compare retrieval systems. Papers and embedding models report BEIR scores.",
      companies: ["OpenAI", "Cohere", "Voyage AI", "Jina AI"],
      useCases: ["Model selection", "Embedding evaluation", "Academic research"],
    },
    prerequisites: ["evaluator-ndcg", "evaluator-recall-at-k"],
    relatedChallenges: ["mteb-evaluation", "custom-eval-dataset"],
    relatedPlaybooks: ["rag-evaluation-suite"],
  },
  {
    slug: "mteb-evaluation",
    title: "MTEB Leaderboard Metrics",
    description:
      "Implement MTEB (Massive Text Embedding Benchmark) evaluation metrics. Why: MTEB is how embedding models are ranked. Solves: 'Which embedding model should I use?'",
    group: "Phase 6 — Benchmarking & Evaluation",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import Dict, List, Tuple
from dataclasses import dataclass
import numpy as np

@dataclass
class MTEBTask:
    """Represents an MTEB task configuration."""
    name: str
    task_type: str  # "retrieval", "classification", "clustering", "sts"
    
class MTEBEvaluator:
    """MTEB-style evaluator for embedding models."""
    
    def __init__(self, embed_fn):
        """
        Initialize with an embedding function.
        
        Args:
            embed_fn: Function that takes text and returns embedding (list/array)
        """
        self.embed_fn = embed_fn
    
    def evaluate_retrieval(
        self,
        queries: List[str],
        corpus: List[str],
        qrels: Dict[int, List[int]],  # query_idx -> list of relevant doc_idxs
        k: int = 10
    ) -> Dict[str, float]:
        """
        Evaluate retrieval task.
        
        Returns: {"ndcg@10": float, "recall@10": float, "mrr": float}
        """
        # TODO: Implement
        raise NotImplementedError
    
    def evaluate_sts(
        self,
        sentences1: List[str],
        sentences2: List[str],
        scores: List[float]  # Human similarity scores (0-5)
    ) -> Dict[str, float]:
        """
        Evaluate Semantic Textual Similarity task.
        
        Returns: {"spearman": float, "pearson": float}
        """
        # TODO: Implement
        raise NotImplementedError
    
    def evaluate_clustering(
        self,
        texts: List[str],
        labels: List[int],  # Ground truth cluster labels
        n_clusters: int
    ) -> Dict[str, float]:
        """
        Evaluate clustering task using V-measure.
        
        Returns: {"v_measure": float, "homogeneity": float, "completeness": float}
        """
        # TODO: Implement
        raise NotImplementedError
    
    def compute_overall_score(self, task_scores: Dict[str, Dict[str, float]]) -> float:
        """
        Compute overall MTEB score (average across tasks).
        
        Args:
            task_scores: {task_name: {metric: score}}
        
        Returns:
            Average of primary metrics across all tasks
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `import numpy as np

# Mock embedding function
def mock_embed(text: str) -> List[float]:
    \"\"\"Simple hash-based mock embedding.\"\"\"
    np.random.seed(hash(text) % (2**32))
    return list(np.random.randn(384))

evaluator = MTEBEvaluator(mock_embed)

# Test retrieval evaluation
queries = ["What is machine learning?", "How does RAG work?"]
corpus = [
    "Machine learning is a type of AI.",
    "RAG combines retrieval with generation.",
    "Deep learning uses neural networks.",
    "Retrieval augmented generation improves accuracy.",
]
qrels = {0: [0, 2], 1: [1, 3]}

retrieval_scores = evaluator.evaluate_retrieval(queries, corpus, qrels, k=4)
assert "ndcg@4" in retrieval_scores or "ndcg@10" in retrieval_scores
assert all(0 <= v <= 1 for v in retrieval_scores.values()), "Scores should be 0-1"

# Test STS evaluation
s1 = ["The cat sat on the mat.", "A plane is flying."]
s2 = ["A cat is sitting on a mat.", "An aircraft is in the sky."]
sts_scores = [4.5, 3.8]  # Human ratings

sts_results = evaluator.evaluate_sts(s1, s2, sts_scores)
assert "spearman" in sts_results, "Should compute Spearman correlation"

# Test clustering
texts = ["dog", "cat", "apple", "banana", "car", "bus"]
labels = [0, 0, 1, 1, 2, 2]

cluster_results = evaluator.evaluate_clustering(texts, labels, n_clusters=3)
assert "v_measure" in cluster_results, "Should compute V-measure"
assert 0 <= cluster_results["v_measure"] <= 1

# Test overall score
all_scores = {
    "retrieval": {"ndcg@10": 0.65},
    "sts": {"spearman": 0.78},
    "clustering": {"v_measure": 0.55},
}
overall = evaluator.compute_overall_score(all_scores)
assert 0 <= overall <= 1, "Overall score should be 0-1"

print("✅ MTEB evaluation passed!")
`,
    hints: [
      "For retrieval: embed queries and corpus, compute cosine similarity for ranking",
      "For STS: compute cosine similarity between sentence pairs, then correlate with human scores",
      "Spearman correlation: scipy.stats.spearmanr or implement rank-based correlation",
      "V-measure combines homogeneity and completeness (sklearn.metrics.v_measure_score)",
      "For clustering: use K-means on embeddings, compare predicted to true labels",
    ],
    solution: `from typing import Dict, List, Tuple
from dataclasses import dataclass
import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.metrics import v_measure_score, homogeneity_score, completeness_score
import math

@dataclass
class MTEBTask:
    name: str
    task_type: str

class MTEBEvaluator:
    def __init__(self, embed_fn):
        self.embed_fn = embed_fn
    
    def _cosine_sim(self, a, b):
        a, b = np.array(a), np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10)
    
    def evaluate_retrieval(self, queries, corpus, qrels, k=10):
        # Embed all
        query_embs = [self.embed_fn(q) for q in queries]
        corpus_embs = [self.embed_fn(d) for d in corpus]
        
        ndcg_scores, recall_scores, mrr_scores = [], [], []
        
        for qi, q_emb in enumerate(query_embs):
            # Rank corpus by similarity
            sims = [(di, self._cosine_sim(q_emb, c_emb)) for di, c_emb in enumerate(corpus_embs)]
            ranked = [di for di, _ in sorted(sims, key=lambda x: -x[1])][:k]
            
            relevant = set(qrels.get(qi, []))
            
            # Recall@K
            if relevant:
                recall_scores.append(len(set(ranked) & relevant) / len(relevant))
            
            # MRR
            for r, di in enumerate(ranked, 1):
                if di in relevant:
                    mrr_scores.append(1.0 / r)
                    break
            else:
                mrr_scores.append(0.0)
            
            # nDCG@K
            def dcg(rels):
                return sum(r / math.log2(i + 2) for i, r in enumerate(rels))
            
            actual_rels = [1 if d in relevant else 0 for d in ranked]
            ideal_rels = sorted(actual_rels, reverse=True)
            idcg = dcg(ideal_rels)
            ndcg_scores.append(dcg(actual_rels) / idcg if idcg > 0 else 0)
        
        n = len(queries)
        return {
            f"ndcg@{k}": sum(ndcg_scores) / n if ndcg_scores else 0,
            f"recall@{k}": sum(recall_scores) / n if recall_scores else 0,
            "mrr": sum(mrr_scores) / n if mrr_scores else 0,
        }
    
    def evaluate_sts(self, sentences1, sentences2, scores):
        pred_sims = []
        for s1, s2 in zip(sentences1, sentences2):
            e1, e2 = self.embed_fn(s1), self.embed_fn(s2)
            pred_sims.append(self._cosine_sim(e1, e2))
        
        spearman, _ = stats.spearmanr(pred_sims, scores)
        pearson, _ = stats.pearsonr(pred_sims, scores)
        
        return {"spearman": float(spearman), "pearson": float(pearson)}
    
    def evaluate_clustering(self, texts, labels, n_clusters):
        embeddings = np.array([self.embed_fn(t) for t in texts])
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        pred_labels = kmeans.fit_predict(embeddings)
        
        return {
            "v_measure": v_measure_score(labels, pred_labels),
            "homogeneity": homogeneity_score(labels, pred_labels),
            "completeness": completeness_score(labels, pred_labels),
        }
    
    def compute_overall_score(self, task_scores):
        # Primary metric per task type
        primary = {"retrieval": "ndcg", "sts": "spearman", "clustering": "v_measure"}
        scores = []
        
        for task, metrics in task_scores.items():
            for metric, value in metrics.items():
                if any(p in metric for p in primary.values()):
                    scores.append(value)
                    break
        
        return sum(scores) / len(scores) if scores else 0.0
`,
    complexity: {
      time: "O(Q * D) for retrieval, O(N) for STS, O(N * k * d) for clustering",
      space: "O(D) for corpus embeddings",
    },
    realWorld: {
      description: "MTEB is the definitive benchmark for comparing embedding models. The leaderboard drives embedding model development.",
      companies: ["Hugging Face", "Cohere", "Anthropic", "Voyage AI", "OpenAI"],
      useCases: ["Embedding model selection", "Fine-tuning evaluation", "Research"],
    },
    prerequisites: ["beir-evaluation-setup", "evaluator-ndcg"],
    relatedChallenges: ["embedding-finetuning", "embedding-model-selection"],
    relatedPlaybooks: ["tool-comparison-matrix", "rag-evaluation-suite"],
  },
  {
    slug: "custom-eval-dataset",
    title: "Build Custom Evaluation Dataset",
    description:
      "Create a domain-specific evaluation dataset for your RAG system. Why: Generic benchmarks don't capture your use case. Solves: 'How do I evaluate RAG for MY domain?'",
    group: "Phase 6 — Benchmarking & Evaluation",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
import json

@dataclass
class EvalExample:
    """A single evaluation example."""
    query: str
    relevant_doc_ids: List[str]
    irrelevant_doc_ids: List[str] = field(default_factory=list)
    expected_answer: Optional[str] = None
    difficulty: str = "medium"  # "easy", "medium", "hard"
    tags: List[str] = field(default_factory=list)

@dataclass
class EvalDataset:
    """Custom evaluation dataset."""
    name: str
    domain: str
    examples: List[EvalExample]
    corpus: Dict[str, str]  # doc_id -> doc_text
    metadata: Dict = field(default_factory=dict)

class EvalDatasetBuilder:
    """Builder for creating custom evaluation datasets."""
    
    def __init__(self, name: str, domain: str):
        self.name = name
        self.domain = domain
        self.corpus: Dict[str, str] = {}
        self.examples: List[EvalExample] = []
    
    def add_document(self, doc_id: str, text: str) -> "EvalDatasetBuilder":
        """Add a document to the corpus."""
        # TODO: Implement
        raise NotImplementedError
    
    def add_example(
        self,
        query: str,
        relevant_doc_ids: List[str],
        irrelevant_doc_ids: List[str] = None,
        expected_answer: str = None,
        difficulty: str = "medium",
        tags: List[str] = None
    ) -> "EvalDatasetBuilder":
        """Add an evaluation example."""
        # TODO: Implement with validation
        raise NotImplementedError
    
    def validate(self) -> Tuple[bool, List[str]]:
        """
        Validate the dataset.
        
        Returns:
            (is_valid, list_of_errors)
        
        Checks:
            - All referenced doc_ids exist in corpus
            - Each example has at least one relevant doc
            - No duplicate queries
            - Corpus is not empty
        """
        # TODO: Implement
        raise NotImplementedError
    
    def build(self) -> EvalDataset:
        """Build and return the dataset."""
        # TODO: Implement
        raise NotImplementedError
    
    def to_json(self) -> str:
        """Export dataset to JSON format."""
        # TODO: Implement
        raise NotImplementedError
    
    @classmethod
    def from_json(cls, json_str: str) -> "EvalDatasetBuilder":
        """Import dataset from JSON format."""
        # TODO: Implement
        raise NotImplementedError

def compute_dataset_stats(dataset: EvalDataset) -> Dict:
    """
    Compute statistics about the evaluation dataset.
    
    Returns:
        Dict with: num_examples, num_docs, avg_relevant_per_query,
                   difficulty_distribution, tag_distribution
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test building a custom dataset
builder = EvalDatasetBuilder("legal_rag_eval", "legal")

# Add corpus documents
builder.add_document("doc1", "Contract law governs agreements between parties.")
builder.add_document("doc2", "Employment law protects worker rights.")
builder.add_document("doc3", "Intellectual property includes patents and trademarks.")
builder.add_document("doc4", "Criminal law deals with offenses against the state.")
builder.add_document("doc5", "Contract breaches may result in damages.")

# Add evaluation examples
builder.add_example(
    query="What happens if someone breaks a contract?",
    relevant_doc_ids=["doc1", "doc5"],
    irrelevant_doc_ids=["doc2", "doc4"],
    expected_answer="Contract breaches may result in damages.",
    difficulty="easy",
    tags=["contract", "damages"]
)

builder.add_example(
    query="How are workers protected by law?",
    relevant_doc_ids=["doc2"],
    difficulty="medium",
    tags=["employment"]
)

# Validate
is_valid, errors = builder.validate()
assert is_valid, f"Dataset should be valid: {errors}"

# Build dataset
dataset = builder.build()
assert dataset.name == "legal_rag_eval"
assert len(dataset.examples) == 2
assert len(dataset.corpus) == 5

# Test stats
stats = compute_dataset_stats(dataset)
assert stats["num_examples"] == 2
assert stats["num_docs"] == 5
assert "easy" in stats["difficulty_distribution"]

# Test JSON serialization
json_str = builder.to_json()
restored = EvalDatasetBuilder.from_json(json_str)
restored_dataset = restored.build()
assert len(restored_dataset.examples) == 2

# Test validation catches errors
bad_builder = EvalDatasetBuilder("bad", "test")
bad_builder.examples.append(EvalExample(
    query="Test query",
    relevant_doc_ids=["nonexistent"]
))
is_valid, errors = bad_builder.validate()
assert not is_valid, "Should catch missing doc reference"

print("✅ Custom eval dataset passed!")
`,
    hints: [
      "Use method chaining (return self) for fluent API",
      "Validate that all doc_ids in examples exist in corpus",
      "Track difficulty and tag distributions in stats",
      "Use dataclass_json or manual dict conversion for JSON export",
    ],
    solution: `from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field, asdict
import json
from collections import Counter

@dataclass
class EvalExample:
    query: str
    relevant_doc_ids: List[str]
    irrelevant_doc_ids: List[str] = field(default_factory=list)
    expected_answer: Optional[str] = None
    difficulty: str = "medium"
    tags: List[str] = field(default_factory=list)

@dataclass
class EvalDataset:
    name: str
    domain: str
    examples: List[EvalExample]
    corpus: Dict[str, str]
    metadata: Dict = field(default_factory=dict)

class EvalDatasetBuilder:
    def __init__(self, name: str, domain: str):
        self.name = name
        self.domain = domain
        self.corpus: Dict[str, str] = {}
        self.examples: List[EvalExample] = []
    
    def add_document(self, doc_id: str, text: str) -> "EvalDatasetBuilder":
        self.corpus[doc_id] = text
        return self
    
    def add_example(
        self,
        query: str,
        relevant_doc_ids: List[str],
        irrelevant_doc_ids: List[str] = None,
        expected_answer: str = None,
        difficulty: str = "medium",
        tags: List[str] = None
    ) -> "EvalDatasetBuilder":
        example = EvalExample(
            query=query,
            relevant_doc_ids=relevant_doc_ids,
            irrelevant_doc_ids=irrelevant_doc_ids or [],
            expected_answer=expected_answer,
            difficulty=difficulty,
            tags=tags or []
        )
        self.examples.append(example)
        return self
    
    def validate(self) -> Tuple[bool, List[str]]:
        errors = []
        
        if not self.corpus:
            errors.append("Corpus is empty")
        
        queries_seen = set()
        for i, ex in enumerate(self.examples):
            # Check for duplicate queries
            if ex.query in queries_seen:
                errors.append(f"Duplicate query: '{ex.query}'")
            queries_seen.add(ex.query)
            
            # Check relevant docs exist
            if not ex.relevant_doc_ids:
                errors.append(f"Example {i} has no relevant docs")
            
            for doc_id in ex.relevant_doc_ids:
                if doc_id not in self.corpus:
                    errors.append(f"Doc '{doc_id}' not in corpus (example {i})")
            
            for doc_id in ex.irrelevant_doc_ids:
                if doc_id not in self.corpus:
                    errors.append(f"Doc '{doc_id}' not in corpus (example {i})")
        
        return (len(errors) == 0, errors)
    
    def build(self) -> EvalDataset:
        is_valid, errors = self.validate()
        if not is_valid:
            raise ValueError(f"Invalid dataset: {errors}")
        
        return EvalDataset(
            name=self.name,
            domain=self.domain,
            examples=self.examples,
            corpus=self.corpus,
            metadata={"version": "1.0"}
        )
    
    def to_json(self) -> str:
        data = {
            "name": self.name,
            "domain": self.domain,
            "corpus": self.corpus,
            "examples": [asdict(ex) for ex in self.examples]
        }
        return json.dumps(data, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> "EvalDatasetBuilder":
        data = json.loads(json_str)
        builder = cls(data["name"], data["domain"])
        builder.corpus = data["corpus"]
        builder.examples = [EvalExample(**ex) for ex in data["examples"]]
        return builder

def compute_dataset_stats(dataset: EvalDataset) -> Dict:
    difficulty_counts = Counter(ex.difficulty for ex in dataset.examples)
    all_tags = [tag for ex in dataset.examples for tag in ex.tags]
    tag_counts = Counter(all_tags)
    
    avg_relevant = sum(len(ex.relevant_doc_ids) for ex in dataset.examples) / len(dataset.examples) if dataset.examples else 0
    
    return {
        "num_examples": len(dataset.examples),
        "num_docs": len(dataset.corpus),
        "avg_relevant_per_query": avg_relevant,
        "difficulty_distribution": dict(difficulty_counts),
        "tag_distribution": dict(tag_counts),
    }
`,
    complexity: {
      time: "O(E * D) for validation where E = examples, D = avg docs per example",
      space: "O(E + C) for examples and corpus",
    },
    realWorld: {
      description: "Production RAG systems need domain-specific evaluation. Generic benchmarks miss domain-specific failure modes.",
      companies: ["Every enterprise RAG deployment", "Legal tech", "Healthcare AI"],
      useCases: ["Domain-specific RAG", "Quality assurance", "Regression testing"],
    },
    prerequisites: ["beir-evaluation-setup"],
    relatedChallenges: ["eval-dataset-curation", "synthetic-data-gen"],
    relatedPlaybooks: ["rag-troubleshooting-guide", "production-deployment-checklist"],
  },
  {
    slug: "retrieval-benchmarking-pipeline",
    title: "End-to-End Retrieval Benchmarking",
    description:
      "Build a complete benchmarking pipeline that compares multiple retrievers across multiple datasets. Why: Fair comparison requires controlled experiments. Solves: 'Which retriever config is best?'",
    group: "Phase 6 — Benchmarking & Evaluation",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Callable, Any
from dataclasses import dataclass
import time

@dataclass
class RetrieverConfig:
    """Configuration for a retriever to benchmark."""
    name: str
    retrieve_fn: Callable[[str, int], List[str]]  # (query, k) -> doc_ids
    params: Dict[str, Any] = None  # e.g., {"chunk_size": 512, "model": "bge-base"}

@dataclass
class BenchmarkResult:
    """Result from benchmarking a single retriever on a single dataset."""
    retriever_name: str
    dataset_name: str
    metrics: Dict[str, float]  # {"ndcg@10": 0.65, "recall@10": 0.80, ...}
    latency_ms: float  # Average query latency
    throughput_qps: float  # Queries per second

class RetrievalBenchmark:
    """
    Benchmarking pipeline for comparing retrievers.
    """
    
    def __init__(self, datasets: Dict[str, Any]):
        """
        Initialize with datasets to benchmark against.
        
        Args:
            datasets: Dict of {name: dataset} where dataset has 
                      queries, corpus, qrels attributes
        """
        self.datasets = datasets
        self.results: List[BenchmarkResult] = []
    
    def add_retriever(self, config: RetrieverConfig) -> None:
        """Register a retriever for benchmarking."""
        # TODO: Implement
        raise NotImplementedError
    
    def run_benchmark(
        self,
        k: int = 10,
        num_warmup: int = 5,
        num_runs: int = 3
    ) -> List[BenchmarkResult]:
        """
        Run benchmarks for all retrievers on all datasets.
        
        Args:
            k: Cutoff for metrics (e.g., nDCG@k)
            num_warmup: Warmup queries before timing
            num_runs: Number of runs to average for latency
        
        Returns:
            List of BenchmarkResult for each (retriever, dataset) pair
        """
        # TODO: Implement
        raise NotImplementedError
    
    def generate_report(self) -> str:
        """
        Generate a markdown report comparing all retrievers.
        
        Include:
            - Leaderboard table sorted by average nDCG@10
            - Per-dataset breakdown
            - Latency vs quality tradeoff analysis
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_best_retriever(self, metric: str = "ndcg@10") -> str:
        """Return name of best retriever by given metric (averaged across datasets)."""
        # TODO: Implement
        raise NotImplementedError

# Helper to compute metrics
def compute_metrics(
    retrieved: List[str],
    relevant: set,
    relevance_grades: Dict[str, int],
    k: int
) -> Dict[str, float]:
    """
    Compute standard IR metrics.
    
    Returns:
        Dict with ndcg@k, recall@k, precision@k, mrr
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `import time

# Create mock datasets
mock_dataset = type('Dataset', (), {
    'queries': {"q1": "test query 1", "q2": "test query 2"},
    'corpus': {"d1": "doc 1", "d2": "doc 2", "d3": "doc 3"},
    'qrels': {"q1": {"d1": 2, "d2": 1}, "q2": {"d2": 2}},
})()

datasets = {"mock_dataset": mock_dataset}

# Create mock retrievers
def fast_retriever(query: str, k: int) -> List[str]:
    time.sleep(0.001)  # 1ms latency
    return ["d1", "d2", "d3"][:k]

def slow_retriever(query: str, k: int) -> List[str]:
    time.sleep(0.005)  # 5ms latency
    return ["d2", "d1", "d3"][:k]  # Different ranking

# Run benchmark
benchmark = RetrievalBenchmark(datasets)
benchmark.add_retriever(RetrieverConfig("fast", fast_retriever))
benchmark.add_retriever(RetrieverConfig("slow", slow_retriever))

results = benchmark.run_benchmark(k=3, num_warmup=2, num_runs=2)

assert len(results) >= 2, "Should have results for each retriever"

# Check result structure
for result in results:
    assert result.retriever_name in ["fast", "slow"]
    assert result.dataset_name == "mock_dataset"
    assert "ndcg@3" in result.metrics or "ndcg@10" in result.metrics
    assert result.latency_ms > 0
    assert result.throughput_qps > 0

# Test report generation
report = benchmark.generate_report()
assert "fast" in report and "slow" in report
assert "nDCG" in report.lower() or "ndcg" in report.lower()

# Test best retriever
best = benchmark.get_best_retriever()
assert best in ["fast", "slow"]

print("✅ Retrieval benchmarking pipeline passed!")
`,
    hints: [
      "Store retrievers in a list and iterate over (retriever, dataset) combinations",
      "Remember warmup runs before timing to avoid cold-start effects",
      "Compute throughput as num_queries / total_time_seconds",
      "For the report, use markdown tables with aligned columns",
      "Average metrics across datasets for the leaderboard",
    ],
    solution: `from typing import Dict, List, Callable, Any
from dataclasses import dataclass, field
import time
import math

@dataclass
class RetrieverConfig:
    name: str
    retrieve_fn: Callable[[str, int], List[str]]
    params: Dict[str, Any] = None

@dataclass
class BenchmarkResult:
    retriever_name: str
    dataset_name: str
    metrics: Dict[str, float]
    latency_ms: float
    throughput_qps: float

def compute_metrics(retrieved, relevant, relevance_grades, k):
    top_k = retrieved[:k]
    
    # Precision@K
    prec = len(set(top_k) & relevant) / k if k > 0 else 0
    
    # Recall@K
    rec = len(set(top_k) & relevant) / len(relevant) if relevant else 0
    
    # MRR
    mrr = 0
    for i, d in enumerate(top_k, 1):
        if d in relevant:
            mrr = 1.0 / i
            break
    
    # nDCG@K
    def dcg(rels):
        return sum(r / math.log2(i + 2) for i, r in enumerate(rels))
    
    actual = [relevance_grades.get(d, 0) for d in top_k]
    ideal = sorted(relevance_grades.values(), reverse=True)[:k]
    idcg = dcg(ideal)
    ndcg = dcg(actual) / idcg if idcg > 0 else 0
    
    return {f"ndcg@{k}": ndcg, f"recall@{k}": rec, f"precision@{k}": prec, "mrr": mrr}

class RetrievalBenchmark:
    def __init__(self, datasets):
        self.datasets = datasets
        self.results = []
        self.retrievers = []
    
    def add_retriever(self, config):
        self.retrievers.append(config)
    
    def run_benchmark(self, k=10, num_warmup=5, num_runs=3):
        self.results = []
        
        for retriever in self.retrievers:
            for ds_name, dataset in self.datasets.items():
                queries = list(dataset.queries.items())
                
                # Warmup
                for qid, qtext in queries[:num_warmup]:
                    retriever.retrieve_fn(qtext, k)
                
                # Timed runs
                all_metrics = []
                total_time = 0
                
                for _ in range(num_runs):
                    run_metrics = []
                    for qid, qtext in queries:
                        start = time.time()
                        retrieved = retriever.retrieve_fn(qtext, k)
                        total_time += time.time() - start
                        
                        qrel = dataset.qrels.get(qid, {})
                        relevant = {d for d, r in qrel.items() if r > 0}
                        metrics = compute_metrics(retrieved, relevant, qrel, k)
                        run_metrics.append(metrics)
                    all_metrics.extend(run_metrics)
                
                # Average metrics
                avg_metrics = {}
                for key in all_metrics[0]:
                    avg_metrics[key] = sum(m[key] for m in all_metrics) / len(all_metrics)
                
                num_queries = len(queries) * num_runs
                latency_ms = (total_time / num_queries) * 1000
                throughput = num_queries / total_time
                
                self.results.append(BenchmarkResult(
                    retriever_name=retriever.name,
                    dataset_name=ds_name,
                    metrics=avg_metrics,
                    latency_ms=latency_ms,
                    throughput_qps=throughput
                ))
        
        return self.results
    
    def generate_report(self):
        lines = ["# Retrieval Benchmark Report\\n"]
        
        # Leaderboard
        lines.append("## Leaderboard (by avg nDCG)\\n")
        lines.append("| Retriever | Avg nDCG | Avg Recall | Latency (ms) | QPS |")
        lines.append("|-----------|----------|------------|--------------|-----|")
        
        # Aggregate by retriever
        ret_scores = {}
        for r in self.results:
            if r.retriever_name not in ret_scores:
                ret_scores[r.retriever_name] = {"ndcg": [], "recall": [], "lat": [], "qps": []}
            for k, v in r.metrics.items():
                if "ndcg" in k:
                    ret_scores[r.retriever_name]["ndcg"].append(v)
                if "recall" in k:
                    ret_scores[r.retriever_name]["recall"].append(v)
            ret_scores[r.retriever_name]["lat"].append(r.latency_ms)
            ret_scores[r.retriever_name]["qps"].append(r.throughput_qps)
        
        # Sort by ndcg
        sorted_rets = sorted(ret_scores.items(), 
                            key=lambda x: sum(x[1]["ndcg"])/len(x[1]["ndcg"]) if x[1]["ndcg"] else 0,
                            reverse=True)
        
        for name, scores in sorted_rets:
            avg_ndcg = sum(scores["ndcg"])/len(scores["ndcg"]) if scores["ndcg"] else 0
            avg_rec = sum(scores["recall"])/len(scores["recall"]) if scores["recall"] else 0
            avg_lat = sum(scores["lat"])/len(scores["lat"]) if scores["lat"] else 0
            avg_qps = sum(scores["qps"])/len(scores["qps"]) if scores["qps"] else 0
            lines.append(f"| {name} | {avg_ndcg:.3f} | {avg_rec:.3f} | {avg_lat:.1f} | {avg_qps:.1f} |")
        
        lines.append("\\n## Per-Dataset Results\\n")
        for r in self.results:
            ndcg_key = [k for k in r.metrics if "ndcg" in k][0] if any("ndcg" in k for k in r.metrics) else "ndcg@10"
            lines.append(f"- **{r.retriever_name}** on {r.dataset_name}: nDCG={r.metrics.get(ndcg_key, 0):.3f}")
        
        return "\\n".join(lines)
    
    def get_best_retriever(self, metric="ndcg@10"):
        scores = {}
        for r in self.results:
            if r.retriever_name not in scores:
                scores[r.retriever_name] = []
            
            # Find matching metric key
            for k, v in r.metrics.items():
                if metric.replace("@", "") in k.replace("@", ""):
                    scores[r.retriever_name].append(v)
                    break
        
        best = max(scores.items(), key=lambda x: sum(x[1])/len(x[1]) if x[1] else 0)
        return best[0]
`,
    complexity: {
      time: "O(R * D * Q * runs) where R=retrievers, D=datasets, Q=queries",
      space: "O(R * D) results",
    },
    realWorld: {
      description: "Production teams run A/B tests and benchmarks to compare retrieval configurations before deployment.",
      companies: ["Pinecone", "Weaviate", "Qdrant", "Elastic"],
      useCases: ["Model comparison", "Config tuning", "Regression testing"],
    },
    prerequisites: ["beir-evaluation-setup", "mteb-evaluation"],
    relatedChallenges: ["rag-ab-testing", "rag-evaluation-suite"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-troubleshooting-guide"],
  },
];
