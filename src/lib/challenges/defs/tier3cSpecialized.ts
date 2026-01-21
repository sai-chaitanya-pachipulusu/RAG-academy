import type { RawChallenge } from "@/lib/challenges/types";

/**
 * TIER 3C: DOCUMENT PARSING & CONVERSATION MEMORY
 */
export const TIER3C_SPECIALIZED_CHALLENGES: RawChallenge[] = [
  // ============================================
  // DOCUMENT PARSING
  // ============================================
  {
    slug: "pdf-table-extraction",
    title: "PDF Table Extraction",
    description:
      "Extract structured tables from PDF documents for RAG indexing. Why: Tables contain critical structured data. Solves: Prevents loss of tabular information during document ingestion.",
    group: "Phase 1 — Document Processing",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class TableCell:
    row: int
    col: int
    content: str
    is_header: bool = False

@dataclass
class ExtractedTable:
    cells: List[TableCell]
    num_rows: int
    num_cols: int
    caption: Optional[str] = None

def parse_markdown_table(markdown: str) -> ExtractedTable:
    """
    Parse a markdown table into structured format.
    
    Example input:
    | Name | Age | City |
    |------|-----|------|
    | Alice | 30 | NYC |
    | Bob | 25 | LA |
    
    Returns ExtractedTable with cells, dimensions, and headers marked.
    """
    # TODO: Implement
    raise NotImplementedError

def table_to_chunks(table: ExtractedTable, strategy: str = "row") -> List[str]:
    """
    Convert table to text chunks for embedding.
    
    Strategies:
    - "row": Each row becomes a chunk (include headers)
    - "cell": Each cell with context becomes a chunk
    - "full": Entire table as one chunk
    """
    # TODO: Implement
    raise NotImplementedError

def table_to_json(table: ExtractedTable) -> List[Dict]:
    """
    Convert table to list of JSON objects (one per row).
    
    Uses headers as keys.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `markdown = '''| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |'''

table = parse_markdown_table(markdown)
assert table.num_rows == 3  # Including header
assert table.num_cols == 3
assert any(c.is_header and c.content == "Name" for c in table.cells)

# Test row chunking
chunks = table_to_chunks(table, "row")
assert len(chunks) == 2  # 2 data rows
assert "Alice" in chunks[0]
assert "Name" in chunks[0]  # Headers included

# Test JSON conversion
json_data = table_to_json(table)
assert len(json_data) == 2
assert json_data[0]["Name"] == "Alice"
assert json_data[1]["Age"] == "25"

print("✅ PDF table extraction passed!")
`,
    hints: [
      "Split markdown by lines, skip separator rows (containing ---)",
      "First row is typically headers",
      "Use pipe | as column delimiter",
    ],
    solution: `from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class TableCell:
    row: int
    col: int
    content: str
    is_header: bool = False

@dataclass  
class ExtractedTable:
    cells: List[TableCell]
    num_rows: int
    num_cols: int
    caption: Optional[str] = None

def parse_markdown_table(markdown: str) -> ExtractedTable:
    lines = [l.strip() for l in markdown.strip().split('\\n') if l.strip()]
    cells = []
    
    # Filter out separator rows
    data_lines = [l for l in lines if not all(c in '-| ' for c in l)]
    
    num_rows = len(data_lines)
    num_cols = 0
    
    for row_idx, line in enumerate(data_lines):
        # Split by | and clean
        parts = [p.strip() for p in line.split('|')]
        parts = [p for p in parts if p]  # Remove empty
        num_cols = max(num_cols, len(parts))
        
        is_header = row_idx == 0
        for col_idx, content in enumerate(parts):
            cells.append(TableCell(row_idx, col_idx, content, is_header))
    
    return ExtractedTable(cells, num_rows, num_cols)

def table_to_chunks(table: ExtractedTable, strategy: str = "row") -> List[str]:
    # Get headers
    headers = [c.content for c in table.cells if c.is_header]
    
    if strategy == "full":
        return [' | '.join(c.content for c in table.cells)]
    
    elif strategy == "row":
        chunks = []
        for row in range(1, table.num_rows):  # Skip header row
            row_cells = sorted([c for c in table.cells if c.row == row], key=lambda x: x.col)
            row_text = ', '.join(f"{headers[i]}: {c.content}" for i, c in enumerate(row_cells) if i < len(headers))
            chunks.append(row_text)
        return chunks
    
    elif strategy == "cell":
        chunks = []
        for cell in table.cells:
            if not cell.is_header and cell.col < len(headers):
                chunks.append(f"{headers[cell.col]}: {cell.content}")
        return chunks
    
    return []

def table_to_json(table: ExtractedTable) -> List[Dict]:
    headers = [c.content for c in table.cells if c.is_header]
    result = []
    
    for row in range(1, table.num_rows):
        row_cells = sorted([c for c in table.cells if c.row == row], key=lambda x: x.col)
        obj = {}
        for i, cell in enumerate(row_cells):
            if i < len(headers):
                obj[headers[i]] = cell.content
        result.append(obj)
    
    return result
`,
    complexity: {
      time: "O(R * C) for R rows and C columns",
      space: "O(R * C) for storing cells",
    },
    realWorld: {
      description: "LlamaParse, Unstructured, and Document AI all focus heavily on table extraction. Financial documents and scientific papers are table-heavy.",
      companies: ["LlamaIndex (LlamaParse)", "Unstructured", "Google Document AI"],
      useCases: ["Financial reports", "Scientific papers", "Legal contracts"],
    },
    prerequisites: ["simple-chunking"],
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
  {
    slug: "document-hierarchy-parser",
    title: "Document Hierarchy Parser",
    description:
      "Parse document structure (headings, sections, subsections) for hierarchical RAG. Why: Document structure provides context. Solves: Enables section-aware retrieval and better chunking.",
    group: "Phase 1 — Document Processing",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Optional
from dataclasses import dataclass, field

@dataclass
class Section:
    level: int  # 1 = H1, 2 = H2, etc.
    title: str
    content: str
    children: List['Section'] = field(default_factory=list)
    parent_path: List[str] = field(default_factory=list)

def parse_markdown_structure(markdown: str) -> List[Section]:
    """
    Parse markdown into hierarchical sections.
    
    Example:
    # Main Title
    Intro text
    ## Section 1
    Content 1
    ### Subsection 1.1
    Deep content
    ## Section 2
    Content 2
    
    Returns list of top-level sections with nested children.
    """
    # TODO: Implement
    raise NotImplementedError

def flatten_with_breadcrumbs(sections: List[Section]) -> List[Dict]:
    """
    Flatten hierarchy with breadcrumb paths.
    
    Returns list of dicts with:
    - title: section title
    - content: section content
    - breadcrumb: "Main > Section > Subsection"
    - level: heading level
    """
    # TODO: Implement
    raise NotImplementedError

def section_to_chunk(section: Section, include_ancestors: bool = True) -> str:
    """
    Convert section to a chunk with optional ancestor context.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `markdown = '''# User Guide
Welcome to the guide.
## Getting Started
This section covers basics.
### Installation
Run pip install.
### Configuration
Edit config.yaml.
## Advanced Usage
For power users.'''

sections = parse_markdown_structure(markdown)
assert len(sections) == 1  # One top-level section
assert sections[0].title == "User Guide"
assert len(sections[0].children) == 2  # Getting Started, Advanced Usage

# Find Installation
installation = sections[0].children[0].children[0]
assert installation.title == "Installation"
assert "pip install" in installation.content

# Test flattening
flat = flatten_with_breadcrumbs(sections)
assert any("Getting Started" in item["breadcrumb"] and "Installation" in item["title"] for item in flat)

# Test chunking
chunk = section_to_chunk(installation, include_ancestors=True)
assert "User Guide" in chunk
assert "Getting Started" in chunk
assert "Installation" in chunk

print("✅ Document hierarchy parser passed!")
`,
    hints: [
      "Count # characters to determine heading level",
      "Use a stack to track current parent at each level",
      "Content is text between headings",
    ],
    solution: `from typing import List, Dict, Optional
from dataclasses import dataclass, field
import re

@dataclass
class Section:
    level: int
    title: str
    content: str
    children: List['Section'] = field(default_factory=list)
    parent_path: List[str] = field(default_factory=list)

def parse_markdown_structure(markdown: str) -> List[Section]:
    lines = markdown.split('\\n')
    root_sections = []
    stack = []  # [(level, section)]
    current_content = []
    
    for line in lines:
        # Check for heading
        heading_match = re.match(r'^(#{1,6})\\s+(.+)$', line)
        
        if heading_match:
            # Save content to previous section
            if stack:
                stack[-1][1].content = '\\n'.join(current_content).strip()
            current_content = []
            
            level = len(heading_match.group(1))
            title = heading_match.group(2).strip()
            
            # Build parent path
            parent_path = [s[1].title for s in stack if s[0] < level]
            
            section = Section(level, title, "", parent_path=parent_path)
            
            # Pop sections at same or deeper level
            while stack and stack[-1][0] >= level:
                stack.pop()
            
            # Add as child or root
            if stack:
                stack[-1][1].children.append(section)
            else:
                root_sections.append(section)
            
            stack.append((level, section))
        else:
            current_content.append(line)
    
    # Save final content
    if stack:
        stack[-1][1].content = '\\n'.join(current_content).strip()
    
    return root_sections

def flatten_with_breadcrumbs(sections: List[Section], path: List[str] = None) -> List[Dict]:
    if path is None:
        path = []
    
    result = []
    for section in sections:
        current_path = path + [section.title]
        result.append({
            "title": section.title,
            "content": section.content,
            "breadcrumb": " > ".join(current_path),
            "level": section.level,
        })
        result.extend(flatten_with_breadcrumbs(section.children, current_path))
    
    return result

def section_to_chunk(section: Section, include_ancestors: bool = True) -> str:
    parts = []
    if include_ancestors and section.parent_path:
        parts.append(" > ".join(section.parent_path))
    parts.append(f"## {section.title}")
    if section.content:
        parts.append(section.content)
    return "\\n".join(parts)
`,
    complexity: {
      time: "O(N) for N lines",
      space: "O(D) for D depth of nesting",
    },
    realWorld: {
      description: "Notion, Confluence, and documentation platforms all use hierarchical document structure. Section-aware RAG dramatically improves retrieval quality.",
      companies: ["Notion", "Confluence", "GitBook"],
      useCases: ["Documentation search", "Knowledge base", "Technical manuals"],
    },
    prerequisites: ["markdown-header-chunking"],
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
  
  // ============================================
  // CONVERSATION MEMORY
  // ============================================
  {
    slug: "conversation-buffer-memory",
    title: "Conversation Buffer Memory",
    description:
      "Implement sliding window conversation memory for multi-turn RAG. Why: Context from previous turns is essential. Solves: Maintains conversation context within token limits.",
    group: "Phase 7 — Conversational RAG",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Message:
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict = field(default_factory=dict)

class ConversationMemory:
    """
    Sliding window conversation memory.
    """
    
    def __init__(self, max_messages: int = 10, max_tokens: int = 4000):
        self.max_messages = max_messages
        self.max_tokens = max_tokens
        self.messages: List[Message] = []
    
    def add_message(self, role: str, content: str, metadata: Dict = None) -> None:
        """Add a message to the conversation."""
        # TODO: Implement
        raise NotImplementedError
    
    def get_context(self, max_messages: int = None) -> List[Dict]:
        """
        Get conversation context as list of {role, content} dicts.
        
        Respects max_messages limit (uses instance default if not specified).
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_context_string(self, max_tokens: int = None) -> str:
        """
        Get conversation as a formatted string.
        
        Truncates older messages to fit within token limit.
        Simple token estimation: 1 token ≈ 4 characters.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def summarize_and_compress(self, summary_fn) -> str:
        """
        Summarize older messages to reduce token usage.
        
        summary_fn: function(text) -> summary
        
        Returns the compressed context.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def clear(self) -> None:
        """Clear conversation history."""
        self.messages = []
`,
    testCode: `memory = ConversationMemory(max_messages=5, max_tokens=500)

# Add messages
memory.add_message("user", "What is RAG?")
memory.add_message("assistant", "RAG is Retrieval Augmented Generation.")
memory.add_message("user", "How does it work?")
memory.add_message("assistant", "It retrieves relevant documents and uses them for generation.")

# Test context retrieval
context = memory.get_context()
assert len(context) == 4
assert context[0]["role"] == "user"
assert context[0]["content"] == "What is RAG?"

# Test limited context
limited = memory.get_context(max_messages=2)
assert len(limited) == 2
assert limited[0]["role"] == "user"
assert limited[0]["content"] == "How does it work?"  # Most recent

# Test string context
context_str = memory.get_context_string()
assert "What is RAG?" in context_str
assert "Retrieval Augmented Generation" in context_str

# Test sliding window
for i in range(10):
    memory.add_message("user", f"Question {i}")

context = memory.get_context()
assert len(context) <= 5  # Respects max_messages

# Test clear
memory.clear()
assert len(memory.get_context()) == 0

print("✅ Conversation buffer memory passed!")
`,
    hints: [
      "Append new messages and trim if over max_messages",
      "For string context, build bottom-up and stop when token limit hit",
      "Estimate tokens as len(text) / 4",
    ],
    solution: `from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Message:
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict = field(default_factory=dict)

class ConversationMemory:
    def __init__(self, max_messages: int = 10, max_tokens: int = 4000):
        self.max_messages = max_messages
        self.max_tokens = max_tokens
        self.messages: List[Message] = []
    
    def add_message(self, role: str, content: str, metadata: Dict = None) -> None:
        msg = Message(role, content, metadata=metadata or {})
        self.messages.append(msg)
        
        # Trim to max_messages
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self, max_messages: int = None) -> List[Dict]:
        limit = max_messages or self.max_messages
        recent = self.messages[-limit:]
        return [{"role": m.role, "content": m.content} for m in recent]
    
    def _estimate_tokens(self, text: str) -> int:
        return len(text) // 4
    
    def get_context_string(self, max_tokens: int = None) -> str:
        limit = max_tokens or self.max_tokens
        
        # Build from most recent, stop when over limit
        result = []
        total_tokens = 0
        
        for msg in reversed(self.messages):
            line = f"{msg.role}: {msg.content}"
            tokens = self._estimate_tokens(line)
            
            if total_tokens + tokens > limit:
                break
            
            result.append(line)
            total_tokens += tokens
        
        result.reverse()
        return "\\n".join(result)
    
    def summarize_and_compress(self, summary_fn) -> str:
        if len(self.messages) <= 2:
            return self.get_context_string()
        
        # Keep last 2, summarize the rest
        to_summarize = self.messages[:-2]
        summary_text = "\\n".join(f"{m.role}: {m.content}" for m in to_summarize)
        summary = summary_fn(summary_text)
        
        recent = "\\n".join(f"{m.role}: {m.content}" for m in self.messages[-2:])
        return f"[Previous conversation summary: {summary}]\\n\\n{recent}"
    
    def clear(self) -> None:
        self.messages = []
`,
    complexity: {
      time: "O(N) for N messages",
      space: "O(M) for M max_messages stored",
    },
    realWorld: {
      description: "ChatGPT, Claude, and every conversational AI uses conversation memory. The sliding window pattern is standard for managing context length.",
      companies: ["OpenAI", "Anthropic", "LangChain", "LlamaIndex"],
      useCases: ["Chat interfaces", "Customer support", "Virtual assistants"],
    },
    prerequisites: ["prompt-template"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
  {
    slug: "entity-memory",
    title: "Entity-Based Memory",
    description:
      "Track and recall entities mentioned in conversations. Why: Users refer to entities by pronouns. Solves: Enables 'it', 'that', 'them' resolution across turns.",
    group: "Phase 7 — Conversational RAG",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Set, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import re

@dataclass
class Entity:
    name: str
    entity_type: str  # "person", "company", "product", etc.
    mentions: List[str] = field(default_factory=list)
    last_mentioned: int = 0  # Turn number
    metadata: Dict = field(default_factory=dict)

class EntityMemory:
    """
    Track entities across conversation turns for pronoun resolution.
    """
    
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.turn_count: int = 0
        self._type_patterns = {
            "person": r"\\b(Alice|Bob|John|Jane|Dr\\.|Mr\\.|Ms\\.)\\s*\\w*\\b",
            "company": r"\\b(OpenAI|Google|Microsoft|Apple|Meta|Amazon)\\b",
            "product": r"\\b(GPT-4|Claude|Gemini|iPhone|MacBook)\\b",
        }
    
    def extract_entities(self, text: str) -> List[Entity]:
        """
        Extract entities from text using pattern matching.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def add_turn(self, text: str) -> List[Entity]:
        """
        Process a conversation turn.
        
        1. Extract entities
        2. Update or add to entity memory
        3. Increment turn count
        
        Returns list of entities found in this turn.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def resolve_pronoun(self, pronoun: str) -> Optional[Entity]:
        """
        Resolve pronouns to most recently mentioned entity.
        
        - "he/him/his" -> most recent person entity
        - "it/its" -> most recent product/company
        - "they/them" -> most recent company or group
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_context_summary(self) -> str:
        """
        Generate a summary of known entities for context injection.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `memory = EntityMemory()

# First turn
entities1 = memory.add_turn("Alice works at OpenAI. She is a researcher.")
assert any(e.name == "Alice" for e in entities1)
assert any(e.name == "OpenAI" for e in entities1)

# Pronoun resolution
person = memory.resolve_pronoun("she")
assert person is not None
assert person.name == "Alice"

company = memory.resolve_pronoun("it")
assert company.name == "OpenAI"

# Second turn
entities2 = memory.add_turn("Bob also works there. He uses GPT-4.")
assert any(e.name == "Bob" for e in entities2)
assert any(e.name == "GPT-4" for e in entities2)

# Pronoun now resolves to most recent
person2 = memory.resolve_pronoun("he")
assert person2.name == "Bob"

# Context summary
summary = memory.get_context_summary()
assert "Alice" in summary
assert "Bob" in summary
assert "OpenAI" in summary

print("✅ Entity memory passed!")
`,
    hints: [
      "Use regex patterns to find entity names",
      "Track last_mentioned turn for recency",
      "Map pronouns to entity types for resolution",
    ],
    solution: `from typing import List, Dict, Set, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import re

@dataclass
class Entity:
    name: str
    entity_type: str
    mentions: List[str] = field(default_factory=list)
    last_mentioned: int = 0
    metadata: Dict = field(default_factory=dict)

class EntityMemory:
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.turn_count: int = 0
        self._type_patterns = {
            "person": r"\\b(Alice|Bob|John|Jane|Dr\\.|Mr\\.|Ms\\.)\\s*\\w*\\b",
            "company": r"\\b(OpenAI|Google|Microsoft|Apple|Meta|Amazon)\\b",
            "product": r"\\b(GPT-4|Claude|Gemini|iPhone|MacBook)\\b",
        }
        self._pronoun_map = {
            "he": "person", "him": "person", "his": "person",
            "she": "person", "her": "person",
            "it": ["product", "company"],
            "its": ["product", "company"],
            "they": "company", "them": "company",
        }
    
    def extract_entities(self, text: str) -> List[Entity]:
        found = []
        for entity_type, pattern in self._type_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.strip()
                found.append(Entity(name, entity_type, [text], self.turn_count))
        return found
    
    def add_turn(self, text: str) -> List[Entity]:
        self.turn_count += 1
        entities = self.extract_entities(text)
        
        for entity in entities:
            entity.last_mentioned = self.turn_count
            if entity.name in self.entities:
                self.entities[entity.name].mentions.append(text)
                self.entities[entity.name].last_mentioned = self.turn_count
            else:
                self.entities[entity.name] = entity
        
        return entities
    
    def resolve_pronoun(self, pronoun: str) -> Optional[Entity]:
        pronoun = pronoun.lower()
        target_types = self._pronoun_map.get(pronoun)
        
        if not target_types:
            return None
        
        if isinstance(target_types, str):
            target_types = [target_types]
        
        candidates = [e for e in self.entities.values() if e.entity_type in target_types]
        
        if not candidates:
            return None
        
        # Return most recently mentioned
        return max(candidates, key=lambda e: e.last_mentioned)
    
    def get_context_summary(self) -> str:
        if not self.entities:
            return "No entities tracked."
        
        by_type = defaultdict(list)
        for entity in self.entities.values():
            by_type[entity.entity_type].append(entity.name)
        
        parts = []
        for etype, names in by_type.items():
            parts.append(f"{etype.title()}s: {', '.join(names)}")
        
        return "Known entities - " + "; ".join(parts)
`,
    complexity: {
      time: "O(P * T) for P patterns and T text length",
      space: "O(E) for E unique entities",
    },
    realWorld: {
      description: "Advanced chatbots use entity tracking for coherent multi-turn conversations. LangChain's EntityMemory is a popular implementation.",
      companies: ["LangChain", "Rasa", "Microsoft Bot Framework"],
      useCases: ["Virtual assistants", "Customer support bots", "Interview chatbots"],
    },
    prerequisites: ["conversation-buffer-memory"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  {
    slug: "summary-memory",
    title: "Conversation Summary Memory",
    description:
      "Compress long conversations into summaries to maintain context. Why: Token limits constrain context length. Solves: Enables infinite conversation through progressive summarization.",
    group: "Phase 7 — Conversational RAG",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict, Callable
from dataclasses import dataclass

@dataclass
class ConversationChunk:
    messages: List[Dict]  # [{role, content}]
    summary: str = ""
    token_count: int = 0

class SummaryMemory:
    """
    Progressive summarization for long conversations.
    """
    
    def __init__(self, chunk_size: int = 10, summarizer: Callable = None):
        """
        chunk_size: Number of messages before summarization
        summarizer: Function(text) -> summary
        """
        self.chunk_size = chunk_size
        self.summarizer = summarizer or self._default_summarizer
        self.chunks: List[ConversationChunk] = []
        self.current_messages: List[Dict] = []
    
    def _default_summarizer(self, text: str) -> str:
        """Simple extractive summary (first and last sentences)."""
        # TODO: Implement
        raise NotImplementedError
    
    def add_message(self, role: str, content: str) -> None:
        """
        Add message and trigger summarization if needed.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_full_context(self) -> str:
        """
        Get full context: all summaries + current messages.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_compressed_context(self, max_tokens: int = 2000) -> str:
        """
        Get context that fits within token limit.
        
        Prioritize recent messages over old summaries.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `def mock_summarizer(text: str) -> str:
    return f"Summary: Discussed {len(text.split())} words of content."

memory = SummaryMemory(chunk_size=3, summarizer=mock_summarizer)

# Add messages
for i in range(10):
    role = "user" if i % 2 == 0 else "assistant"
    memory.add_message(role, f"Message {i}: This is some content.")

# Should have created summaries
assert len(memory.chunks) >= 2, "Should have summarized chunks"

# Get context
full = memory.get_full_context()
assert "Summary:" in full
assert "Message" in full

# Compressed context
compressed = memory.get_compressed_context(max_tokens=500)
assert len(compressed) < len(full) or len(full) <= 500

print("✅ Summary memory passed!")
`,
    hints: [
      "Track messages until chunk_size, then summarize and archive",
      "Concatenate chunk summaries with current messages for context",
      "For compression, include current messages first, then fit summaries",
    ],
    solution: `from typing import List, Dict, Callable
from dataclasses import dataclass

@dataclass
class ConversationChunk:
    messages: List[Dict]
    summary: str = ""
    token_count: int = 0

class SummaryMemory:
    def __init__(self, chunk_size: int = 10, summarizer: Callable = None):
        self.chunk_size = chunk_size
        self.summarizer = summarizer or self._default_summarizer
        self.chunks: List[ConversationChunk] = []
        self.current_messages: List[Dict] = []
    
    def _default_summarizer(self, text: str) -> str:
        sentences = text.replace('\\n', ' ').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        if len(sentences) <= 2:
            return text[:200]
        return f"{sentences[0]}. ... {sentences[-1]}."
    
    def _estimate_tokens(self, text: str) -> int:
        return len(text) // 4
    
    def add_message(self, role: str, content: str) -> None:
        self.current_messages.append({"role": role, "content": content})
        
        if len(self.current_messages) >= self.chunk_size:
            # Summarize and archive
            text = "\\n".join(f"{m['role']}: {m['content']}" for m in self.current_messages)
            summary = self.summarizer(text)
            
            chunk = ConversationChunk(
                messages=self.current_messages.copy(),
                summary=summary,
                token_count=self._estimate_tokens(text)
            )
            self.chunks.append(chunk)
            self.current_messages = []
    
    def get_full_context(self) -> str:
        parts = []
        
        for chunk in self.chunks:
            parts.append(f"[{chunk.summary}]")
        
        for msg in self.current_messages:
            parts.append(f"{msg['role']}: {msg['content']}")
        
        return "\\n\\n".join(parts)
    
    def get_compressed_context(self, max_tokens: int = 2000) -> str:
        # Build current messages first
        current_text = "\\n".join(f"{m['role']}: {m['content']}" for m in self.current_messages)
        current_tokens = self._estimate_tokens(current_text)
        
        if current_tokens >= max_tokens:
            return current_text[:max_tokens * 4]
        
        remaining = max_tokens - current_tokens
        
        # Add summaries from most recent to oldest
        summary_parts = []
        for chunk in reversed(self.chunks):
            summary_tokens = self._estimate_tokens(chunk.summary)
            if summary_tokens <= remaining:
                summary_parts.append(f"[{chunk.summary}]")
                remaining -= summary_tokens
            else:
                break
        
        summary_parts.reverse()
        
        if summary_parts:
            return "\\n\\n".join(summary_parts) + "\\n\\n" + current_text
        return current_text
`,
    complexity: {
      time: "O(N) for N messages",
      space: "O(C) for C chunks stored",
    },
    realWorld: {
      description: "LangChain's ConversationSummaryMemory and similar patterns are used in production chatbots to handle hour-long conversations.",
      companies: ["LangChain", "Anthropic", "Google"],
      useCases: ["Long conversations", "Interview bots", "Therapy chatbots"],
    },
    prerequisites: ["conversation-buffer-memory"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "production-deployment-checklist"],
  },
];
