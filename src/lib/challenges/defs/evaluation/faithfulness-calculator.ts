import type { RawChallenge } from "@/lib/challenges/types";

export const faithfulnessCalculatorChallenge: RawChallenge = {
  slug: "faithfulness-calculator",
  title: "Faithfulness Score Calculator",
  difficulty: "medium",
  xpReward: 175,
  group: "RAG Evaluation",
  description:
    "Goal: Calculate the faithfulness score by checking if generated claims can be inferred from context. Why: Faithfulness measures how well an answer is grounded in the source context - the key metric for detecting hallucinations. Production impact: Every RAG system needs faithfulness monitoring to ensure responses don't make claims unsupported by retrieved documents.",
  prerequisites: ["answer-relevancy-evaluator"],
  starterCode: `# Faithfulness Score Calculator
# Measure how well an answer is grounded in the context

from dataclasses import dataclass

@dataclass
class Claim:
    text: str
    is_supported: bool | None = None

@dataclass
class FaithfulnessResult:
    score: float
    claims: list[Claim]
    supported_count: int
    total_count: int


def extract_claims(answer: str) -> list[str]:
    """
    Extract atomic claims from an answer.
    
    An atomic claim is a single, verifiable statement.
    
    Example:
        Answer: "Einstein was born in Germany on March 14, 1879."
        Claims: [
            "Einstein was born in Germany",
            "Einstein was born on March 14, 1879"
        ]
    
    Args:
        answer: The generated answer text
        
    Returns:
        List of atomic claim strings
    """
    # TODO: Split answer into atomic claims
    pass


def verify_claim(claim: str, context: str) -> bool:
    """
    Verify if a claim can be inferred from the context.
    
    A claim is supported if key terms appear in context
    and numbers (if any) match.
    
    Args:
        claim: The claim to verify
        context: The source context
        
    Returns:
        True if claim is supported, False otherwise
    """
    # TODO: Check if claim can be inferred from context
    pass


def calculate_faithfulness(
    answer: str,
    context: str
) -> FaithfulnessResult:
    """
    Calculate the faithfulness score for an answer.
    
    Faithfulness = (supported claims) / (total claims)
    
    Args:
        answer: The generated answer
        context: The source context used for generation
        
    Returns:
        FaithfulnessResult with score and claim details
    """
    # TODO: Extract claims, verify each, calculate score
    pass
`,
  testCode: `# Test claim extraction
answer1 = "Einstein was born in Germany on March 14, 1879."
claims1 = extract_claims(answer1)
assert len(claims1) >= 2, f"Should extract at least 2 claims, got {len(claims1)}"

answer2 = "Paris is the capital of France and has a population of 2 million."
claims2 = extract_claims(answer2)
assert len(claims2) >= 2, f"Should extract at least 2 claims, got {len(claims2)}"

# Test claim verification
context = "Albert Einstein (born 14 March 1879) was a German-born theoretical physicist."

# Should be supported
supported = verify_claim("Einstein was born in Germany", context)
assert supported == True, "Claim should be supported"

# Should not be supported (wrong date)
not_supported = verify_claim("Einstein was born on March 20, 1879", context)
assert not_supported == False, "Claim should NOT be supported (wrong date)"

# Test full faithfulness calculation
high_faithful_answer = "Einstein was a German-born physicist."
result1 = calculate_faithfulness(high_faithful_answer, context)
assert result1.score >= 0.8, f"Expected high faithfulness, got {result1.score}"

low_faithful_answer = "Einstein was born in France and invented the telephone."
result2 = calculate_faithfulness(low_faithful_answer, context)
assert result2.score < 0.5, f"Expected low faithfulness, got {result2.score}"

# Test edge cases
empty_result = calculate_faithfulness("", context)
assert empty_result.score == 1.0 or empty_result.total_count == 0

print("All tests passed!")`,
  solution: `from dataclasses import dataclass
import re

@dataclass
class Claim:
    text: str
    is_supported: bool | None = None

@dataclass
class FaithfulnessResult:
    score: float
    claims: list[Claim]
    supported_count: int
    total_count: int


def extract_claims(answer: str) -> list[str]:
    if not answer.strip():
        return []
    
    sentences = re.split(r'[.!?]+', answer)
    
    claims = []
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        parts = re.split(r'\\s+and\\s+|,\\s*(?=\\w+\\s+(?:is|was|were|has|have|are))', sentence)
        
        for part in parts:
            part = part.strip()
            if len(part.split()) >= 3:
                claims.append(part)
    
    if not claims and answer.strip():
        claims = [answer.strip()]
    
    return claims


def verify_claim(claim: str, context: str) -> bool:
    claim_lower = claim.lower()
    context_lower = context.lower()
    
    claim_words = set(claim_lower.split())
    context_words = set(context_lower.split())
    
    stopwords = {"the", "a", "an", "is", "was", "were", "are", "in", "on", "at", 
                 "to", "of", "and", "or", "that", "this", "he", "she", "it"}
    claim_words -= stopwords
    context_words -= stopwords
    
    if not claim_words:
        return True
    
    overlap = claim_words & context_words
    overlap_ratio = len(overlap) / len(claim_words)
    
    claim_numbers = set(re.findall(r'\\d+', claim))
    context_numbers = set(re.findall(r'\\d+', context))
    
    if claim_numbers:
        numbers_match = claim_numbers <= context_numbers
    else:
        numbers_match = True
    
    return overlap_ratio >= 0.5 and numbers_match


def calculate_faithfulness(
    answer: str,
    context: str
) -> FaithfulnessResult:
    claim_texts = extract_claims(answer)
    
    if not claim_texts:
        return FaithfulnessResult(
            score=1.0,
            claims=[],
            supported_count=0,
            total_count=0
        )
    
    claims = []
    supported_count = 0
    
    for claim_text in claim_texts:
        is_supported = verify_claim(claim_text, context)
        claims.append(Claim(text=claim_text, is_supported=is_supported))
        if is_supported:
            supported_count += 1
    
    score = supported_count / len(claims)
    
    return FaithfulnessResult(
        score=score,
        claims=claims,
        supported_count=supported_count,
        total_count=len(claims)
    )
`,
  hints: [
    "For extract_claims, use regex to split on 'and', commas, and sentence boundaries",
    "verify_claim should check for key term overlap and number consistency",
    "calculate_faithfulness = supported_claims / total_claims",
    "Handle edge case of empty answer (return score 1.0 or 0 claims)",
  ],
  realWorld: {
    description: "Faithfulness is the most critical metric for RAG systems - ensuring answers are grounded in sources. Used in RAGAS, DeepEval, and TruLens.",
    companies: ["RAGAS", "DeepEval", "TruLens", "Anthropic"],
    useCases: [
      "Hallucination detection",
      "QA quality assurance",
      "Automated fact-checking",
    ],
  },
  timeEstimate: { minutes: 25, label: "20-30 min" },
};
