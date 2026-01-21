import type { RawChallenge } from "@/lib/challenges/types";

/**
 * TIER 3D: MULTIMODAL RAG & RAG TESTING
 */
export const TIER3D_MULTIMODAL_TESTING_CHALLENGES: RawChallenge[] = [
  // ============================================
  // MULTIMODAL RAG
  // ============================================
  {
    slug: "image-embedding-rag",
    title: "Image Embedding for RAG",
    description:
      "Implement image-to-embedding conversion for multimodal RAG. Why: Modern RAG needs to handle images, not just text. Solves: Enables search across documents with diagrams and figures.",
    group: "Phase 8 — Multimodal RAG",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Tuple
from dataclasses import dataclass
import hashlib
import math

@dataclass
class MultimodalDocument:
    doc_id: str
    text: str
    image_data: bytes  # Raw image bytes (simulated)
    image_caption: str = ""

class MultimodalEmbedder:
    """
    Embed both text and images into a shared embedding space.
    """
    
    def __init__(self, dim: int = 64):
        self.dim = dim
    
    def embed_text(self, text: str) -> List[float]:
        """Embed text into the shared space."""
        # Hash-based embedding for simulation
        h = hashlib.sha256(text.encode()).digest()
        return self._normalize([float(b) / 255.0 for b in h[:self.dim]])
    
    def embed_image(self, image_data: bytes) -> List[float]:
        """
        Embed image into the shared space.
        
        In production: Use CLIP, SigLIP, or similar vision encoders.
        For this exercise: Hash the image bytes for deterministic output.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def embed_document(self, doc: MultimodalDocument) -> List[float]:
        """
        Create a combined embedding for a multimodal document.
        
        Strategy: Average the text and image embeddings.
        If image_caption exists, include it in text embedding.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def _normalize(self, vec: List[float]) -> List[float]:
        mag = math.sqrt(sum(x*x for x in vec))
        return [x/mag for x in vec] if mag > 0 else vec
    
    def _cosine(self, a: List[float], b: List[float]) -> float:
        return sum(x*y for x, y in zip(a, b))

class MultimodalIndex:
    """
    Index for multimodal documents.
    """
    
    def __init__(self, embedder: MultimodalEmbedder):
        self.embedder = embedder
        self.docs: Dict[str, MultimodalDocument] = {}
        self.embeddings: Dict[str, List[float]] = {}
    
    def add(self, doc: MultimodalDocument) -> None:
        """Add a multimodal document to the index."""
        # TODO: Implement
        raise NotImplementedError
    
    def search_text(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        """Search using text query."""
        # TODO: Implement
        raise NotImplementedError
    
    def search_image(self, image_data: bytes, k: int = 5) -> List[Tuple[str, float]]:
        """Search using image query (image-to-document)."""
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `embedder = MultimodalEmbedder(dim=32)

# Test image embedding
img1 = b"fake_image_data_123"
img2 = b"fake_image_data_456"
emb1 = embedder.embed_image(img1)
emb2 = embedder.embed_image(img2)
assert len(emb1) == 32
assert emb1 != emb2  # Different images, different embeddings

# Test document embedding
doc = MultimodalDocument("d1", "A cat sitting on a mat", img1, "Photo of a cat")
doc_emb = embedder.embed_document(doc)
assert len(doc_emb) == 32

# Test multimodal index
index = MultimodalIndex(embedder)
index.add(MultimodalDocument("d1", "Neural networks for image recognition", b"img_nn", "CNN diagram"))
index.add(MultimodalDocument("d2", "Python programming tutorial", b"img_py", "Python logo"))
index.add(MultimodalDocument("d3", "Deep learning architectures", b"img_dl", "ResNet layers"))

# Text search
results = index.search_text("neural networks", k=2)
assert len(results) == 2
assert any("d1" in r[0] or "d3" in r[0] for r in results)

print("✅ Image embedding RAG passed!")
`,
    hints: [
      "Hash image bytes similar to text for deterministic embedding",
      "For combined embedding, average text and image vectors",
      "Use cosine similarity for search ranking",
    ],
    solution: `from typing import List, Dict, Tuple
from dataclasses import dataclass
import hashlib
import math

@dataclass
class MultimodalDocument:
    doc_id: str
    text: str
    image_data: bytes
    image_caption: str = ""

class MultimodalEmbedder:
    def __init__(self, dim: int = 64):
        self.dim = dim
    
    def embed_text(self, text: str) -> List[float]:
        h = hashlib.sha256(text.encode()).digest()
        return self._normalize([float(b) / 255.0 for b in h[:self.dim]])
    
    def embed_image(self, image_data: bytes) -> List[float]:
        h = hashlib.sha256(image_data).digest()
        return self._normalize([float(b) / 255.0 for b in h[:self.dim]])
    
    def embed_document(self, doc: MultimodalDocument) -> List[float]:
        # Combine text with caption
        full_text = doc.text
        if doc.image_caption:
            full_text += " " + doc.image_caption
        
        text_emb = self.embed_text(full_text)
        image_emb = self.embed_image(doc.image_data)
        
        # Average embeddings
        combined = [(t + i) / 2 for t, i in zip(text_emb, image_emb)]
        return self._normalize(combined)
    
    def _normalize(self, vec: List[float]) -> List[float]:
        mag = math.sqrt(sum(x*x for x in vec))
        return [x/mag for x in vec] if mag > 0 else vec
    
    def _cosine(self, a: List[float], b: List[float]) -> float:
        return sum(x*y for x, y in zip(a, b))

class MultimodalIndex:
    def __init__(self, embedder: MultimodalEmbedder):
        self.embedder = embedder
        self.docs: Dict[str, MultimodalDocument] = {}
        self.embeddings: Dict[str, List[float]] = {}
    
    def add(self, doc: MultimodalDocument) -> None:
        self.docs[doc.doc_id] = doc
        self.embeddings[doc.doc_id] = self.embedder.embed_document(doc)
    
    def _search(self, query_emb: List[float], k: int) -> List[Tuple[str, float]]:
        scores = []
        for doc_id, emb in self.embeddings.items():
            score = self.embedder._cosine(query_emb, emb)
            scores.append((doc_id, score))
        scores.sort(key=lambda x: -x[1])
        return scores[:k]
    
    def search_text(self, query: str, k: int = 5) -> List[Tuple[str, float]]:
        query_emb = self.embedder.embed_text(query)
        return self._search(query_emb, k)
    
    def search_image(self, image_data: bytes, k: int = 5) -> List[Tuple[str, float]]:
        query_emb = self.embedder.embed_image(image_data)
        return self._search(query_emb, k)
`,
    complexity: {
      time: "O(N) for N documents",
      space: "O(N * D) for N documents with D-dimensional embeddings",
    },
    realWorld: {
      description: "CLIP and SigLIP power multimodal search. Google, Pinterest, and e-commerce sites use image-text matching for product discovery.",
      companies: ["OpenAI (CLIP)", "Google (SigLIP)", "Pinterest"],
      useCases: ["Product search", "Scientific papers", "Medical imaging"],
    },
    prerequisites: ["basic-retrieval", "embed-and-search"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "ocr-rag-pipeline",
    title: "OCR + RAG Pipeline",
    description:
      "Extract text from images using OCR for RAG indexing. Why: PDFs and scanned documents contain embedded images. Solves: Makes image content searchable.",
    group: "Phase 8 — Multimodal RAG",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Optional
from dataclasses import dataclass
import re

@dataclass
class OCRResult:
    text: str
    confidence: float
    bounding_boxes: List[Dict] = None  # [{x, y, w, h, text}]

class MockOCR:
    """
    Simulates OCR extraction.
    In production: Use Tesseract, Google Vision, or AWS Textract.
    """
    
    def __init__(self):
        # Simulated "image database" - maps image hash to expected text
        self._mock_data = {
            "invoice_img": "Invoice #12345\\nDate: 2024-01-15\\nTotal: $499.99",
            "receipt_img": "Receipt\\nItem: Coffee $4.50\\nItem: Sandwich $8.99",
            "form_img": "Name: John Doe\\nEmail: john@example.com\\nPhone: 555-1234",
        }
    
    def extract(self, image_name: str) -> OCRResult:
        """
        Extract text from an image.
        
        Returns OCRResult with extracted text and confidence.
        """
        # TODO: Implement (use mock data for simulation)
        raise NotImplementedError
    
    def extract_structured(self, image_name: str) -> Dict[str, str]:
        """
        Extract and parse structured data from an image.
        
        Parses key-value pairs from OCR text.
        Example: "Name: John" -> {"Name": "John"}
        """
        # TODO: Implement
        raise NotImplementedError

class OCRRAGPipeline:
    """
    RAG pipeline that handles images via OCR.
    """
    
    def __init__(self, ocr: MockOCR):
        self.ocr = ocr
        self.documents: Dict[str, str] = {}  # doc_id -> extracted text
        self.metadata: Dict[str, Dict] = {}  # doc_id -> structured data
    
    def ingest_image(self, doc_id: str, image_name: str) -> bool:
        """
        Process an image: extract text and metadata.
        
        Returns True if successful.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def search(self, query: str) -> List[str]:
        """
        Simple keyword search across ingested documents.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `ocr = MockOCR()

# Test basic extraction
result = ocr.extract("invoice_img")
assert "Invoice" in result.text
assert result.confidence > 0.5

# Test structured extraction
structured = ocr.extract_structured("form_img")
assert "Name" in structured
assert structured["Name"] == "John Doe"

# Test pipeline
pipeline = OCRRAGPipeline(ocr)
assert pipeline.ingest_image("doc1", "invoice_img") == True
assert pipeline.ingest_image("doc2", "receipt_img") == True

# Test search
results = pipeline.search("Invoice")
assert "doc1" in results

results2 = pipeline.search("Coffee")
assert "doc2" in results2

print("✅ OCR RAG pipeline passed!")
`,
    hints: [
      "Use regex to parse key: value patterns",
      "For search, check if query is in document text (case-insensitive)",
      "Return confidence of 0.9 for mock data, 0.0 for unknown",
    ],
    solution: `from typing import List, Dict, Optional
from dataclasses import dataclass
import re

@dataclass
class OCRResult:
    text: str
    confidence: float
    bounding_boxes: List[Dict] = None

class MockOCR:
    def __init__(self):
        self._mock_data = {
            "invoice_img": "Invoice #12345\\nDate: 2024-01-15\\nTotal: $499.99",
            "receipt_img": "Receipt\\nItem: Coffee $4.50\\nItem: Sandwich $8.99",
            "form_img": "Name: John Doe\\nEmail: john@example.com\\nPhone: 555-1234",
        }
    
    def extract(self, image_name: str) -> OCRResult:
        if image_name in self._mock_data:
            return OCRResult(self._mock_data[image_name], 0.95)
        return OCRResult("", 0.0)
    
    def extract_structured(self, image_name: str) -> Dict[str, str]:
        result = self.extract(image_name)
        if not result.text:
            return {}
        
        structured = {}
        for line in result.text.split("\\n"):
            match = re.match(r"^([^:]+):\\s*(.+)$", line)
            if match:
                key = match.group(1).strip()
                value = match.group(2).strip()
                structured[key] = value
        
        return structured

class OCRRAGPipeline:
    def __init__(self, ocr: MockOCR):
        self.ocr = ocr
        self.documents: Dict[str, str] = {}
        self.metadata: Dict[str, Dict] = {}
    
    def ingest_image(self, doc_id: str, image_name: str) -> bool:
        result = self.ocr.extract(image_name)
        if result.confidence < 0.5:
            return False
        
        self.documents[doc_id] = result.text
        self.metadata[doc_id] = self.ocr.extract_structured(image_name)
        return True
    
    def search(self, query: str) -> List[str]:
        query_lower = query.lower()
        matches = []
        for doc_id, text in self.documents.items():
            if query_lower in text.lower():
                matches.append(doc_id)
        return matches
`,
    complexity: {
      time: "O(N * T) for N documents with T average text length",
      space: "O(N * T) for storing extracted text",
    },
    realWorld: {
      description: "Document AI, Textract, and LlamaParse handle OCR for RAG. Critical for contracts, invoices, and legacy scanned documents.",
      companies: ["Google Document AI", "AWS Textract", "LlamaIndex"],
      useCases: ["Invoice processing", "Contract analysis", "Historical archives"],
    },
    prerequisites: ["pdf-table-extraction"],
    relatedPlaybooks: ["document-parsing-guide", "production-deployment-checklist"],
  },
  
  // ============================================
  // RAG TESTING
  // ============================================
  {
    slug: "rag-unit-tests",
    title: "RAG Unit Test Suite",
    description:
      "Build a comprehensive unit test suite for RAG components. Why: RAG systems are complex. Solves: Catches regressions in chunking, retrieval, and generation.",
    group: "Phase 6 — Evaluation & Testing",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Callable
from dataclasses import dataclass
import time

@dataclass
class TestCase:
    name: str
    test_fn: Callable[[], bool]
    category: str = "general"

@dataclass
class TestResult:
    name: str
    passed: bool
    error: str = ""
    duration_ms: float = 0.0

class RAGTestSuite:
    """
    Test suite for RAG components.
    """
    
    def __init__(self):
        self.tests: List[TestCase] = []
        self.results: List[TestResult] = []
    
    def add_test(self, name: str, test_fn: Callable[[], bool], category: str = "general") -> None:
        """Add a test case to the suite."""
        self.tests.append(TestCase(name, test_fn, category))
    
    def run_all(self) -> Dict[str, any]:
        """
        Run all tests and return summary.
        
        Returns:
        {
            "total": int,
            "passed": int,
            "failed": int,
            "results": List[TestResult],
            "duration_ms": float
        }
        """
        # TODO: Implement
        raise NotImplementedError
    
    def run_category(self, category: str) -> Dict[str, any]:
        """Run tests in a specific category."""
        # TODO: Implement
        raise NotImplementedError
    
    def generate_report(self) -> str:
        """
        Generate a human-readable test report.
        """
        # TODO: Implement
        raise NotImplementedError

# Example test functions
def test_chunking_preserves_content():
    """Test that chunking doesn't lose content."""
    text = "Hello world. This is a test."
    chunks = [text[:15], text[10:]]  # Simulated overlapping chunks
    reconstructed = chunks[0] + chunks[1][5:]  # Approximate
    return "Hello" in reconstructed and "test" in reconstructed

def test_retrieval_returns_relevant():
    """Test that retrieval returns relevant results."""
    # Simulated
    query = "python programming"
    results = ["Python is great", "Java is cool"]
    return "Python" in results[0]
`,
    testCode: `suite = RAGTestSuite()

# Add tests
suite.add_test("chunking_content", test_chunking_preserves_content, "chunking")
suite.add_test("retrieval_relevance", test_retrieval_returns_relevant, "retrieval")
suite.add_test("always_pass", lambda: True, "general")
suite.add_test("always_fail", lambda: False, "general")

# Run all tests
summary = suite.run_all()
assert summary["total"] == 4
assert summary["passed"] == 3
assert summary["failed"] == 1

# Run category
chunking_results = suite.run_category("chunking")
assert chunking_results["total"] == 1

# Generate report
report = suite.generate_report()
assert "PASSED" in report or "FAILED" in report
assert "chunking_content" in report

print("✅ RAG unit tests passed!")
`,
    hints: [
      "Time each test with time.time()",
      "Catch exceptions and mark test as failed",
      "Filter tests by category for run_category",
    ],
    solution: `from typing import List, Dict, Callable
from dataclasses import dataclass
import time

@dataclass
class TestCase:
    name: str
    test_fn: Callable[[], bool]
    category: str = "general"

@dataclass
class TestResult:
    name: str
    passed: bool
    error: str = ""
    duration_ms: float = 0.0

class RAGTestSuite:
    def __init__(self):
        self.tests: List[TestCase] = []
        self.results: List[TestResult] = []
    
    def add_test(self, name: str, test_fn: Callable[[], bool], category: str = "general") -> None:
        self.tests.append(TestCase(name, test_fn, category))
    
    def _run_test(self, test: TestCase) -> TestResult:
        start = time.time()
        try:
            passed = test.test_fn()
            duration = (time.time() - start) * 1000
            return TestResult(test.name, passed, "", duration)
        except Exception as e:
            duration = (time.time() - start) * 1000
            return TestResult(test.name, False, str(e), duration)
    
    def run_all(self) -> Dict[str, any]:
        start = time.time()
        self.results = [self._run_test(t) for t in self.tests]
        duration = (time.time() - start) * 1000
        
        passed = sum(1 for r in self.results if r.passed)
        return {
            "total": len(self.results),
            "passed": passed,
            "failed": len(self.results) - passed,
            "results": self.results,
            "duration_ms": duration,
        }
    
    def run_category(self, category: str) -> Dict[str, any]:
        tests = [t for t in self.tests if t.category == category]
        results = [self._run_test(t) for t in tests]
        passed = sum(1 for r in results if r.passed)
        return {
            "total": len(results),
            "passed": passed,
            "failed": len(results) - passed,
            "results": results,
        }
    
    def generate_report(self) -> str:
        lines = ["RAG Test Report", "=" * 40]
        for r in self.results:
            status = "PASSED" if r.passed else "FAILED"
            lines.append(f"[{status}] {r.name} ({r.duration_ms:.1f}ms)")
            if r.error:
                lines.append(f"  Error: {r.error}")
        
        passed = sum(1 for r in self.results if r.passed)
        lines.append("-" * 40)
        lines.append(f"Total: {len(self.results)}, Passed: {passed}, Failed: {len(self.results) - passed}")
        return "\\n".join(lines)

def test_chunking_preserves_content():
    text = "Hello world. This is a test."
    chunks = [text[:15], text[10:]]
    reconstructed = chunks[0] + chunks[1][5:]
    return "Hello" in reconstructed and "test" in reconstructed

def test_retrieval_returns_relevant():
    query = "python programming"
    results = ["Python is great", "Java is cool"]
    return "Python" in results[0]
`,
    complexity: {
      time: "O(T) for T tests",
      space: "O(T) for storing results",
    },
    realWorld: {
      description: "RAGAS, DeepEval, and custom test suites are essential for RAG quality assurance. Testing prevents silent regressions.",
      companies: ["Anthropic", "LangChain", "Weights & Biases"],
      useCases: ["CI/CD pipelines", "Model updates", "Chunking changes"],
    },
    prerequisites: ["rag-pipeline-generator"],
    relatedPlaybooks: ["rag-evaluation-suite", "production-deployment-checklist"],
  },
  {
    slug: "retrieval-regression-tests",
    title: "Retrieval Regression Testing",
    description:
      "Detect retrieval quality regressions after changes. Why: Model updates can break retrieval. Solves: Automatically catches drops in recall or precision.",
    group: "Phase 6 — Evaluation & Testing",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Tuple, Set
from dataclasses import dataclass

@dataclass
class RetrievalTestCase:
    query: str
    expected_doc_ids: Set[str]  # Ground truth relevant docs
    description: str = ""

@dataclass
class RegressionResult:
    query: str
    expected: Set[str]
    actual: Set[str]
    precision: float
    recall: float
    regression: bool  # True if worse than baseline

class RetrievalRegressionTester:
    """
    Compare retrieval quality between baseline and current system.
    """
    
    def __init__(self, test_cases: List[RetrievalTestCase]):
        self.test_cases = test_cases
        self.baseline_scores: Dict[str, float] = {}
    
    def set_baseline(self, retriever, k: int = 5) -> Dict[str, float]:
        """
        Establish baseline scores for each test case.
        
        Returns dict of query -> recall score
        """
        # TODO: Implement
        raise NotImplementedError
    
    def run_regression(self, retriever, k: int = 5, 
                       regression_threshold: float = 0.1) -> List[RegressionResult]:
        """
        Run regression tests against baseline.
        
        regression_threshold: Max allowed drop in recall (0.1 = 10%)
        
        Returns list of RegressionResult for each test case.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def _compute_metrics(self, expected: Set[str], actual: Set[str]) -> Tuple[float, float]:
        """Compute precision and recall."""
        # TODO: Implement
        raise NotImplementedError
    
    def generate_report(self, results: List[RegressionResult]) -> str:
        """Generate regression test report."""
        # TODO: Implement
        raise NotImplementedError

# Mock retriever for testing
class MockRetriever:
    def __init__(self, results_map: Dict[str, List[str]]):
        self.results_map = results_map
    
    def retrieve(self, query: str, k: int = 5) -> List[str]:
        return self.results_map.get(query, [])[:k]
`,
    testCode: `# Create test cases
test_cases = [
    RetrievalTestCase("python tutorial", {"doc1", "doc3"}, "Python basics"),
    RetrievalTestCase("machine learning", {"doc2", "doc4", "doc5"}, "ML content"),
]

tester = RetrievalRegressionTester(test_cases)

# Baseline retriever (good)
baseline = MockRetriever({
    "python tutorial": ["doc1", "doc3", "doc7"],
    "machine learning": ["doc2", "doc4", "doc5", "doc6"],
})

# Set baseline
baseline_scores = tester.set_baseline(baseline, k=5)
assert baseline_scores["python tutorial"] == 1.0  # Found both expected docs
assert baseline_scores["machine learning"] == 1.0

# Current retriever (slightly degraded)
current = MockRetriever({
    "python tutorial": ["doc1", "doc7"],  # Missing doc3!
    "machine learning": ["doc2", "doc4", "doc5"],
})

# Run regression test
results = tester.run_regression(current, k=5, regression_threshold=0.1)
assert len(results) == 2

# Python query should show regression
python_result = next(r for r in results if "python" in r.query)
assert python_result.regression == True
assert python_result.recall < 1.0

# ML query should be fine
ml_result = next(r for r in results if "machine" in r.query)
assert ml_result.regression == False

# Generate report
report = tester.generate_report(results)
assert "REGRESSION" in report

print("✅ Retrieval regression tests passed!")
`,
    hints: [
      "Recall = |expected ∩ actual| / |expected|",
      "Precision = |expected ∩ actual| / |actual|",
      "Regression if current_recall < baseline - threshold",
    ],
    solution: `from typing import List, Dict, Tuple, Set
from dataclasses import dataclass

@dataclass
class RetrievalTestCase:
    query: str
    expected_doc_ids: Set[str]
    description: str = ""

@dataclass
class RegressionResult:
    query: str
    expected: Set[str]
    actual: Set[str]
    precision: float
    recall: float
    regression: bool

class RetrievalRegressionTester:
    def __init__(self, test_cases: List[RetrievalTestCase]):
        self.test_cases = test_cases
        self.baseline_scores: Dict[str, float] = {}
    
    def _compute_metrics(self, expected: Set[str], actual: Set[str]) -> Tuple[float, float]:
        if not actual:
            return 0.0, 0.0
        if not expected:
            return 1.0, 1.0
        
        intersection = expected & actual
        precision = len(intersection) / len(actual)
        recall = len(intersection) / len(expected)
        return precision, recall
    
    def set_baseline(self, retriever, k: int = 5) -> Dict[str, float]:
        for tc in self.test_cases:
            results = retriever.retrieve(tc.query, k)
            actual = set(results)
            _, recall = self._compute_metrics(tc.expected_doc_ids, actual)
            self.baseline_scores[tc.query] = recall
        return self.baseline_scores.copy()
    
    def run_regression(self, retriever, k: int = 5, 
                       regression_threshold: float = 0.1) -> List[RegressionResult]:
        results = []
        for tc in self.test_cases:
            retrieved = retriever.retrieve(tc.query, k)
            actual = set(retrieved)
            precision, recall = self._compute_metrics(tc.expected_doc_ids, actual)
            
            baseline = self.baseline_scores.get(tc.query, 0.0)
            is_regression = recall < baseline - regression_threshold
            
            results.append(RegressionResult(
                tc.query, tc.expected_doc_ids, actual,
                precision, recall, is_regression
            ))
        return results
    
    def generate_report(self, results: List[RegressionResult]) -> str:
        lines = ["Retrieval Regression Report", "=" * 50]
        regressions = 0
        
        for r in results:
            status = "REGRESSION" if r.regression else "OK"
            lines.append(f"[{status}] Query: {r.query}")
            lines.append(f"  Recall: {r.recall:.2%}, Precision: {r.precision:.2%}")
            lines.append(f"  Expected: {r.expected}")
            lines.append(f"  Actual: {r.actual}")
            if r.regression:
                regressions += 1
        
        lines.append("-" * 50)
        lines.append(f"Total: {len(results)}, Regressions: {regressions}")
        return "\\n".join(lines)

class MockRetriever:
    def __init__(self, results_map: Dict[str, List[str]]):
        self.results_map = results_map
    
    def retrieve(self, query: str, k: int = 5) -> List[str]:
        return self.results_map.get(query, [])[:k]
`,
    complexity: {
      time: "O(T * R) for T tests with R retrieval calls",
      space: "O(T) for storing results",
    },
    realWorld: {
      description: "Continuous monitoring of retrieval quality is essential. Companies like Weights & Biases and Arize track model drift and retrieval regressions.",
      companies: ["Weights & Biases", "Arize", "Datadog"],
      useCases: ["Model updates", "Embedding model changes", "Index rebuilds"],
    },
    prerequisites: ["rag-unit-tests", "recall-at-k"],
    relatedPlaybooks: ["rag-evaluation-suite", "rag-troubleshooting-guide"],
  },
];
