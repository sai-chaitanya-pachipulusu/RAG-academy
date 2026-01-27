import type { RawChallenge } from "@/lib/challenges/types";

export const cragPipelineChallenge: RawChallenge = {
  slug: "crag-pipeline",
  title: "CRAG Pipeline",
  difficulty: "hard",
  xpReward: 275,
  group: "Advanced RAG",
  description:
    "Goal: Implement Corrective RAG with retrieval evaluation and three-action system. Why: Standard RAG silently uses irrelevant context, leading to hallucinations. CRAG evaluates retrieval confidence and takes corrective action. Production impact: Essential for production systems where retrieval failures must be detected and handled gracefully.",
  prerequisites: ["reranker-score-function"],
  starterCode: `# CRAG: Corrective Retrieval Augmented Generation
# Self-correcting RAG with retrieval evaluation

from dataclasses import dataclass
from enum import Enum
from typing import Optional

class Action(Enum):
    CORRECT = "correct"      # High confidence: use retrieved docs
    AMBIGUOUS = "ambiguous"  # Medium: augment with more sources
    INCORRECT = "incorrect"  # Low: abandon local retrieval

@dataclass
class Document:
    content: str
    source: str
    score: float = 0.0

@dataclass
class RetrievalResult:
    action: Action
    confidence: float
    documents: list[Document]


def evaluate_retrieval_confidence(
    query: str,
    documents: list[Document],
    relevance_scores: list[float]
) -> tuple[Action, float]:
    """
    Evaluate retrieval quality and determine action.
    
    Args:
        query: User query
        documents: Retrieved documents
        relevance_scores: Relevance score (0-1) for each document
        
    Returns:
        (action, confidence) tuple
        
    Thresholds:
        - CORRECT: max_score > 0.7
        - AMBIGUOUS: max_score in [0.3, 0.7]
        - INCORRECT: max_score < 0.3
    """
    # TODO: Determine action based on relevance scores
    pass


def action_correct(
    documents: list[Document],
    query: str
) -> list[Document]:
    """
    High confidence action: Refine and use retrieved documents.
    
    Filter out documents with very low relevance (score < 0.3).
    Keep at least one document.
    
    Returns:
        Refined list of documents
    """
    # TODO: Filter low-score docs
    pass


def action_ambiguous(
    query: str,
    documents: list[Document],
    additional_docs: list[Document],
    web_results: list[Document]
) -> list[Document]:
    """
    Medium confidence action: Augment with additional sources.
    
    Combine original + additional + web results.
    Deduplicate by content hash.
    
    Returns:
        Augmented and deduplicated document list
    """
    # TODO: Merge sources and deduplicate
    pass


def action_incorrect(
    web_results: list[Document]
) -> list[Document]:
    """
    Low confidence action: Use only web search results.
    
    Returns:
        Web search results only
    """
    # TODO: Return web results
    pass


def crag_retrieve(
    query: str,
    documents: list[Document],
    relevance_scores: list[float],
    additional_docs: Optional[list[Document]] = None,
    web_results: Optional[list[Document]] = None
) -> RetrievalResult:
    """
    Complete CRAG pipeline.
    
    1. Evaluate retrieval confidence
    2. Take appropriate action based on confidence
    3. Return result with action taken and documents
    
    Returns:
        RetrievalResult with action, confidence, and documents
    """
    # TODO: Orchestrate the CRAG pipeline
    pass
`,
  testCode: `# Test documents
good_doc = Document(
    content="Paris is the capital of France. It is located in Europe.",
    source="wikipedia"
)
okay_doc = Document(
    content="France is a country known for wine and cheese.",
    source="travel-guide"
)
bad_doc = Document(
    content="Basketball was invented by James Naismith.",
    source="sports-wiki"
)

# Test high confidence scenario
action, conf = evaluate_retrieval_confidence(
    "What is the capital of France?",
    [good_doc, okay_doc],
    [0.85, 0.45]
)
assert action == Action.CORRECT, f"Expected CORRECT, got {action}"
assert conf == 0.85, f"Expected 0.85, got {conf}"

# Test medium confidence scenario
action, conf = evaluate_retrieval_confidence(
    "What is French cuisine like?",
    [okay_doc],
    [0.55]
)
assert action == Action.AMBIGUOUS, f"Expected AMBIGUOUS, got {action}"

# Test low confidence scenario
action, conf = evaluate_retrieval_confidence(
    "What is the capital of France?",
    [bad_doc],
    [0.15]
)
assert action == Action.INCORRECT, f"Expected INCORRECT, got {action}"

# Test action_correct
docs_with_scores = [
    Document(content="Paris is the capital.", source="wiki", score=0.9),
    Document(content="Irrelevant content.", source="random", score=0.2)
]
refined = action_correct(docs_with_scores, "capital of France")
assert len(refined) >= 1, "Should keep at least one doc"
assert all(d.score >= 0.3 for d in refined), "Should filter low-score docs"

# Test action_ambiguous
web_docs = [Document(content="From web search", source="web")]
additional = [Document(content="Additional retrieval", source="db")]
merged = action_ambiguous("query", [good_doc], additional, web_docs)
assert len(merged) >= 2, "Should include multiple sources"

# Test action_incorrect
web_only = action_incorrect(web_docs)
assert web_only == web_docs, "Should return web results only"

# Test full pipeline
result = crag_retrieve(
    query="What is the capital of France?",
    documents=[good_doc, okay_doc],
    relevance_scores=[0.85, 0.45],
    additional_docs=[],
    web_results=[]
)
assert result.action == Action.CORRECT
assert result.confidence == 0.85
assert len(result.documents) >= 1

print("All tests passed!")`,
  solution: `from dataclasses import dataclass
from enum import Enum
from typing import Optional

class Action(Enum):
    CORRECT = "correct"
    AMBIGUOUS = "ambiguous"
    INCORRECT = "incorrect"

@dataclass
class Document:
    content: str
    source: str
    score: float = 0.0

@dataclass
class RetrievalResult:
    action: Action
    confidence: float
    documents: list[Document]


def evaluate_retrieval_confidence(
    query: str,
    documents: list[Document],
    relevance_scores: list[float]
) -> tuple[Action, float]:
    if not relevance_scores:
        return Action.INCORRECT, 0.0
    
    max_score = max(relevance_scores)
    
    if max_score > 0.7:
        return Action.CORRECT, max_score
    elif max_score >= 0.3:
        return Action.AMBIGUOUS, max_score
    else:
        return Action.INCORRECT, max_score


def action_correct(
    documents: list[Document],
    query: str
) -> list[Document]:
    refined = [doc for doc in documents if doc.score >= 0.3]
    
    if not refined and documents:
        best_doc = max(documents, key=lambda d: d.score)
        refined = [best_doc]
    
    return refined


def action_ambiguous(
    query: str,
    documents: list[Document],
    additional_docs: list[Document],
    web_results: list[Document]
) -> list[Document]:
    all_docs = documents + (additional_docs or []) + (web_results or [])
    
    seen = set()
    unique_docs = []
    
    for doc in all_docs:
        content_hash = hash(doc.content[:100])
        if content_hash not in seen:
            seen.add(content_hash)
            unique_docs.append(doc)
    
    return unique_docs


def action_incorrect(
    web_results: list[Document]
) -> list[Document]:
    return web_results or []


def crag_retrieve(
    query: str,
    documents: list[Document],
    relevance_scores: list[float],
    additional_docs: Optional[list[Document]] = None,
    web_results: Optional[list[Document]] = None
) -> RetrievalResult:
    action, confidence = evaluate_retrieval_confidence(
        query, documents, relevance_scores
    )
    
    for doc, score in zip(documents, relevance_scores):
        doc.score = score
    
    if action == Action.CORRECT:
        result_docs = action_correct(documents, query)
    elif action == Action.AMBIGUOUS:
        result_docs = action_ambiguous(
            query, documents, 
            additional_docs or [], 
            web_results or []
        )
    else:
        result_docs = action_incorrect(web_results or [])
    
    return RetrievalResult(
        action=action,
        confidence=confidence,
        documents=result_docs
    )
`,
  hints: [
    "evaluate_retrieval_confidence should use max() of relevance scores",
    "Use threshold comparisons: >0.7 = CORRECT, 0.3-0.7 = AMBIGUOUS, <0.3 = INCORRECT",
    "action_correct should filter low-score docs but keep at least one",
    "action_ambiguous needs to combine and deduplicate all sources",
  ],
  realWorld: {
    description: "CRAG is essential for production systems where retrieval failures lead to hallucinations. Used in enterprise QA systems with web search fallback.",
    companies: ["Google", "Cohere", "Anthropic"],
    useCases: [
      "Production QA systems with fallback",
      "Customer support bots",
      "Research assistants",
    ],
  },
  timeEstimate: { minutes: 35, label: "30-40 min" },
};
