import type { RawChallenge } from "@/lib/challenges/types";

export const bleuRougeScoresChallenge: RawChallenge = {
  slug: "bleu-rouge-scores",
  title: "BLEU and ROUGE Score Implementation",
  difficulty: "medium",
  xpReward: 200,
  group: "RAG Evaluation",
  description:
    "Goal: Implement BLEU and ROUGE metrics for evaluating generated text against references. Why: These classic NLG metrics measure n-gram overlap - BLEU for precision (machine translation), ROUGE for recall (summarization). Production impact: Essential for evaluating RAG answer quality against ground truth datasets.",
  prerequisites: ["faithfulness-calculator"],
  starterCode: `# BLEU and ROUGE Score Implementation
# Classic NLG metrics for comparing generated text to references

from collections import Counter
import math

def get_ngrams(text: str, n: int) -> list[tuple[str, ...]]:
    """
    Extract n-grams from text.
    
    Example:
        text = "the cat sat"
        n = 2
        Returns: [("the", "cat"), ("cat", "sat")]
    """
    # TODO: Tokenize and extract n-grams
    pass


def modified_precision(
    candidate: str,
    reference: str,
    n: int
) -> float:
    """
    Calculate modified precision for BLEU.
    
    Modified precision clips n-gram counts by reference max.
    Formula: sum(min(count_cand, count_ref)) / total_cand_ngrams
    """
    # TODO: Implement modified precision with clipping
    pass


def brevity_penalty(candidate: str, reference: str) -> float:
    """
    Calculate BLEU brevity penalty.
    
    Penalizes candidates shorter than reference.
    BP = 1 if cand >= ref, else exp(1 - ref_len/cand_len)
    """
    # TODO: Calculate brevity penalty
    pass


def bleu_score(
    candidate: str,
    reference: str,
    max_n: int = 4,
    weights: list[float] | None = None
) -> float:
    """
    Calculate BLEU score.
    
    BLEU = BP * exp(sum(w_i * log(p_i)))
    """
    # TODO: Calculate BLEU score
    pass


def rouge_n(
    candidate: str,
    reference: str,
    n: int = 1
) -> dict[str, float]:
    """
    Calculate ROUGE-N scores.
    
    Returns precision, recall, and F1.
    """
    # TODO: Calculate ROUGE-N scores
    pass


def rouge_l(candidate: str, reference: str) -> dict[str, float]:
    """
    Calculate ROUGE-L using Longest Common Subsequence.
    """
    # TODO: Calculate ROUGE-L using LCS
    pass


def lcs_length(s1: str, s2: str) -> int:
    """Calculate length of longest common subsequence."""
    words1 = s1.lower().split()
    words2 = s2.lower().split()
    
    m, n = len(words1), len(words2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if words1[i-1] == words2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
`,
  testCode: `# Test get_ngrams
ngrams = get_ngrams("the cat sat", 2)
assert ngrams == [("the", "cat"), ("cat", "sat")], f"Got {ngrams}"

unigrams = get_ngrams("hello world", 1)
assert unigrams == [("hello",), ("world",)]

# Test modified precision
mp = modified_precision("the the the", "the cat sat", 1)
assert abs(mp - 1/3) < 0.01, f"Expected 0.33, got {mp}"

mp2 = modified_precision("the cat sat on mat", "the cat sat on the mat", 1)
assert mp2 > 0.8, f"Expected high precision, got {mp2}"

# Test brevity penalty
bp = brevity_penalty("short", "this is a longer reference")
assert bp < 1.0, "Should penalize short candidates"

bp_equal = brevity_penalty("same length text here", "same length text here")
assert abs(bp_equal - 1.0) < 0.01, "No penalty for equal length"

# Test BLEU score
cand = "the cat sat on mat"
ref = "the cat sat on the mat"
bleu = bleu_score(cand, ref, max_n=2)
assert 0.5 < bleu < 1.0, f"Expected moderate BLEU, got {bleu}"

# Test ROUGE-1
rouge = rouge_n("the cat sat on mat", "the cat sat on the mat", n=1)
assert "recall" in rouge and "precision" in rouge and "f1" in rouge
assert rouge["recall"] > 0.8, f"Expected high recall, got {rouge['recall']}"

# Test ROUGE-2
rouge2 = rouge_n("the cat sat on mat", "the cat sat on the mat", n=2)
assert rouge2["recall"] > 0.5

# Test ROUGE-L  
rouge_l_scores = rouge_l("the cat sat", "the cat sat on mat")
assert rouge_l_scores["recall"] > 0.8

print("All tests passed!")`,
  solution: `from collections import Counter
import math

def get_ngrams(text: str, n: int) -> list[tuple[str, ...]]:
    words = text.lower().split()
    if len(words) < n:
        return []
    return [tuple(words[i:i+n]) for i in range(len(words) - n + 1)]


def modified_precision(
    candidate: str,
    reference: str,
    n: int
) -> float:
    cand_ngrams = get_ngrams(candidate, n)
    ref_ngrams = get_ngrams(reference, n)
    
    if not cand_ngrams:
        return 0.0
    
    cand_counts = Counter(cand_ngrams)
    ref_counts = Counter(ref_ngrams)
    
    clipped_count = 0
    for ngram, count in cand_counts.items():
        clipped_count += min(count, ref_counts.get(ngram, 0))
    
    return clipped_count / len(cand_ngrams)


def brevity_penalty(candidate: str, reference: str) -> float:
    cand_len = len(candidate.split())
    ref_len = len(reference.split())
    
    if cand_len >= ref_len:
        return 1.0
    
    return math.exp(1 - ref_len / cand_len)


def bleu_score(
    candidate: str,
    reference: str,
    max_n: int = 4,
    weights: list[float] | None = None
) -> float:
    if weights is None:
        weights = [1.0 / max_n] * max_n
    
    precisions = []
    for n in range(1, max_n + 1):
        p = modified_precision(candidate, reference, n)
        precisions.append(p)
    
    log_sum = 0
    for w, p in zip(weights, precisions):
        if p > 0:
            log_sum += w * math.log(p)
        else:
            log_sum += w * math.log(1e-10)
    
    bp = brevity_penalty(candidate, reference)
    
    return bp * math.exp(log_sum)


def rouge_n(
    candidate: str,
    reference: str,
    n: int = 1
) -> dict[str, float]:
    cand_ngrams = get_ngrams(candidate, n)
    ref_ngrams = get_ngrams(reference, n)
    
    if not cand_ngrams or not ref_ngrams:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
    
    cand_set = set(cand_ngrams)
    ref_set = set(ref_ngrams)
    
    overlap = len(cand_set & ref_set)
    
    precision = overlap / len(cand_ngrams)
    recall = overlap / len(ref_ngrams)
    
    if precision + recall == 0:
        f1 = 0.0
    else:
        f1 = 2 * precision * recall / (precision + recall)
    
    return {"precision": precision, "recall": recall, "f1": f1}


def lcs_length(s1: str, s2: str) -> int:
    words1 = s1.lower().split()
    words2 = s2.lower().split()
    
    m, n = len(words1), len(words2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if words1[i-1] == words2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]


def rouge_l(candidate: str, reference: str) -> dict[str, float]:
    lcs = lcs_length(candidate, reference)
    
    cand_len = len(candidate.split())
    ref_len = len(reference.split())
    
    if cand_len == 0 or ref_len == 0:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
    
    precision = lcs / cand_len
    recall = lcs / ref_len
    
    if precision + recall == 0:
        f1 = 0.0
    else:
        f1 = 2 * precision * recall / (precision + recall)
    
    return {"precision": precision, "recall": recall, "f1": f1}
`,
  hints: [
    "get_ngrams: split text, use list comprehension with sliding window",
    "modified_precision: use Counter to count n-grams, then clip with min()",
    "brevity_penalty: exp(1 - ref_len/cand_len) when candidate is shorter",
    "BLEU combines weighted log of precisions with brevity penalty",
    "ROUGE is recall-focused: overlap / reference_ngrams",
  ],
  realWorld: {
    description: "BLEU and ROUGE are foundational NLG metrics used across all text generation tasks - machine translation, summarization, and RAG evaluation.",
    companies: ["Google", "Microsoft", "Hugging Face", "OpenAI"],
    useCases: [
      "Machine translation evaluation",
      "Summarization quality",
      "RAG answer comparison",
    ],
  },
  timeEstimate: { minutes: 30, label: "25-35 min" },
};
