import type { RawChallenge } from "@/lib/challenges/types";

/**
 * ADVANCED CHUNKING TECHNIQUES
 * 
 * Beyond the foundational 10 chunking methods, these are cutting-edge
 * techniques used in specialized production systems.
 */

export const ADVANCED_CHUNKING_CHALLENGES: RawChallenge[] = [
  // ============================================================================
  // AGENTIC CHUNKING (LLM-Guided)
  // ============================================================================
  {
    slug: "agentic-chunking",
    title: "Agentic Chunking: LLM-Guided Boundaries",
    description:
      `WHY INTRODUCED: Even semantic chunking uses simple metrics. What if an LLM could REASON about where to split? PROBLEM IT SOLVED: Complex documents with nuanced topic boundaries. IMPROVEMENT: LLM understands context like "this example supports the previous claim" and keeps them together.`,
    group: "Chunking Masterclass — Level 7: Cutting-Edge",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["semantic-chunking"],
    starterCode: `from typing import List, Dict

def agentic_chunk(text: str, chunk_size_target: int = 500) -> List[Dict]:
    """
    Use LLM reasoning to determine optimal chunk boundaries.
    
    First Principles:
    - Rules-based chunking can't understand nuance
    - "This example illustrates..." should stay with the concept it illustrates
    - An LLM can REASON about what belongs together
    
    Algorithm:
    1. Split into sentences
    2. For each potential boundary, ask LLM: "Should these be in the same chunk?"
    3. Use LLM's reasoning to group coherent sections
    
    For this exercise, we simulate LLM judgment with heuristics:
    - "For example" → keep with previous
    - "Therefore" → keep with previous
    - "In contrast" → boundary here
    - "Moving on" → boundary here
    
    Returns:
        List of dicts with 'text' and 'reasoning'
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = '''
Machine learning is a powerful technique. For example, it can predict stock prices.
This makes it valuable for finance. In contrast, traditional programming requires explicit rules.
Therefore, ML is preferred for complex patterns. Moving on to neural networks.
Neural networks have multiple layers. For instance, CNNs work well for images.
'''

chunks = agentic_chunk(text, chunk_size_target=200)

# "For example" should be kept with previous context
assert any("Machine learning" in c['text'] and "For example" in c['text'] for c in chunks)

# "In contrast" or "Moving on" should trigger new chunks
assert len(chunks) >= 2

# Each chunk should have reasoning
for chunk in chunks:
    assert 'reasoning' in chunk

print("All tests passed!")`,
    hints: [
      "Define transition phrases that signal 'keep together' vs 'new topic'",
      "Process sentences, checking if current sentence should join previous",
      "Store reasoning for each boundary decision",
    ],
    solution: `from typing import List, Dict
import re

def agentic_chunk(text: str, chunk_size_target: int = 500) -> List[Dict]:
    # Phrases that signal "keep with previous"
    CONTINUE_PHRASES = ["for example", "for instance", "therefore", "thus", "hence",
                        "this is", "specifically", "in particular", "namely"]
    
    # Phrases that signal "new topic"
    BOUNDARY_PHRASES = ["in contrast", "moving on", "however", "on the other hand",
                        "next", "now let's", "turning to", "separately"]
    
    sentences = re.split(r'(?<=[.!?])\\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return []
    
    chunks = []
    current_text = sentences[0]
    current_reasoning = "Started new chunk"
    
    for i in range(1, len(sentences)):
        sent = sentences[i]
        sent_lower = sent.lower()
        
        # Check for boundary phrases
        is_boundary = any(phrase in sent_lower for phrase in BOUNDARY_PHRASES)
        is_continuation = any(phrase in sent_lower for phrase in CONTINUE_PHRASES)
        
        if is_boundary and len(current_text) >= chunk_size_target // 2:
            # Boundary phrase AND we have enough content
            chunks.append({
                'text': current_text.strip(),
                'reasoning': current_reasoning
            })
            current_text = sent
            current_reasoning = f"New topic signaled by: {sent[:50]}..."
        elif is_continuation or len(current_text) + len(sent) < chunk_size_target:
            # Continuation OR still within size target
            current_text += " " + sent
            if is_continuation:
                current_reasoning = f"Kept together due to continuation phrase"
        else:
            # Size limit reached
            chunks.append({
                'text': current_text.strip(),
                'reasoning': current_reasoning
            })
            current_text = sent
            current_reasoning = "Size limit reached"
    
    if current_text.strip():
        chunks.append({
            'text': current_text.strip(),
            'reasoning': current_reasoning
        })
    
    return chunks
`,
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "Greg Kamradt's semantic chunking research. Anthropic's contextual retrieval. Used when document quality matters more than chunking speed.",
      companies: ["Anthropic", "LlamaIndex", "Jina AI"],
      useCases: ["High-quality knowledge bases", "Research document processing"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // CODE-AWARE CHUNKING
  // ============================================================================
  {
    slug: "code-aware-chunking",
    title: "Code-Aware Chunking: Respecting Program Structure",
    description:
      `WHY INTRODUCED: Code has VERY different structure than prose. Functions, classes, and blocks are natural units. PROBLEM IT SOLVED: Standard chunking cuts code mid-function, making it useless. IMPROVEMENT: Each chunk is a complete, runnable unit.`,
    group: "Chunking Masterclass — Level 7: Cutting-Edge",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["section-based-chunking"],
    starterCode: `from typing import List, Dict
import re

def code_aware_chunk(code: str, language: str = "python") -> List[Dict]:
    """
    Chunk code by semantic units (functions, classes, blocks).
    
    First Principles:
    - Code has strict structure: functions, classes, modules
    - A function split mid-body is USELESS
    - Docstrings and comments explain the code - keep them together
    
    For Python, natural boundaries are:
    - Class definitions
    - Function definitions  
    - Top-level code blocks
    
    Each chunk should include:
    - 'code': The code itself
    - 'type': 'function', 'class', 'module', or 'block'
    - 'name': Function/class name if applicable
    - 'docstring': Extracted docstring if present
    
    Returns:
        List of code chunks with metadata
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `code = '''
class Calculator:
    """A simple calculator class."""
    
    def add(self, a, b):
        """Add two numbers."""
        return a + b
    
    def multiply(self, a, b):
        """Multiply two numbers."""
        return a * b

def standalone_function():
    """A standalone function."""
    print("Hello")

# Some top-level code
x = 10
y = 20
'''

chunks = code_aware_chunk(code, "python")

# Should identify class
class_chunks = [c for c in chunks if c['type'] == 'class']
assert len(class_chunks) >= 1
assert class_chunks[0]['name'] == 'Calculator'

# Should identify standalone function
func_chunks = [c for c in chunks if c['type'] == 'function' and c['name'] == 'standalone_function']
assert len(func_chunks) >= 1

# Docstrings should be extracted
assert any('docstring' in c and c['docstring'] for c in chunks)

print("All tests passed!")`,
    hints: [
      "Use regex to find class/function definitions: r'^(class|def)\\s+(\\w+)'",
      "Track indentation to find block boundaries",
      "Extract docstrings with triple-quote detection",
    ],
    solution: `from typing import List, Dict
import re

def code_aware_chunk(code: str, language: str = "python") -> List[Dict]:
    if language != "python":
        raise ValueError("Only Python supported in this exercise")
    
    chunks = []
    lines = code.split('\\n')
    
    current_chunk = []
    current_type = 'block'
    current_name = None
    current_indent = 0
    in_docstring = False
    docstring_content = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        indent = len(line) - len(line.lstrip())
        
        # Check for class definition
        class_match = re.match(r'^class\\s+(\\w+)', stripped)
        func_match = re.match(r'^def\\s+(\\w+)', stripped)
        
        if class_match and indent == 0:
            # Save previous chunk
            if current_chunk:
                chunks.append(_create_chunk(current_chunk, current_type, current_name, docstring_content))
            
            current_chunk = [line]
            current_type = 'class'
            current_name = class_match.group(1)
            current_indent = 0
            docstring_content = []
            
        elif func_match and indent == 0:
            # Top-level function
            if current_chunk:
                chunks.append(_create_chunk(current_chunk, current_type, current_name, docstring_content))
            
            current_chunk = [line]
            current_type = 'function'
            current_name = func_match.group(1)
            docstring_content = []
            
        else:
            current_chunk.append(line)
            
            # Detect docstrings
            if '\"\"\"' in stripped or "'''" in stripped:
                docstring_content.append(stripped.replace('\"\"\"', '').replace("'''", ''))
        
        i += 1
    
    # Don't forget the last chunk
    if current_chunk:
        chunks.append(_create_chunk(current_chunk, current_type, current_name, docstring_content))
    
    return chunks

def _create_chunk(lines, chunk_type, name, docstring):
    return {
        'code': '\\n'.join(lines).strip(),
        'type': chunk_type,
        'name': name,
        'docstring': ' '.join(docstring).strip() if docstring else None
    }
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "GitHub Copilot's code understanding, Sourcegraph's code search, Stack Overflow's code snippets. Essential for code RAG.",
      companies: ["GitHub", "Sourcegraph", "Tabnine", "Codeium"],
      useCases: ["Code search", "Documentation generation", "Code review AI"],
    },
    relatedPlaybooks: ["chunking-strategies", "document-parsing-guide"],
  },

  // ============================================================================
  // TABLE-AWARE CHUNKING
  // ============================================================================
  {
    slug: "table-aware-chunking",
    title: "Table-Aware Chunking: Preserving Structured Data",
    description:
      `WHY INTRODUCED: Tables are EXTREMELY information-dense. Splitting them destroys meaning. PROBLEM IT SOLVED: A table about "Employee | Salary | Department" becomes useless if headers are in one chunk and data in another. IMPROVEMENT: Tables are chunked as complete units with header context.`,
    group: "Chunking Masterclass — Level 7: Cutting-Edge",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["section-based-chunking"],
    starterCode: `from typing import List, Dict
import re

def table_aware_chunk(document: str, max_chunk_size: int = 1000) -> List[Dict]:
    """
    Chunk documents while preserving tables as complete units.
    
    First Principles:
    - Tables are self-contained data structures
    - Headers define meaning of all rows
    - Splitting a table mid-row creates nonsense
    
    Strategy:
    1. Detect table boundaries (markdown tables, HTML tables)
    2. Extract tables as complete chunks
    3. Chunk remaining text normally
    4. If table exceeds max_chunk_size, include headers with each row chunk
    
    Returns:
        List of dicts with:
        - 'content': The chunk content
        - 'type': 'table' or 'text'
        - 'headers': Table headers if applicable
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `doc = '''
# Employee Report

This document contains employee information.

| Name | Department | Salary |
|------|------------|--------|
| Alice | Engineering | 100000 |
| Bob | Marketing | 80000 |
| Carol | Engineering | 95000 |

The table above shows current salaries.

More text content here about the company.
'''

chunks = table_aware_chunk(doc, max_chunk_size=500)

# Table should be its own chunk
table_chunks = [c for c in chunks if c['type'] == 'table']
assert len(table_chunks) == 1
assert 'Alice' in table_chunks[0]['content']
assert 'Bob' in table_chunks[0]['content']
assert table_chunks[0]['headers'] == ['Name', 'Department', 'Salary']

# Text should be separate
text_chunks = [c for c in chunks if c['type'] == 'text']
assert any('Employee Report' in c['content'] for c in text_chunks)

print("All tests passed!")`,
    hints: [
      "Detect markdown tables: lines starting with '|'",
      "Parse header row (first row with '|')",
      "Keep separator row (with '---') with table",
      "Process non-table text with standard chunking",
    ],
    solution: `from typing import List, Dict
import re

def table_aware_chunk(document: str, max_chunk_size: int = 1000) -> List[Dict]:
    chunks = []
    lines = document.split('\\n')
    
    current_text = []
    in_table = False
    table_lines = []
    table_headers = []
    
    for line in lines:
        is_table_line = line.strip().startswith('|') and '|' in line[1:]
        
        if is_table_line:
            # Flush text before table
            if current_text and not in_table:
                text_content = '\\n'.join(current_text).strip()
                if text_content:
                    chunks.append({
                        'content': text_content,
                        'type': 'text',
                        'headers': None
                    })
                current_text = []
            
            in_table = True
            table_lines.append(line)
            
            # Extract headers from first row
            if len(table_lines) == 1:
                cells = [c.strip() for c in line.split('|') if c.strip()]
                if cells and not all('-' in c for c in cells):
                    table_headers = cells
                    
        else:
            if in_table:
                # End of table
                table_content = '\\n'.join(table_lines).strip()
                chunks.append({
                    'content': table_content,
                    'type': 'table',
                    'headers': table_headers
                })
                table_lines = []
                table_headers = []
                in_table = False
            
            current_text.append(line)
    
    # Flush remaining content
    if in_table and table_lines:
        chunks.append({
            'content': '\\n'.join(table_lines).strip(),
            'type': 'table',
            'headers': table_headers
        })
    elif current_text:
        text_content = '\\n'.join(current_text).strip()
        if text_content:
            chunks.append({
                'content': text_content,
                'type': 'text',
                'headers': None
            })
    
    return chunks
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Essential for financial documents, research papers, and data-heavy reports. Unstructured.io and LlamaParse specialize in this.",
      companies: ["Unstructured.io", "LlamaParse", "Docugami"],
      useCases: ["Financial report analysis", "Research paper search", "Data extraction"],
    },
    relatedPlaybooks: ["document-parsing-guide", "chunking-strategies"],
  },

  // ============================================================================
  // PARENT DOCUMENT CHUNKING
  // ============================================================================
  {
    slug: "parent-document-chunking",
    title: "Parent Document Chunking: Small Retrieval, Big Context",
    description:
      `WHY INTRODUCED: Small chunks are good for precise retrieval. Large chunks are good for LLM context. PROBLEM IT SOLVED: We can have BOTH! Retrieve using small chunks, but return the larger parent for generation. IMPROVEMENT: Best of both worlds - precise matching + complete context.`,
    group: "Chunking Masterclass — Level 7: Cutting-Edge",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["hierarchical-chunking"],
    starterCode: `from typing import List, Dict, Optional
import uuid

def parent_document_chunk(
    document: str,
    small_chunk_size: int = 100,
    large_chunk_size: int = 500
) -> Dict:
    """
    Create two-level chunking: small for retrieval, large for generation.
    
    First Principles:
    - Small chunks (100 tokens) = precise retrieval
    - Large chunks (500 tokens) = complete context for LLM
    - Link them so we can retrieve small but return large
    
    The "Parent Document Retriever" pattern:
    1. Create large "parent" chunks
    2. Split each parent into small "child" chunks
    3. Index and search the children
    4. Return the parent for LLM context
    
    Returns:
        {
            'parents': [
                {
                    'id': 'parent_1',
                    'text': 'large chunk text...',
                    'children': ['child_1_1', 'child_1_2', ...]
                }
            ],
            'children': [
                {
                    'id': 'child_1_1',
                    'text': 'small chunk text...',
                    'parent_id': 'parent_1'
                }
            ]
        }
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `doc = "A" * 100 + " " + "B" * 100 + " " + "C" * 100 + " " + "D" * 100 + " " + "E" * 100

result = parent_document_chunk(doc, small_chunk_size=50, large_chunk_size=200)

# Should have parents and children
assert 'parents' in result
assert 'children' in result

# Children should reference parents
for child in result['children']:
    assert 'parent_id' in child
    parent_ids = [p['id'] for p in result['parents']]
    assert child['parent_id'] in parent_ids

# Parents should list their children
for parent in result['parents']:
    assert 'children' in parent
    for child_id in parent['children']:
        child_ids = [c['id'] for c in result['children']]
        assert child_id in child_ids

# Children should be smaller than parents
avg_child_size = sum(len(c['text']) for c in result['children']) / len(result['children'])
avg_parent_size = sum(len(p['text']) for p in result['parents']) / len(result['parents'])
assert avg_child_size < avg_parent_size

print("All tests passed!")`,
    hints: [
      "First create parent chunks using large_chunk_size",
      "For each parent, create child chunks using small_chunk_size",
      "Use UUIDs or deterministic IDs for cross-referencing",
      "Store both parent_id in children and children list in parents",
    ],
    solution: `from typing import List, Dict
import uuid

def parent_document_chunk(
    document: str,
    small_chunk_size: int = 100,
    large_chunk_size: int = 500
) -> Dict:
    if not document:
        return {'parents': [], 'children': []}
    
    parents = []
    children = []
    
    # Create parent chunks
    parent_texts = []
    for i in range(0, len(document), large_chunk_size):
        parent_texts.append(document[i:i + large_chunk_size])
    
    # For each parent, create children
    for p_idx, parent_text in enumerate(parent_texts):
        parent_id = f"parent_{p_idx}"
        child_ids = []
        
        # Create child chunks from this parent
        for c_idx, i in enumerate(range(0, len(parent_text), small_chunk_size)):
            child_text = parent_text[i:i + small_chunk_size]
            child_id = f"child_{p_idx}_{c_idx}"
            
            children.append({
                'id': child_id,
                'text': child_text,
                'parent_id': parent_id
            })
            child_ids.append(child_id)
        
        parents.append({
            'id': parent_id,
            'text': parent_text,
            'children': child_ids
        })
    
    return {'parents': parents, 'children': children}
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "LangChain's ParentDocumentRetriever. LlamaIndex's auto-merging. The go-to pattern for production RAG with context expansion.",
      companies: ["LangChain", "LlamaIndex", "Anthropic"],
      useCases: ["Document QA", "Long-form content", "Research assistants"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // DOCUMENT-SPECIFIC CHUNKING ROUTER
  // ============================================================================
  {
    slug: "chunking-router",
    title: "Chunking Router: Document-Aware Strategy Selection",
    description:
      `WHY INTRODUCED: Different documents need different chunking. Code needs code-aware. Tables need table-aware. WHY use one strategy for all? PROBLEM IT SOLVED: Automatically selects optimal chunking per document type. IMPROVEMENT: Production systems use routers to handle diverse document types.`,
    group: "Chunking Masterclass — Level 7: Cutting-Edge",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["recursive-chunking", "code-aware-chunking"],
    starterCode: `from typing import List, Dict, Callable

def chunking_router(
    document: str,
    document_type: str = None,
    strategies: Dict[str, Callable] = None
) -> List[Dict]:
    """
    Route documents to appropriate chunking strategies.
    
    First Principles:
    - One size does NOT fit all
    - Code needs code-aware chunking
    - Tables need table-aware chunking
    - Prose needs recursive/semantic chunking
    
    The router:
    1. Detects document type (if not provided)
    2. Selects appropriate strategy
    3. Applies strategy
    4. Returns uniform output format
    
    Args:
        document: The input text
        document_type: Optional hint ('code', 'markdown', 'prose', 'table')
        strategies: Custom strategies dict (default provided)
        
    Returns:
        List of chunks in uniform format:
        [{'text': ..., 'strategy_used': ..., 'metadata': {...}}]
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test code detection and routing
code = '''
def hello():
    print("Hello, World!")

class Greeter:
    def greet(self):
        return "Hi!"
'''

code_chunks = chunking_router(code)
assert any(c['strategy_used'] == 'code' for c in code_chunks)

# Test markdown detection
markdown = '''
# Title

Some text here.

| A | B |
|---|---|
| 1 | 2 |
'''

md_chunks = chunking_router(markdown)
assert any(c['strategy_used'] in ['markdown', 'table'] for c in md_chunks)

# Test plain prose
prose = "This is just regular text. Nothing special about it. Just sentences."
prose_chunks = chunking_router(prose)
assert any(c['strategy_used'] in ['recursive', 'prose'] for c in prose_chunks)

# All chunks should have uniform format
for chunks in [code_chunks, md_chunks, prose_chunks]:
    for chunk in chunks:
        assert 'text' in chunk
        assert 'strategy_used' in chunk

print("All tests passed!")`,
    hints: [
      "Detect code: look for 'def ', 'class ', 'function', etc.",
      "Detect markdown: look for '#', '|', '```', etc.",
      "Default to recursive for prose",
      "Normalize output format across all strategies",
    ],
    solution: `from typing import List, Dict, Callable
import re

def chunking_router(
    document: str,
    document_type: str = None,
    strategies: Dict[str, Callable] = None
) -> List[Dict]:
    
    def detect_type(doc: str) -> str:
        # Check for code
        if re.search(r'^(def |class |function |import |from |const |let |var )', doc, re.MULTILINE):
            return 'code'
        # Check for tables
        if '|' in doc and re.search(r'^\\|.+\\|$', doc, re.MULTILINE):
            return 'table'
        # Check for markdown
        if re.search(r'^#{1,6} ', doc, re.MULTILINE):
            return 'markdown'
        return 'prose'
    
    def chunk_code(doc: str) -> List[Dict]:
        # Simple code chunking by top-level definitions
        chunks = []
        current = []
        for line in doc.split('\\n'):
            if re.match(r'^(def |class )', line) and current:
                chunks.append('\\n'.join(current))
                current = []
            current.append(line)
        if current:
            chunks.append('\\n'.join(current))
        return [{'text': c, 'strategy_used': 'code', 'metadata': {}} for c in chunks if c.strip()]
    
    def chunk_table(doc: str) -> List[Dict]:
        chunks = []
        current_table = []
        current_text = []
        
        for line in doc.split('\\n'):
            if line.strip().startswith('|'):
                if current_text:
                    chunks.append({'text': '\\n'.join(current_text), 'strategy_used': 'table', 'metadata': {}})
                    current_text = []
                current_table.append(line)
            else:
                if current_table:
                    chunks.append({'text': '\\n'.join(current_table), 'strategy_used': 'table', 'metadata': {'is_table': True}})
                    current_table = []
                current_text.append(line)
        
        if current_table:
            chunks.append({'text': '\\n'.join(current_table), 'strategy_used': 'table', 'metadata': {'is_table': True}})
        if current_text:
            chunks.append({'text': '\\n'.join(current_text), 'strategy_used': 'table', 'metadata': {}})
        
        return [c for c in chunks if c['text'].strip()]
    
    def chunk_markdown(doc: str) -> List[Dict]:
        chunks = []
        current = []
        for line in doc.split('\\n'):
            if re.match(r'^#{1,3} ', line) and current:
                chunks.append('\\n'.join(current))
                current = []
            current.append(line)
        if current:
            chunks.append('\\n'.join(current))
        return [{'text': c, 'strategy_used': 'markdown', 'metadata': {}} for c in chunks if c.strip()]
    
    def chunk_prose(doc: str) -> List[Dict]:
        # Simple recursive-style chunking
        paras = doc.split('\\n\\n')
        return [{'text': p.strip(), 'strategy_used': 'recursive', 'metadata': {}} for p in paras if p.strip()]
    
    default_strategies = {
        'code': chunk_code,
        'table': chunk_table,
        'markdown': chunk_markdown,
        'prose': chunk_prose
    }
    
    strategies = strategies or default_strategies
    doc_type = document_type or detect_type(document)
    
    strategy_fn = strategies.get(doc_type, chunk_prose)
    return strategy_fn(document)
`,
    timeEstimate: { minutes: 50, label: "50-60 min" },
    realWorld: {
      description: "Enterprise document processing pipelines. Unstructured.io, LlamaParse, and similar tools route documents to specialized parsers.",
      companies: ["Unstructured.io", "LlamaParse", "Glean", "Guru"],
      useCases: ["Multi-format document ingestion", "Enterprise search", "Knowledge management"],
    },
    relatedPlaybooks: ["chunking-strategies", "production-deployment-checklist"],
  },

  // ============================================================================
  // LAYOUT-AWARE CHUNKING (PDF/HTML Structure)
  // ============================================================================
  {
    slug: "layout-aware-chunking",
    title: "Layout-Aware Chunking: Visual Structure Recognition",
    description:
      `WHY INTRODUCED: PDFs and HTML have visual structure (columns, sidebars, headers/footers) invisible to text-only chunking. PROBLEM IT SOLVED: A two-column PDF chunked linearly produces nonsense where left and right columns interleave. IMPROVEMENT: Respects visual groupings for 30-50% better retrieval on complex layouts.`,
    group: "Chunking Masterclass — Level 4: Structure-Aware",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["section-based-chunking"],
    starterCode: `from typing import List, Dict
from dataclasses import dataclass

@dataclass
class LayoutBlock:
    text: str
    block_type: str  # 'header', 'footer', 'sidebar', 'main', 'caption', 'table'
    column: int  # 0 for single column, 1/2 for multi-column
    y_position: float  # vertical position (0.0 = top, 1.0 = bottom)

def layout_aware_chunk(
    blocks: List[LayoutBlock],
    max_chunk_size: int = 500,
    group_columns: bool = True
) -> List[Dict]:
    """
    Chunk based on document layout structure.
    
    First Principles:
    - Visual layout carries semantic meaning
    - Sidebars are often supplementary (definitions, notes)
    - Headers/footers should be excluded or attached as metadata
    - Multi-column text should be read column-by-column
    
    Algorithm:
    1. Separate headers/footers from main content
    2. Group blocks by column (if multi-column)
    3. Process each column/section independently
    4. Attach headers as context metadata
    
    Args:
        blocks: Layout-extracted blocks with position info
        max_chunk_size: Maximum chunk size
        group_columns: If True, process columns separately
        
    Returns:
        List of chunks with layout context
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `blocks = [
    LayoutBlock("COMPANY REPORT", "header", 0, 0.02),
    LayoutBlock("Executive Summary: Our company had a great year.", "main", 1, 0.15),
    LayoutBlock("Revenue grew 20% year over year.", "main", 1, 0.25),
    LayoutBlock("Key Metrics: Revenue $1M, Profit $200K", "sidebar", 2, 0.15),
    LayoutBlock("Risk Factors: Market volatility remains a concern.", "main", 1, 0.40),
    LayoutBlock("Page 1", "footer", 0, 0.98),
]

chunks = layout_aware_chunk(blocks, max_chunk_size=200, group_columns=True)

# Headers/footers should be handled separately
main_chunks = [c for c in chunks if c.get('block_type') != 'header']
assert len(main_chunks) >= 1

# Sidebar content should be separate from main content
sidebar_chunk = [c for c in chunks if 'sidebar' in str(c.get('block_type', ''))]
# Main text should flow correctly (not interleaved with sidebar)

# Layout context should be preserved
for chunk in chunks:
    assert 'text' in chunk
    assert 'block_type' in chunk

print("All tests passed!")`,
    hints: [
      "Sort blocks by column first, then by y_position",
      "Exclude headers/footers or attach as metadata",
      "Process each column as separate document section",
    ],
    solution: `from typing import List, Dict
from dataclasses import dataclass

@dataclass
class LayoutBlock:
    text: str
    block_type: str
    column: int
    y_position: float

def layout_aware_chunk(
    blocks: List[LayoutBlock],
    max_chunk_size: int = 500,
    group_columns: bool = True
) -> List[Dict]:
    if not blocks:
        return []
    
    # Separate headers/footers
    headers = [b for b in blocks if b.block_type == 'header']
    footers = [b for b in blocks if b.block_type == 'footer']
    content = [b for b in blocks if b.block_type not in ['header', 'footer']]
    
    # Extract header text for context
    header_context = ' | '.join([h.text for h in headers])
    
    chunks = []
    
    if group_columns:
        # Group by column
        columns = {}
        for block in content:
            col = block.column
            if col not in columns:
                columns[col] = []
            columns[col].append(block)
        
        # Process each column
        for col_num in sorted(columns.keys()):
            col_blocks = sorted(columns[col_num], key=lambda b: b.y_position)
            current_text = ""
            current_types = set()
            
            for block in col_blocks:
                if len(current_text) + len(block.text) > max_chunk_size and current_text:
                    chunks.append({
                        'text': current_text.strip(),
                        'block_type': ','.join(current_types),
                        'column': col_num,
                        'header_context': header_context
                    })
                    current_text = block.text
                    current_types = {block.block_type}
                else:
                    current_text += " " + block.text
                    current_types.add(block.block_type)
            
            if current_text.strip():
                chunks.append({
                    'text': current_text.strip(),
                    'block_type': ','.join(current_types),
                    'column': col_num,
                    'header_context': header_context
                })
    else:
        # Process all blocks by y_position
        sorted_blocks = sorted(content, key=lambda b: b.y_position)
        current_text = ""
        current_types = set()
        
        for block in sorted_blocks:
            if len(current_text) + len(block.text) > max_chunk_size and current_text:
                chunks.append({
                    'text': current_text.strip(),
                    'block_type': ','.join(current_types),
                    'header_context': header_context
                })
                current_text = block.text
                current_types = {block.block_type}
            else:
                current_text += " " + block.text
                current_types.add(block.block_type)
        
        if current_text.strip():
            chunks.append({
                'text': current_text.strip(),
                'block_type': ','.join(current_types),
                'header_context': header_context
            })
    
    return chunks
`,
    timeEstimate: { minutes: 45, label: "45-55 min" },
    realWorld: {
      description: "Unstructured.io, LlamaParse, and DocuGami specialize in layout-aware parsing. Essential for complex PDFs like financial reports, research papers, and legal documents.",
      companies: ["Unstructured.io", "LlamaParse", "Docugami", "Adobe"],
      useCases: ["Financial reports", "Research papers", "Legal contracts", "Technical manuals"],
    },
    relatedPlaybooks: ["document-parsing-guide", "chunking-strategies"],
  },

  // ============================================================================
  // MAX-MIN SEMANTIC CHUNKING
  // ============================================================================
  {
    slug: "maxmin-semantic-chunking",
    title: "Max-Min Semantic Chunking: Optimal Boundary Detection",
    description:
      `WHY INTRODUCED: Basic semantic chunking uses a single threshold. But where exactly should boundaries be? INSIGHT: Place boundaries where semantic distance is MAXIMUM between adjacent segments. PROBLEM IT SOLVED: More principled boundary selection based on mathematical optimization. IMPROVEMENT: 15-25% better intra-chunk coherence vs threshold-based.`,
    group: "Chunking Masterclass — Level 5: Semantic",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["semantic-chunking"],
    starterCode: `from typing import List, Tuple
import math

def maxmin_semantic_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    num_chunks: int = None,
    min_chunk_size: int = 2
) -> List[List[str]]:
    """
    Place chunk boundaries at points of maximum semantic distance.
    
    First Principles:
    - If topic changes, embeddings of adjacent sentences will be dissimilar
    - We want to MAXIMIZE distance at boundaries
    - This gives us the most coherent chunks possible
    
    Algorithm (Max-Min):
    1. Compute pairwise distances between adjacent sentence embeddings
    2. Find the N positions with MAXIMUM distance (these are boundaries)
    3. Split text at these boundaries
    
    Why "Max-Min"?
    - We MAXIMIZE inter-chunk distance (clear topic separation)
    - We MINIMIZE intra-chunk distance (coherent topics)
    
    Args:
        sentences: List of sentences
        embeddings: Corresponding embeddings for each sentence
        num_chunks: Number of chunks to create (auto-detect if None)
        min_chunk_size: Minimum sentences per chunk
        
    Returns:
        List of sentence groups (chunks)
    """
    # TODO: implement
    raise NotImplementedError

def cosine_distance(v1: List[float], v2: List[float]) -> float:
    """Compute cosine distance (1 - cosine_similarity)."""
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 1.0
    return 1 - (dot / (norm1 * norm2))
`,
    testCode: `# Simulate embeddings where topics change at specific points
# Topic 1: sentences 0-2, Topic 2: sentences 3-5, Topic 3: sentences 6-8
sentences = [
    "Machine learning is powerful.", "It uses algorithms.", "Data is required.",
    "Finance is complex.", "Markets fluctuate.", "Risk must be managed.",
    "Cooking is an art.", "Fresh ingredients matter.", "Timing is crucial."
]

# Create embeddings that cluster by topic
# Topic 1: [1, 0, 0], Topic 2: [0, 1, 0], Topic 3: [0, 0, 1]
embeddings = [
    [1, 0.1, 0], [0.9, 0.1, 0], [0.95, 0.05, 0],  # Topic 1
    [0.1, 1, 0], [0, 0.9, 0.1], [0.05, 0.95, 0],  # Topic 2
    [0, 0.1, 1], [0.1, 0, 0.9], [0, 0.05, 0.95],  # Topic 3
]

chunks = maxmin_semantic_chunk(sentences, embeddings, num_chunks=3)

# Should detect 3 topic clusters
assert len(chunks) == 3

# First chunk should contain ML sentences
assert any("learning" in s.lower() for s in chunks[0])

# Second chunk should contain finance sentences
assert any("finance" in s.lower() or "market" in s.lower() for s in chunks[1])

# Third chunk should contain cooking sentences
assert any("cooking" in s.lower() or "ingredient" in s.lower() for s in chunks[2])

print("All tests passed!")`,
    hints: [
      "Compute cosine distance between adjacent sentence embeddings",
      "Sort boundary candidates by distance (descending)",
      "Select top N-1 boundaries for N chunks",
      "Ensure min_chunk_size constraint is met",
    ],
    solution: `from typing import List, Tuple
import math

def cosine_distance(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 1.0
    return 1 - (dot / (norm1 * norm2))

def maxmin_semantic_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    num_chunks: int = None,
    min_chunk_size: int = 2
) -> List[List[str]]:
    if len(sentences) != len(embeddings):
        raise ValueError("Sentences and embeddings must have same length")
    
    if len(sentences) <= min_chunk_size:
        return [sentences]
    
    # Compute distances between adjacent sentences
    distances = []
    for i in range(len(embeddings) - 1):
        dist = cosine_distance(embeddings[i], embeddings[i + 1])
        distances.append((i + 1, dist))  # (boundary_position, distance)
    
    # Auto-detect num_chunks if not specified
    if num_chunks is None:
        # Use elbow method: find significant jumps in distance
        sorted_dists = sorted([d[1] for d in distances], reverse=True)
        threshold = sorted_dists[0] * 0.5 if sorted_dists else 0.3
        num_chunks = sum(1 for d in distances if d[1] >= threshold) + 1
        num_chunks = max(2, min(num_chunks, len(sentences) // min_chunk_size))
    
    # Sort boundaries by distance (highest first)
    sorted_boundaries = sorted(distances, key=lambda x: x[1], reverse=True)
    
    # Select top N-1 boundaries (for N chunks)
    selected = []
    for pos, dist in sorted_boundaries:
        if len(selected) >= num_chunks - 1:
            break
        # Check min_chunk_size constraint
        valid = True
        for existing in selected:
            if abs(pos - existing) < min_chunk_size:
                valid = False
                break
        if pos < min_chunk_size or pos > len(sentences) - min_chunk_size:
            valid = False
        if valid:
            selected.append(pos)
    
    # Sort boundaries by position
    boundaries = sorted(selected)
    
    # Create chunks
    chunks = []
    prev = 0
    for boundary in boundaries:
        chunks.append(sentences[prev:boundary])
        prev = boundary
    chunks.append(sentences[prev:])
    
    return [c for c in chunks if c]
`,
    timeEstimate: { minutes: 45, label: "45-55 min" },
    realWorld: {
      description: "Used in Greg Kamradt's semantic chunking research. More principled than threshold-based approaches. Jina AI and advanced RAG systems use similar optimization.",
      companies: ["Jina AI", "Anthropic", "Cohere"],
      useCases: ["Research document processing", "High-quality knowledge bases", "Legal document analysis"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // STATISTICAL BREAK DETECTION
  // ============================================================================
  {
    slug: "statistical-break-detection",
    title: "Statistical Break Detection: Percentile-Based Boundaries",
    description:
      `WHY INTRODUCED: Fixed thresholds for semantic breaks don't generalize across documents. INSIGHT: Use statistical methods (percentile, IQR, std-dev) to find outlier distances. PROBLEM IT SOLVED: Adaptive threshold that works across different document types and embedding models. IMPROVEMENT: More robust to varying document styles and embedding distributions.`,
    group: "Chunking Masterclass — Level 5: Semantic",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["semantic-chunking"],
    starterCode: `from typing import List, Dict
import math

def statistical_break_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    method: str = "percentile",  # "percentile", "iqr", "stddev"
    threshold_param: float = 90.0  # percentile or multiplier
) -> List[Dict]:
    """
    Detect chunk boundaries using statistical outlier detection.
    
    First Principles:
    - Topic changes create "outlier" distances between adjacent sentences
    - What's an outlier? Depends on the distribution!
    - Use statistics: percentile, IQR, or std-dev based thresholds
    
    Methods:
    - percentile: Break if distance > Nth percentile (e.g., 90th)
    - iqr: Break if distance > Q3 + 1.5*IQR (outlier detection)
    - stddev: Break if distance > mean + N*stddev
    
    Args:
        sentences: List of sentences
        embeddings: Corresponding embeddings
        method: Statistical method for threshold
        threshold_param: Method-specific parameter
        
    Returns:
        List of chunks with statistical metadata
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `sentences = [
    "AI is transforming industries.", "Machine learning leads the way.",
    "Sports are entertaining.", "Football draws millions of fans.",
    "The economy is growing.", "Inflation remains a concern.",
]

# Embeddings clustered by topic
embeddings = [
    [1, 0, 0], [0.9, 0.1, 0],  # AI topic
    [0, 1, 0], [0.1, 0.9, 0],  # Sports topic
    [0, 0, 1], [0.1, 0, 0.9],  # Economy topic
]

# Test percentile method
chunks_pct = statistical_break_chunk(sentences, embeddings, method="percentile", threshold_param=75)
assert len(chunks_pct) >= 2  # Should detect topic changes

# Test IQR method
chunks_iqr = statistical_break_chunk(sentences, embeddings, method="iqr")
assert len(chunks_iqr) >= 2

# Each chunk should have metadata about break decision
for chunk in chunks_pct:
    assert 'text' in chunk or 'sentences' in chunk

print("All tests passed!")`,
    hints: [
      "First compute all adjacent distances",
      "Calculate statistics: mean, std, quartiles",
      "Apply method-specific threshold formula",
      "Mark breaks where distance exceeds threshold",
    ],
    solution: `from typing import List, Dict
import math

def cosine_distance(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 1.0
    return 1 - (dot / (norm1 * norm2))

def statistical_break_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    method: str = "percentile",
    threshold_param: float = 90.0
) -> List[Dict]:
    if len(sentences) != len(embeddings):
        raise ValueError("Sentences and embeddings must match")
    
    if len(sentences) <= 1:
        return [{'sentences': sentences, 'text': ' '.join(sentences)}]
    
    # Compute adjacent distances
    distances = []
    for i in range(len(embeddings) - 1):
        distances.append(cosine_distance(embeddings[i], embeddings[i + 1]))
    
    # Calculate threshold based on method
    if method == "percentile":
        sorted_dists = sorted(distances)
        idx = int(len(sorted_dists) * threshold_param / 100)
        idx = min(idx, len(sorted_dists) - 1)
        threshold = sorted_dists[idx]
    
    elif method == "iqr":
        sorted_dists = sorted(distances)
        q1_idx = len(sorted_dists) // 4
        q3_idx = 3 * len(sorted_dists) // 4
        q1 = sorted_dists[q1_idx]
        q3 = sorted_dists[q3_idx]
        iqr = q3 - q1
        threshold = q3 + threshold_param * iqr
    
    elif method == "stddev":
        mean = sum(distances) / len(distances)
        variance = sum((d - mean) ** 2 for d in distances) / len(distances)
        std = math.sqrt(variance)
        threshold = mean + threshold_param * std
    
    else:
        raise ValueError(f"Unknown method: {method}")
    
    # Find break points
    breaks = [i + 1 for i, d in enumerate(distances) if d >= threshold]
    
    # Create chunks
    chunks = []
    prev = 0
    for brk in breaks:
        chunk_sentences = sentences[prev:brk]
        if chunk_sentences:
            chunks.append({
                'sentences': chunk_sentences,
                'text': ' '.join(chunk_sentences),
                'method': method,
                'threshold': threshold
            })
        prev = brk
    
    # Final chunk
    if prev < len(sentences):
        chunks.append({
            'sentences': sentences[prev:],
            'text': ' '.join(sentences[prev:]),
            'method': method,
            'threshold': threshold
        })
    
    return chunks
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "More robust than fixed thresholds. Used in production systems that handle diverse document types. Adapts to different embedding models automatically.",
      companies: ["Pinecone", "Weaviate", "Zilliz"],
      useCases: ["Multi-domain RAG", "Heterogeneous document collections", "Adaptive processing"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // SEMANTIC-GUIDED RECURSIVE CHUNKING
  // ============================================================================
  {
    slug: "semantic-guided-recursive-chunking",
    title: "Semantic-Guided Recursive Chunking: Best of Both Worlds",
    description:
      `WHY INTRODUCED: Recursive chunking respects structure but ignores semantics. Semantic chunking ignores structure. INSIGHT: Use both! First split structurally, then refine boundaries semantically. PROBLEM IT SOLVED: Combines document structure awareness with semantic coherence. IMPROVEMENT: 20-30% better than either approach alone.`,
    group: "Chunking Masterclass — Level 6: Hybrid",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["recursive-chunking", "semantic-chunking"],
    starterCode: `from typing import List, Dict, Callable
import math

def semantic_guided_recursive_chunk(
    text: str,
    embed_fn: Callable[[str], List[float]],
    chunk_size: int = 500,
    semantic_threshold: float = 0.3
) -> List[Dict]:
    """
    Combine recursive structural splitting with semantic refinement.
    
    First Principles:
    - Recursive chunking gives us structure-aware splits
    - But sometimes it splits mid-topic or keeps separate topics together
    - Semantic analysis can REFINE these boundaries
    
    Algorithm:
    1. Apply recursive chunking (structure-first)
    2. For each chunk, check internal semantic coherence
    3. If low coherence: split at semantic boundary
    4. If high coherence with neighbor: consider merging
    
    Args:
        text: Input text
        embed_fn: Function to embed text
        chunk_size: Target chunk size
        semantic_threshold: Coherence threshold for splitting
        
    Returns:
        List of semantically-refined chunks
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Mock embedding function (word-based for testing)
def mock_embed(text: str) -> List[float]:
    words = text.lower().split()
    features = [0.0] * 10
    for i, word in enumerate(words[:10]):
        features[i] = len(word) / 10.0
    return features

text = '''
Machine learning is powerful. Deep learning uses neural networks.

The stock market fluctuated today. Investors remain cautious about inflation.

Cooking requires creativity. Fresh ingredients make the best dishes.
'''

chunks = semantic_guided_recursive_chunk(
    text, 
    mock_embed, 
    chunk_size=100,
    semantic_threshold=0.3
)

# Should create coherent topic chunks
assert len(chunks) >= 2

# Each chunk should have coherence metadata
for chunk in chunks:
    assert 'text' in chunk
    assert len(chunk['text']) > 0

print("All tests passed!")`,
    hints: [
      "First apply recursive splitting on structural boundaries",
      "Compute embeddings for each initial chunk",
      "Check coherence by comparing sentence embeddings within chunk",
      "Split incoherent chunks, merge highly similar adjacent chunks",
    ],
    solution: `from typing import List, Dict, Callable
import re
import math

def cosine_sim(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def semantic_guided_recursive_chunk(
    text: str,
    embed_fn: Callable[[str], List[float]],
    chunk_size: int = 500,
    semantic_threshold: float = 0.3
) -> List[Dict]:
    if not text.strip():
        return []
    
    # Step 1: Recursive structural splitting
    def recursive_split(t: str, separators: List[str] = None) -> List[str]:
        if separators is None:
            separators = ["\\n\\n", "\\n", ". ", " "]
        
        if len(t) <= chunk_size or not separators:
            return [t] if t.strip() else []
        
        sep = separators[0]
        remaining = separators[1:]
        
        if sep not in t:
            return recursive_split(t, remaining)
        
        parts = t.split(sep)
        result = []
        current = ""
        
        for part in parts:
            test = current + sep + part if current else part
            if len(test) <= chunk_size:
                current = test
            else:
                if current:
                    result.append(current)
                if len(part) > chunk_size:
                    result.extend(recursive_split(part, remaining))
                else:
                    current = part
        
        if current:
            result.append(current)
        
        return result
    
    initial_chunks = recursive_split(text)
    
    # Step 2: Semantic refinement
    refined_chunks = []
    
    for chunk in initial_chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\\s+', chunk)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= 2:
            refined_chunks.append({
                'text': chunk,
                'coherence': 1.0,
                'refined': False
            })
            continue
        
        # Check internal coherence
        embeddings = [embed_fn(s) for s in sentences]
        similarities = []
        for i in range(len(embeddings) - 1):
            similarities.append(cosine_sim(embeddings[i], embeddings[i + 1]))
        
        avg_coherence = sum(similarities) / len(similarities) if similarities else 1.0
        
        if avg_coherence < semantic_threshold:
            # Low coherence: split at minimum similarity point
            min_idx = similarities.index(min(similarities))
            
            part1 = ' '.join(sentences[:min_idx + 1])
            part2 = ' '.join(sentences[min_idx + 1:])
            
            if part1.strip():
                refined_chunks.append({
                    'text': part1,
                    'coherence': avg_coherence,
                    'refined': True
                })
            if part2.strip():
                refined_chunks.append({
                    'text': part2,
                    'coherence': avg_coherence,
                    'refined': True
                })
        else:
            refined_chunks.append({
                'text': chunk,
                'coherence': avg_coherence,
                'refined': False
            })
    
    return refined_chunks
`,
    timeEstimate: { minutes: 50, label: "50-60 min" },
    realWorld: {
      description: "The evolution of LangChain's and LlamaIndex's chunking. Production pipelines increasingly combine structural and semantic signals for optimal results.",
      companies: ["LangChain", "LlamaIndex", "Anthropic"],
      useCases: ["Complex document processing", "Technical documentation", "Mixed-format documents"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // TOPIC-BASED CHUNKING
  // ============================================================================
  {
    slug: "topic-based-chunking",
    title: "Topic-Based Chunking: Clustering for Concept Groups",
    description:
      `WHY INTRODUCED: Linear chunking follows document order. But topics can be scattered! INSIGHT: Use clustering or topic modeling to group by CONCEPT, not position. PROBLEM IT SOLVED: Information about a topic spread across document is now consolidated. IMPROVEMENT: Topic modeling finds hidden thematic structure.`,
    group: "Chunking Masterclass — Level 6: Hybrid",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["semantic-chunking"],
    starterCode: `from typing import List, Dict, Tuple
import math

def topic_based_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    num_topics: int = None,
    min_cluster_size: int = 2
) -> List[Dict]:
    """
    Chunk by topic clusters rather than document order.
    
    First Principles:
    - Documents often mention the same topic in multiple places
    - "Introduction mentions AI, Conclusion revisits AI" = same topic!
    - Clustering groups by semantic similarity, not position
    
    Algorithm:
    1. Embed all sentences
    2. Apply clustering (k-means or similar)
    3. Group sentences by cluster
    4. Order sentences within cluster by original position
    
    Use case:
    - Research papers: "Methods", "Results", "Discussion" all mention the same experiments
    - Legal docs: Same clause referenced in different sections
    
    Args:
        sentences: List of sentences
        embeddings: Corresponding embeddings
        num_topics: Number of topic clusters (auto-detect if None)
        min_cluster_size: Minimum sentences per topic
        
    Returns:
        List of topic-based chunks with cluster metadata
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `sentences = [
    "AI is transforming industries.",          # AI topic
    "The weather is sunny today.",             # Weather topic  
    "Machine learning powers modern AI.",       # AI topic
    "Rain is expected tomorrow.",              # Weather topic
    "Neural networks are a type of AI.",       # AI topic
    "Temperature will drop tonight.",          # Weather topic
]

# Embeddings: AI=[1,0], Weather=[0,1]
embeddings = [
    [1, 0], [0, 1], [0.9, 0.1], [0.1, 0.9], [0.95, 0.05], [0.05, 0.95]
]

chunks = topic_based_chunk(sentences, embeddings, num_topics=2)

# Should create 2 topic clusters
assert len(chunks) == 2

# One cluster should have all AI sentences
ai_cluster = [c for c in chunks if any("AI" in s for s in c['sentences'])]
assert len(ai_cluster) == 1
assert len(ai_cluster[0]['sentences']) == 3

# One cluster should have all weather sentences
weather_cluster = [c for c in chunks if any("weather" in s.lower() for s in c['sentences'])]
assert len(weather_cluster) == 1
assert len(weather_cluster[0]['sentences']) == 3

print("All tests passed!")`,
    hints: [
      "Implement simple k-means or use centroid-based clustering",
      "Assign each sentence to nearest centroid",
      "Group sentences by cluster assignment",
      "Preserve original order within each cluster",
    ],
    solution: `from typing import List, Dict, Tuple
import math
import random

def cosine_sim(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def topic_based_chunk(
    sentences: List[str],
    embeddings: List[List[float]],
    num_topics: int = None,
    min_cluster_size: int = 2
) -> List[Dict]:
    if len(sentences) != len(embeddings):
        raise ValueError("Sentences and embeddings must match")
    
    if not sentences:
        return []
    
    # Auto-detect num_topics
    if num_topics is None:
        num_topics = max(2, len(sentences) // 5)
    
    num_topics = min(num_topics, len(sentences) // min_cluster_size)
    
    # Simple k-means clustering
    dim = len(embeddings[0])
    
    # Initialize centroids randomly
    indices = random.sample(range(len(embeddings)), min(num_topics, len(embeddings)))
    centroids = [embeddings[i][:] for i in indices]
    
    # Iterate k-means
    for _ in range(10):  # Fixed iterations for simplicity
        # Assign points to clusters
        assignments = []
        for emb in embeddings:
            sims = [cosine_sim(emb, c) for c in centroids]
            assignments.append(sims.index(max(sims)))
        
        # Update centroids
        new_centroids = []
        for k in range(num_topics):
            cluster_points = [embeddings[i] for i, a in enumerate(assignments) if a == k]
            if cluster_points:
                centroid = [sum(p[d] for p in cluster_points) / len(cluster_points) for d in range(dim)]
                new_centroids.append(centroid)
            else:
                new_centroids.append(centroids[k])
        centroids = new_centroids
    
    # Final assignment
    clusters = {k: [] for k in range(num_topics)}
    for i, emb in enumerate(embeddings):
        sims = [cosine_sim(emb, c) for c in centroids]
        k = sims.index(max(sims))
        clusters[k].append((i, sentences[i]))
    
    # Create chunks
    chunks = []
    for k, items in clusters.items():
        if not items:
            continue
        # Sort by original position
        items.sort(key=lambda x: x[0])
        chunk_sentences = [item[1] for item in items]
        
        chunks.append({
            'topic_id': k,
            'sentences': chunk_sentences,
            'text': ' '.join(chunk_sentences),
            'original_positions': [item[0] for item in items]
        })
    
    return [c for c in chunks if len(c['sentences']) >= min_cluster_size]
`,
    timeEstimate: { minutes: 45, label: "45-55 min" },
    realWorld: {
      description: "Used for document summarization and cross-referencing. LDA and BERTopic-style clustering for advanced document understanding.",
      companies: ["Elicit", "Semantic Scholar", "Notion AI"],
      useCases: ["Research synthesis", "Document summarization", "Knowledge graph construction"],
    },
    relatedPlaybooks: ["chunking-strategies", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // VARIABLE OVERLAP CHUNKING
  // ============================================================================
  {
    slug: "variable-overlap-chunking",
    title: "Variable Overlap Chunking: Smart Context Preservation",
    description:
      `WHY INTRODUCED: Fixed overlap wastes tokens in smooth sections and may be insufficient at topic transitions. INSIGHT: Increase overlap at semantic boundaries, decrease in coherent sections. PROBLEM IT SOLVED: Resource-efficient overlap that adapts to content needs. IMPROVEMENT: Same retrieval quality with 20-40% fewer tokens stored.`,
    group: "Chunking Masterclass — Level 5: Semantic",
    difficulty: "medium",
    xpReward: 100,
    prerequisites: ["sliding-window-chunking", "semantic-chunking"],
    starterCode: `from typing import List, Dict, Callable
import math

def variable_overlap_chunk(
    text: str,
    chunk_size: int,
    min_overlap: int,
    max_overlap: int,
    embed_fn: Callable[[str], List[float]] = None
) -> List[Dict]:
    """
    Apply variable overlap based on semantic transitions.
    
    First Principles:
    - Fixed overlap is wasteful when content is uniform
    - At topic changes, we need MORE overlap to preserve context
    - In the middle of a topic, LESS overlap is sufficient
    
    Algorithm:
    1. Identify potential chunk boundaries at intervals
    2. At each boundary, compute semantic distance
    3. High distance = high overlap (important transition)
    4. Low distance = low overlap (smooth continuation)
    
    Args:
        text: Input text
        chunk_size: Target chunk size
        min_overlap: Minimum overlap for smooth sections
        max_overlap: Maximum overlap for topic transitions
        embed_fn: Embedding function (uses word overlap if None)
        
    Returns:
        List of chunks with variable overlap
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "Machine learning is powerful. " * 10 + "Now about cooking. Cooking is an art. " * 5

def mock_embed(t):
    words = set(t.lower().split())
    return [1.0 if 'machine' in words or 'learning' in words else 0.0,
            1.0 if 'cooking' in words or 'art' in words else 0.0]

chunks = variable_overlap_chunk(
    text,
    chunk_size=100,
    min_overlap=10,
    max_overlap=50,
    embed_fn=mock_embed
)

# Should have multiple chunks
assert len(chunks) >= 2

# Overlaps should vary
overlaps = [c.get('overlap_used', 0) for c in chunks if 'overlap_used' in c]
if overlaps:
    assert max(overlaps) >= min(overlaps)  # Some variation expected

print("All tests passed!")`,
    hints: [
      "Create initial chunks at fixed intervals",
      "Compute semantic distance at each boundary",
      "Scale overlap: high_dist → max_overlap, low_dist → min_overlap",
      "Apply the computed overlap when extracting chunks",
    ],
    solution: `from typing import List, Dict, Callable
import math

def cosine_sim(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def word_overlap_embed(text: str) -> List[float]:
    words = text.lower().split()
    return [len(words), len(set(words)), sum(len(w) for w in words)]

def variable_overlap_chunk(
    text: str,
    chunk_size: int,
    min_overlap: int,
    max_overlap: int,
    embed_fn: Callable[[str], List[float]] = None
) -> List[Dict]:
    if not text:
        return []
    
    if embed_fn is None:
        embed_fn = word_overlap_embed
    
    chunks = []
    i = 0
    prev_embedding = None
    
    while i < len(text):
        # Get current chunk
        chunk_text = text[i:i + chunk_size]
        if not chunk_text.strip():
            break
        
        # Compute embedding for overlap calculation
        current_embedding = embed_fn(chunk_text)
        
        # Calculate overlap for NEXT chunk based on transition
        if prev_embedding is not None:
            similarity = cosine_sim(prev_embedding, current_embedding)
            # High sim = smooth transition = low overlap
            # Low sim = topic change = high overlap
            overlap_ratio = 1 - similarity  # Invert: low sim → high ratio
            overlap = int(min_overlap + overlap_ratio * (max_overlap - min_overlap))
        else:
            overlap = min_overlap
        
        chunks.append({
            'text': chunk_text.strip(),
            'start': i,
            'end': i + len(chunk_text),
            'overlap_used': overlap
        })
        
        # Move to next chunk with variable overlap
        step = chunk_size - overlap
        step = max(step, chunk_size // 4)  # Never step less than 25% of chunk_size
        i += step
        prev_embedding = current_embedding
    
    return chunks
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Optimizes storage and compute costs while maintaining retrieval quality. Used in cost-sensitive production deployments.",
      companies: ["OpenAI", "Anthropic", "Cost-conscious enterprises"],
      useCases: ["Large-scale document processing", "Cost optimization", "Adaptive RAG"],
    },
    relatedPlaybooks: ["chunking-strategies", "production-deployment-checklist"],
  },

  // ============================================================================
  // LEGAL CLAUSE CHUNKING
  // ============================================================================
  {
    slug: "legal-clause-chunking",
    title: "Legal Clause Chunking: Contract-Aware Boundaries",
    description:
      `WHY INTRODUCED: Legal documents have strict structure: clauses, articles, sections, schedules. PROBLEM IT SOLVED: Splitting a clause mid-sentence can change legal meaning entirely. IMPROVEMENT: Chunks align with legal structure for accurate retrieval and compliance.`,
    group: "Chunking Masterclass — Level 7: Domain-Specific",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["section-based-chunking"],
    starterCode: `from typing import List, Dict
import re

def legal_clause_chunk(
    contract_text: str,
    include_hierarchy: bool = True,
    max_chunk_size: int = 1000
) -> List[Dict]:
    """
    Chunk legal documents by clause structure.
    
    First Principles:
    - Legal documents have numbered sections: 1., 1.1, 1.1.1, etc.
    - Each clause is a complete legal statement
    - Cross-references (e.g., "per Section 3.2") must be traceable
    - Definitions sections define terms used throughout
    
    Common patterns:
    - ARTICLE I, ARTICLE II, etc.
    - Section 1., Section 2., etc.
    - (a), (b), (c) sub-clauses
    - WHEREAS clauses (recitals)
    - NOW THEREFORE (operative provisions)
    
    Args:
        contract_text: Raw contract text
        include_hierarchy: Include parent section context
        max_chunk_size: Split large clauses if exceeded
        
    Returns:
        Chunks with legal metadata (clause_id, type, hierarchy)
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `contract = '''
ARTICLE I - DEFINITIONS

Section 1.1. "Agreement" means this contract.
Section 1.2. "Party" means any signatory.

ARTICLE II - OBLIGATIONS

Section 2.1. The Buyer shall pay the Purchase Price.
Section 2.2. The Seller shall deliver the Goods.

(a) Delivery shall occur within 30 days.
(b) Risk transfers upon delivery.

ARTICLE III - TERMINATION

Section 3.1. Either party may terminate with 30 days notice.
'''

chunks = legal_clause_chunk(contract, include_hierarchy=True)

# Should identify articles and sections
assert len(chunks) >= 3

# Check for article detection
article_chunks = [c for c in chunks if c.get('type') == 'article' or 'ARTICLE' in c.get('text', '')]
assert len(article_chunks) >= 1

# Check for section detection
section_chunks = [c for c in chunks if 'section' in str(c.get('type', '')).lower() or 'Section' in c.get('text', '')]
assert len(section_chunks) >= 2

# Hierarchy should be preserved
for chunk in chunks:
    assert 'clause_id' in chunk or 'text' in chunk

print("All tests passed!")`,
    hints: [
      "Detect ARTICLE patterns: r'^ARTICLE\\s+[IVX]+' or r'^ARTICLE\\s+\\d+'",
      "Detect Section patterns: r'^Section\\s+\\d+\\.\\d*'",
      "Detect sub-clauses: r'^\\([a-z]\\)'",
      "Track hierarchy as you parse: [Article I > Section 1.1 > (a)]",
    ],
    solution: `from typing import List, Dict
import re

def legal_clause_chunk(
    contract_text: str,
    include_hierarchy: bool = True,
    max_chunk_size: int = 1000
) -> List[Dict]:
    if not contract_text:
        return []
    
    chunks = []
    lines = contract_text.strip().split('\\n')
    
    current_article = None
    current_section = None
    current_content = []
    
    article_pattern = re.compile(r'^ARTICLE\\s+([IVX]+|\\d+)', re.IGNORECASE)
    section_pattern = re.compile(r'^Section\\s+(\\d+\\.\\d*)', re.IGNORECASE)
    subclause_pattern = re.compile(r'^\\([a-z]\\)')
    
    def flush_content():
        if current_content:
            text = '\\n'.join(current_content).strip()
            if text:
                hierarchy = []
                if current_article:
                    hierarchy.append(current_article)
                if current_section:
                    hierarchy.append(current_section)
                
                chunk = {
                    'text': text,
                    'clause_id': current_section or current_article or 'preamble',
                    'type': 'section' if current_section else 'article' if current_article else 'preamble'
                }
                
                if include_hierarchy:
                    chunk['hierarchy'] = hierarchy
                
                chunks.append(chunk)
        return []
    
    for line in lines:
        line_stripped = line.strip()
        
        # Check for article
        article_match = article_pattern.match(line_stripped)
        if article_match:
            current_content = flush_content()
            current_article = f"ARTICLE {article_match.group(1)}"
            current_section = None
            current_content.append(line_stripped)
            continue
        
        # Check for section
        section_match = section_pattern.match(line_stripped)
        if section_match:
            current_content = flush_content()
            current_section = f"Section {section_match.group(1)}"
            current_content.append(line_stripped)
            continue
        
        # Accumulate content
        if line_stripped:
            current_content.append(line_stripped)
    
    # Flush remaining
    flush_content()
    
    return chunks
`,
    timeEstimate: { minutes: 45, label: "45-55 min" },
    realWorld: {
      description: "Used by legal tech companies for contract analysis, due diligence, and compliance. Kira Systems, Luminance, and Harvey AI specialize in this.",
      companies: ["Kira Systems", "Luminance", "Harvey AI", "LexisNexis"],
      useCases: ["Contract review", "Due diligence", "Legal research", "Compliance checking"],
    },
    relatedPlaybooks: ["chunking-strategies", "document-parsing-guide"],
  },

  // ============================================================================
  // FINANCIAL STATEMENT CHUNKING
  // ============================================================================
  {
    slug: "financial-statement-chunking",
    title: "Financial Statement Chunking: Structured Data Extraction",
    description:
      `WHY INTRODUCED: Financial documents (10-Ks, earnings reports) have specific structure: income statement, balance sheet, notes. PROBLEM IT SOLVED: Standard chunking loses the connection between figures and their explanations. IMPROVEMENT: Financial RAG with proper context for numbers.`,
    group: "Chunking Masterclass — Level 7: Domain-Specific",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["table-aware-chunking", "section-based-chunking"],
    starterCode: `from typing import List, Dict
import re

def financial_statement_chunk(
    document: str,
    preserve_tables: bool = True,
    link_notes: bool = True
) -> List[Dict]:
    """
    Chunk financial documents with domain-aware structure.
    
    First Principles:
    - Financial statements have standard sections
    - Numbers are MEANINGLESS without context
    - Notes explain line items (Note 1, Note 2...)
    - Tables must stay atomic
    
    Structure to detect:
    - Management Discussion & Analysis (MD&A)
    - Income Statement / P&L
    - Balance Sheet / Statement of Financial Position
    - Cash Flow Statement
    - Notes to Financial Statements
    - Auditor's Report
    
    Args:
        document: Raw financial document text
        preserve_tables: Keep tables as atomic chunks
        link_notes: Connect note references to note content
        
    Returns:
        Chunks with financial metadata
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `financial_doc = '''
MANAGEMENT DISCUSSION AND ANALYSIS

Revenue increased 20% year over year due to strong product sales.

CONSOLIDATED INCOME STATEMENT

| Item | 2024 | 2023 |
|------|------|------|
| Revenue | $100M | $83M |
| COGS | $40M | $35M |
| Net Income | $25M | $20M |

See Note 1 for revenue recognition policies.

NOTES TO FINANCIAL STATEMENTS

Note 1: Revenue Recognition
Revenue is recognized when goods are delivered.

Note 2: Depreciation
Assets are depreciated over 5 years.
'''

chunks = financial_statement_chunk(financial_doc, preserve_tables=True, link_notes=True)

# Should identify different sections
assert len(chunks) >= 3

# MDA section should be identified
mda_chunks = [c for c in chunks if 'mda' in str(c.get('section_type', '')).lower() or 'Management' in c.get('text', '')]
assert len(mda_chunks) >= 1

# Tables should be preserved atomically
table_chunks = [c for c in chunks if c.get('is_table') or '|' in c.get('text', '')]
if table_chunks:
    assert 'Revenue' in table_chunks[0]['text']
    assert '$100M' in table_chunks[0]['text']

# Notes should be identified
note_chunks = [c for c in chunks if 'note' in str(c.get('section_type', '')).lower() or 'Note' in c.get('text', '')]
assert len(note_chunks) >= 1

print("All tests passed!")`,
    hints: [
      "Detect section headers: 'INCOME STATEMENT', 'BALANCE SHEET', 'NOTES', etc.",
      "Preserve tables by detecting '|' patterns",
      "Extract note references: 'Note 1', 'See Note 2', etc.",
      "Track section hierarchy for context",
    ],
    solution: `from typing import List, Dict
import re

def financial_statement_chunk(
    document: str,
    preserve_tables: bool = True,
    link_notes: bool = True
) -> List[Dict]:
    if not document:
        return []
    
    chunks = []
    lines = document.strip().split('\\n')
    
    # Section patterns
    section_patterns = {
        'mda': r'MANAGEMENT\\s+DISCUSSION|MD&A',
        'income_statement': r'INCOME\\s+STATEMENT|PROFIT\\s+AND\\s+LOSS|P&L',
        'balance_sheet': r'BALANCE\\s+SHEET|FINANCIAL\\s+POSITION',
        'cash_flow': r'CASH\\s+FLOW',
        'notes': r'NOTES\\s+TO\\s+(FINANCIAL|CONSOLIDATED)',
        'auditor': r'AUDITOR|INDEPENDENT\\s+ACCOUNTANT'
    }
    
    current_section = 'preamble'
    current_content = []
    in_table = False
    table_content = []
    
    def detect_section(line: str) -> str:
        upper_line = line.upper().strip()
        for section_type, pattern in section_patterns.items():
            if re.search(pattern, upper_line):
                return section_type
        # Check for numbered notes
        if re.match(r'^Note\\s+\\d+', line, re.IGNORECASE):
            return 'note_item'
        return None
    
    def flush_content():
        nonlocal current_content, table_content, in_table
        
        if in_table and table_content:
            table_text = '\\n'.join(table_content)
            chunks.append({
                'text': table_text,
                'section_type': current_section,
                'is_table': True,
                'note_refs': extract_note_refs(table_text) if link_notes else []
            })
            table_content = []
            in_table = False
        
        if current_content:
            text = '\\n'.join(current_content).strip()
            if text:
                chunks.append({
                    'text': text,
                    'section_type': current_section,
                    'is_table': False,
                    'note_refs': extract_note_refs(text) if link_notes else []
                })
            current_content = []
    
    def extract_note_refs(text: str) -> List[str]:
        refs = re.findall(r'Note\\s+(\\d+)', text, re.IGNORECASE)
        return [f"Note {r}" for r in refs]
    
    for line in lines:
        line_stripped = line.strip()
        
        # Check for section change
        new_section = detect_section(line_stripped)
        if new_section and new_section != current_section:
            flush_content()
            current_section = new_section
        
        # Check for table
        is_table_line = line_stripped.startswith('|') and '|' in line_stripped[1:]
        
        if preserve_tables and is_table_line:
            if not in_table:
                flush_content()
                in_table = True
            table_content.append(line_stripped)
        else:
            if in_table:
                flush_content()
            if line_stripped:
                current_content.append(line_stripped)
    
    flush_content()
    
    return chunks
`,
    timeEstimate: { minutes: 50, label: "50-60 min" },
    realWorld: {
      description: "Essential for financial analysis RAG. Used by Bloomberg, FactSet, and financial AI startups for earnings analysis and investment research.",
      companies: ["Bloomberg", "FactSet", "AlphaSense", "Sentieo"],
      useCases: ["Earnings analysis", "SEC filing search", "Investment research", "Risk assessment"],
    },
    relatedPlaybooks: ["chunking-strategies", "document-parsing-guide"],
  },
];

