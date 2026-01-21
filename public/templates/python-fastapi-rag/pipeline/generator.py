"""
Answer generation with citations and grounding.
"""

import os
import re
from typing import Optional

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_answer(
    query: str,
    context: list[dict],
    system_prompt: Optional[str] = None,
    max_tokens: int = 1024,
) -> tuple[str, list[dict]]:
    """
    Generate an answer grounded in the retrieved context.
    
    Args:
        query: User question
        context: Retrieved and reranked chunks
        system_prompt: Optional custom system prompt
        max_tokens: Max tokens for response
    
    Returns:
        Tuple of (answer, sources)
    """
    if not context:
        return "I couldn't find relevant information to answer your question.", []
    
    # Build context string with citations
    context_parts = []
    for i, chunk in enumerate(context):
        source = chunk.get("source", "unknown")
        text = chunk.get("text", "")
        context_parts.append(f"[{i+1}] Source: {source}\n{text}")
    
    context_str = "\n\n---\n\n".join(context_parts)
    
    # Default system prompt with grounding instructions
    if system_prompt is None:
        system_prompt = """You are a helpful assistant that answers questions based on provided context.

RULES:
1. Only use information from the provided context
2. If the context doesn't contain the answer, say "I don't have enough information to answer that"
3. Cite your sources using [1], [2], etc.
4. Be concise and direct
5. If you're uncertain, express that uncertainty"""
    
    # User message with context
    user_message = f"""Context:
{context_str}

Question: {query}

Provide a clear, cited answer based on the context above."""
    
    response = client.chat.completions.create(
        model=os.getenv("GENERATION_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=max_tokens,
    )
    
    answer = response.choices[0].message.content
    
    # Extract sources that were actually cited
    cited_indices = set(int(m) for m in re.findall(r'\[(\d+)\]', answer))
    sources = []
    for i, chunk in enumerate(context):
        if (i + 1) in cited_indices:
            sources.append({
                "index": i + 1,
                "source": chunk.get("source", "unknown"),
                "text_preview": chunk.get("text", "")[:200],
            })
    
    return answer, sources


# ─────────────────────────────────────────────────────────────
# Advanced generation patterns
# ─────────────────────────────────────────────────────────────


def generate_with_cot(
    query: str,
    context: list[dict],
) -> tuple[str, list[dict], str]:
    """
    Generate with Chain-of-Thought reasoning.
    
    Returns the answer, sources, and reasoning trace.
    """
    context_str = "\n\n".join([
        f"[{i+1}] {c.get('text', '')}"
        for i, c in enumerate(context)
    ])
    
    prompt = f"""Context:
{context_str}

Question: {query}

Think step by step:
1. What information in the context is relevant?
2. How do the pieces fit together?
3. What is the answer based on this evidence?

After your reasoning, provide your final answer starting with "ANSWER:"""
    
    response = client.chat.completions.create(
        model=os.getenv("GENERATION_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500,
    )
    
    full_response = response.choices[0].message.content
    
    # Split reasoning and answer
    if "ANSWER:" in full_response:
        reasoning, answer = full_response.split("ANSWER:", 1)
        answer = answer.strip()
    else:
        reasoning = ""
        answer = full_response
    
    # Extract cited sources
    cited_indices = set(int(m) for m in re.findall(r'\[(\d+)\]', answer))
    sources = [
        {"index": i + 1, "source": c.get("source", "unknown")}
        for i, c in enumerate(context)
        if (i + 1) in cited_indices
    ]
    
    return answer, sources, reasoning.strip()


def generate_streaming(
    query: str,
    context: list[dict],
):
    """
    Generate answer with streaming output.
    
    Yields chunks of the response as they're generated.
    """
    context_str = "\n\n".join([
        f"[{i+1}] Source: {c.get('source', 'unknown')}\n{c.get('text', '')}"
        for i, c in enumerate(context)
    ])
    
    system_prompt = """Answer based on the provided context. Cite sources using [1], [2], etc."""
    user_message = f"Context:\n{context_str}\n\nQuestion: {query}"
    
    stream = client.chat.completions.create(
        model=os.getenv("GENERATION_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        stream=True,
    )
    
    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


# ─────────────────────────────────────────────────────────────
# Citation validation
# ─────────────────────────────────────────────────────────────


def validate_citations(
    answer: str,
    context: list[dict],
) -> dict:
    """
    Validate that citations in the answer are supported by context.
    
    Returns validation results including any unsupported claims.
    """
    # Extract claims with citations
    citation_pattern = r'([^.!?]+\[\d+\][^.!?]*[.!?])'
    cited_claims = re.findall(citation_pattern, answer)
    
    validation_results = {
        "total_claims": len(cited_claims),
        "validated": [],
        "unvalidated": [],
    }
    
    for claim in cited_claims:
        # Extract citation numbers
        citations = [int(m) for m in re.findall(r'\[(\d+)\]', claim)]
        
        # Check if the cited context supports the claim
        # (Simplified check - production would use entailment models)
        for cite_num in citations:
            if 0 < cite_num <= len(context):
                source_text = context[cite_num - 1].get("text", "").lower()
                claim_keywords = set(claim.lower().split()) - {"the", "a", "an", "is", "are", "was", "were"}
                
                # Simple keyword overlap check
                overlap = sum(1 for kw in claim_keywords if kw in source_text)
                if overlap >= 3:
                    validation_results["validated"].append(claim)
                else:
                    validation_results["unvalidated"].append(claim)
    
    return validation_results
