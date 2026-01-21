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
];
