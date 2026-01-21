import type { RawChallenge } from "@/lib/challenges/types";

export const ADVANCED_RETRIEVAL_CHALLENGES: RawChallenge[] = [
  {
    slug: "parent-document-tokenizer",
    title: "Parent Document Retrieval",
    description:
      "Retrieve small chunks for precision, but feed the 'parent' window to the LLM for context coherence.",
    group: "Phase 4 — Advanced Systems & Agents",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict

def get_parent_context(
    hit_chunk_index: int, 
    all_chunks: List[str], 
    window_expansion: int = 1
) -> str:
    """
    Given the index of a retrieved chunk, return the merged text of 
    [index - window, ..., index + window].
    
    Rules:
    - Handle boundary conditions (don't go < 0 or > len).
    - Join chunks with a space.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `chunks = ["Intro.", "Part A.", "Part B.", "Part C.", "Conclusion."]

# Normal case (window=1)
assert get_parent_context(2, chunks, 1) == "Part A. Part B. Part C."

# Start boundary
assert get_parent_context(0, chunks, 1) == "Intro. Part A."

# End boundary
assert get_parent_context(4, chunks, 1) == "Part C. Conclusion."

print("All tests passed!")`,
    hints: [
      "Use python slice notation `list[start:end]`.",
      "Remember that slice end index is exclusive.",
      "Check `max(0, ...)` and `min(len, ...)`.",
    ],
    solution: `from typing import List, Dict

def get_parent_context(
    hit_chunk_index: int, 
    all_chunks: List[str], 
    window_expansion: int = 1
) -> str:
    start = max(0, hit_chunk_index - window_expansion)
    end = min(len(all_chunks), hit_chunk_index + window_expansion + 1)
    return " ".join(all_chunks[start:end])
`,
    realWorld: {
        description: "The 'Golden Standard' for long-form RAG. Smaller chunks (128-256 tokens) are better for semantic retrieval, but the LLM needs the full surrounding context (1024+ tokens) to answer correctly without hallucinating.",
        companies: ["MongoDB (Atlas Vector)", "LangChain"],
        useCases: ["Legal Contract Analysis", "Technical Manual Application"],
    },
    prerequisites: ["simple-chunking"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "document-parsing-guide"],
  },
  {
    slug: "recursive-retrieval",
    title: "Recursive Retrieval (Summary -> Chunk)",
    description:
      "Embed document summaries for high-level semantic search, then map to granular chunks for precision.",
    group: "Phase 4 — Advanced Systems & Agents",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Dict

def retrieve_recursive(
    query: str, 
    summaries: Dict[str, str], 
    mapping: Dict[str, List[str]]
) -> List[str]:
    """
    1. 'Search' the summaries to find the best matching summary ID.
       (For this exercise, simulate search by finding the summary with the highest 
        word overlap with query).
    2. Look up the granular chunks linked to that summary ID in 'mapping'.
    3. Return those granular chunks.
    """
    # TODO: implement word overlap search + lookup
    raise NotImplementedError
`,
    testCode: `summaries = {
    "s1": "financial report q1 apple revenue",
    "s2": "hr policy vacation holidays",
}
mapping = {
    "s1": ["chunk1: apple revenue up", "chunk2: iphones sold well"],
    "s2": ["chunk3: 20 days off", "chunk4: dec 25 is holiday"],
}

# Query matches s2 ("vacation")
out = retrieve_recursive("i need a vacation", summaries, mapping)
assert "chunk3: 20 days off" in out

# Query matches s1 ("revenue")
out2 = retrieve_recursive("what is the revenue", summaries, mapping)
assert "chunk1: apple revenue up" in out2

print("All tests passed!")`,
    hints: [
      "Iterate over summaries.items().",
      "Count tokens in common with query.",
      "Pick best summary_id, return mapping[summary_id].",
    ],
    solution: `from typing import List, Dict
import re

def retrieve_recursive(
    query: str, 
    summaries: Dict[str, str], 
    mapping: Dict[str, List[str]]
) -> List[str]:
    def tokenize(text: str) -> set:
        return set(re.findall(r'[a-z0-9]+', text.lower()))
    
    query_tokens = tokenize(query)
    
    best_id = None
    best_score = -1
    
    for summary_id, summary_text in summaries.items():
        summary_tokens = tokenize(summary_text)
        overlap = len(query_tokens & summary_tokens)
        if overlap > best_score:
            best_score = overlap
            best_id = summary_id
    
    if best_id is None:
        return []
    
    return mapping.get(best_id, [])
`,
    realWorld: {
        description: "Standard technique for 'Needle in a Haystack' problems. By searching summaries first, you avoid noise from tiny, irrelevant chunks that might 'accidentally' match a query keyword.",
        companies: ["Uber", "Pinterest"],
        useCases: ["Enterprise Knowledge Graphs", "Multi-Document Summarization"],
    },
    prerequisites: ["basic-retrieval", "simple-chunking"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
];
