# Chunking Strategies Expansion Plan

## 📋 Overview

This document maps **new chunking techniques** to appropriate phases/stages in the RAG Academy curriculum, ensuring no duplication with existing content and logical learning progression.

---

## 🔍 Existing Coverage Analysis

### Already Implemented ✅

| Technique                    | Existing Challenge(s)                                | Stage         |
| ---------------------------- | ---------------------------------------------------- | ------------- |
| Fixed-size (token/char/word) | `fixed-size-chunking-fundamentals`                   | pre-retrieval |
| Overlapping chunking         | `overlapping-chunking-explained`, `overlap-chunking` | pre-retrieval |
| Sentence-level               | `sentence-based-chunking`, `sentence-chunking`       | pre-retrieval |
| Paragraph-level              | `paragraph-based-chunking`                           | pre-retrieval |
| Sliding-window               | `sliding-window-chunking`                            | pre-retrieval |
| Recursive character/token    | `recursive-chunking`                                 | pre-retrieval |
| Section-based                | `section-based-chunking`                             | pre-retrieval |
| Markdown header-aware        | `markdown-header-chunking`                           | pre-retrieval |
| Semantic chunking            | `semantic-chunking`                                  | pre-retrieval |
| Hierarchical                 | `hierarchical-chunking`                              | pre-retrieval |
| Metadata-aware               | `metadata-aware-chunking`                            | pre-retrieval |
| Code-aware                   | `code-aware-chunking`                                | pre-retrieval |
| Table-aware                  | `table-aware-chunking`                               | pre-retrieval |
| Agentic chunking             | `agentic-chunking`                                   | pre-retrieval |
| Parent-document              | `parent-document-chunking`                           | pre-retrieval |
| Late chunking                | `late-chunking`, `late-chunking-implementation`      | pre-retrieval |
| Proposition                  | `proposition-chunking`                               | pre-retrieval |
| Contextual headers           | `contextual-chunk-headers`                           | pre-retrieval |
| Chunking router              | `chunking-router`                                    | pre-retrieval |

---

## 🆕 New Techniques to Add

### Category 1: Length-based & Simple Structural (Phase 0-1)

These are foundational concepts, some already exist but could be enhanced.

| Technique                   | Status | Recommended Action   | Stage           |
| --------------------------- | ------ | -------------------- | --------------- |
| **Page-level chunking**     | ❌ NEW | Add as new challenge | `pre-retrieval` |
| **Document-level chunking** | ❌ NEW | Add as new challenge | `pre-retrieval` |

#### New Challenge: `page-level-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Easy
- **Prerequisites**: `fixed-size-chunking-fundamentals`
- **Rationale**: Evaluations show page-level often performs surprisingly well. Essential for PDF/slide-based RAG.
- **Group**: "Chunking Masterclass — Level 1: Basics"

#### New Challenge: `document-level-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Easy
- **Prerequisites**: `fixed-size-chunking-fundamentals`
- **Rationale**: For short, self-contained docs (tickets, news, FAQs). Important pattern for customer support RAG.
- **Group**: "Chunking Masterclass — Level 1: Basics"

---

### Category 2: Recursive & Hierarchy-aware (Phase 1-2)

| Technique                   | Status     | Recommended Action                       | Stage           |
| --------------------------- | ---------- | ---------------------------------------- | --------------- |
| Recursive character/token   | ✅ EXISTS  | `recursive-chunking` already covers this | -               |
| Document-structure–aware    | ✅ PARTIAL | Enhance `section-based-chunking`         | -               |
| **Layout-aware (PDF/HTML)** | ❌ NEW     | Add as new challenge                     | `pre-retrieval` |

#### New Challenge: `layout-aware-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `section-based-chunking`
- **Rationale**: Uses DOM/layout (columns, sidebars, footers) - essential for real-world PDFs. Mention Unstructured.io.
- **Group**: "Chunking Masterclass — Level 4: Structure-Aware"

---

### Category 3: Semantic / Similarity-driven (Phase 2-3)

| Technique                       | Status    | Recommended Action                                  | Stage           |
| ------------------------------- | --------- | --------------------------------------------------- | --------------- |
| Semantic chunking               | ✅ EXISTS | `semantic-chunking` covers basic threshold approach | -               |
| **Max-min semantic chunking**   | ❌ NEW    | Add as new challenge                                | `pre-retrieval` |
| **Statistical break detection** | ❌ NEW    | Add as new challenge                                | `pre-retrieval` |

#### New Challenge: `maxmin-semantic-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `semantic-chunking`
- **Rationale**: Advanced technique using embeddings upfront to maximize intra-chunk coherence.
- **Group**: "Chunking Masterclass — Level 5: Semantic"

#### New Challenge: `statistical-break-detection`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `semantic-chunking`
- **Rationale**: Percentile/IQR-based thresholds for boundary detection. More robust than fixed thresholds.
- **Group**: "Chunking Masterclass — Level 5: Semantic"

---

### Category 4: Hybrid Semantic + Structural (Phase 3-4)

| Technique                          | Status | Recommended Action   | Stage           |
| ---------------------------------- | ------ | -------------------- | --------------- |
| **Semantic-guided recursive**      | ❌ NEW | Add as new challenge | `pre-retrieval` |
| **Concept/topic-based chunking**   | ❌ NEW | Add as new challenge | `pre-retrieval` |
| **Ontology/schema-aware chunking** | ❌ NEW | Add as new challenge | `pre-retrieval` |

#### New Challenge: `semantic-guided-recursive-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `recursive-chunking`, `semantic-chunking`
- **Rationale**: Combines the best of both worlds - structural + semantic refinement.
- **Group**: "Chunking Masterclass — Level 6: Hybrid"

#### New Challenge: `topic-based-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `semantic-chunking`
- **Rationale**: Uses clustering/topic modeling to group by concept rather than linear order.
- **Group**: "Chunking Masterclass — Level 6: Hybrid"

#### New Challenge: `ontology-aware-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Expert
- **Prerequisites**: `section-based-chunking`, `metadata-aware-chunking`
- **Rationale**: Domain-specific (legal clauses, financial sections, API schemas). Critical for enterprise RAG.
- **Group**: "Chunking Masterclass — Level 7: Cutting-Edge"

---

### Category 5: Overlap & Context-augmentation Patterns (Phase 2)

| Technique                       | Status    | Recommended Action                    | Stage           |
| ------------------------------- | --------- | ------------------------------------- | --------------- |
| Sliding window with overlap     | ✅ EXISTS | `sliding-window-chunking` covers this | -               |
| **Variable overlap (semantic)** | ❌ NEW    | Add as new challenge                  | `pre-retrieval` |
| **Context-augmented chunks**    | ❌ NEW    | Add as new challenge                  | `pre-retrieval` |

#### New Challenge: `variable-overlap-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Medium
- **Prerequisites**: `sliding-window-chunking`, `semantic-chunking`
- **Rationale**: Increase overlap at semantic boundaries - smarter resource usage.
- **Group**: "Chunking Masterclass — Level 5: Semantic"

#### New Challenge: `context-augmented-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Medium
- **Prerequisites**: `section-based-chunking`, `metadata-aware-chunking`
- **Rationale**: Attach summaries/titles/parent metadata. Critical for Anthropic's contextual retrieval.
- **Group**: "Chunking Masterclass — Level 4: Structure-Aware"
- **Note**: May overlap with `contextual-chunk-headers` - consider merging or expanding existing.

---

### Category 6: Granularity & Document-type Specific (Phase 2-3)

| Technique                             | Status    | Recommended Action       | Stage           |
| ------------------------------------- | --------- | ------------------------ | --------------- |
| Section-level                         | ✅ EXISTS | `section-based-chunking` | -               |
| Table-aware                           | ✅ EXISTS | `table-aware-chunking`   | -               |
| Code-block aware                      | ✅ EXISTS | `code-aware-chunking`    | -               |
| **Domain-specific (legal/financial)** | ❌ NEW    | Add as new challenge     | `pre-retrieval` |

#### New Challenge: `legal-clause-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `section-based-chunking`
- **Rationale**: Chunk by clauses, articles, contract sections. High-value enterprise use case.
- **Group**: "Chunking Masterclass — Level 7: Cutting-Edge"

#### New Challenge: `financial-statement-chunking`

- **Stage**: `pre-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `table-aware-chunking`, `section-based-chunking`
- **Rationale**: Chunk by financial statement blocks, notes, disclosures.
- **Group**: "Chunking Masterclass — Level 7: Cutting-Edge"

---

### Category 7: Evaluation & Retrieval-oriented (Phase 4-5)

These interact with retrieval strategy more than raw text splitting.

| Technique                                     | Status | Recommended Action   | Stage                |
| --------------------------------------------- | ------ | -------------------- | -------------------- |
| **Retrieval-unit vs context-unit separation** | ❌ NEW | Add as new challenge | `post-retrieval`     |
| **Multi-scale chunking**                      | ❌ NEW | Add as new challenge | `advanced-retrieval` |
| **Learned/data-driven chunking evaluation**   | ❌ NEW | Add as new challenge | `evaluation-ops`     |

#### New Challenge: `retrieval-context-separation`

- **Stage**: `post-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `parent-document-chunking`
- **Rationale**: Small retrieval units, large context units. Production pattern for LLM context optimization.
- **Group**: "Post-Retrieval — Context Shaping"

#### New Challenge: `multiscale-chunking`

- **Stage**: `advanced-retrieval`
- **Difficulty**: Hard
- **Prerequisites**: `hierarchical-chunking`
- **Rationale**: Store sentence/paragraph/page granularities; let retriever pick scale per query.
- **Group**: "Advanced Retrieval — Multi-scale"

#### New Challenge: `chunking-strategy-evaluation`

- **Stage**: `evaluation-ops`
- **Difficulty**: Medium
- **Prerequisites**: `evaluator-recall-at-k`, `evaluator-mrr`
- **Rationale**: Systematically compare strategies with retrieval metrics. Meta-skill for RAG optimization.
- **Group**: "Evaluation — Chunking Analysis"

---

## 📊 Summary: New Challenges to Add

| #   | Challenge Slug                       | Stage              | Difficulty | Category           |
| --- | ------------------------------------ | ------------------ | ---------- | ------------------ |
| 1   | `page-level-chunking`                | pre-retrieval      | Easy       | Length-based       |
| 2   | `document-level-chunking`            | pre-retrieval      | Easy       | Length-based       |
| 3   | `layout-aware-chunking`              | pre-retrieval      | Hard       | Structure-aware    |
| 4   | `maxmin-semantic-chunking`           | pre-retrieval      | Hard       | Semantic           |
| 5   | `statistical-break-detection`        | pre-retrieval      | Hard       | Semantic           |
| 6   | `semantic-guided-recursive-chunking` | pre-retrieval      | Hard       | Hybrid             |
| 7   | `topic-based-chunking`               | pre-retrieval      | Hard       | Hybrid             |
| 8   | `ontology-aware-chunking`            | pre-retrieval      | Expert     | Hybrid             |
| 9   | `variable-overlap-chunking`          | pre-retrieval      | Medium     | Overlap            |
| 10  | `context-augmented-chunking`         | pre-retrieval      | Medium     | Overlap            |
| 11  | `legal-clause-chunking`              | pre-retrieval      | Hard       | Domain-specific    |
| 12  | `financial-statement-chunking`       | pre-retrieval      | Hard       | Domain-specific    |
| 13  | `retrieval-context-separation`       | post-retrieval     | Hard       | Retrieval-oriented |
| 14  | `multiscale-chunking`                | advanced-retrieval | Hard       | Retrieval-oriented |
| 15  | `chunking-strategy-evaluation`       | evaluation-ops     | Medium     | Evaluation         |

---

## 🎓 Recommended Learning Path

```
LEVEL 1: Basics (Phase 0-1)
├── fixed-size-chunking-fundamentals ✅
├── overlapping-chunking-explained ✅
├── page-level-chunking 🆕
└── document-level-chunking 🆕

LEVEL 2: Linguistic (Phase 1)
├── sentence-based-chunking ✅
├── paragraph-based-chunking ✅
└── sliding-window-chunking ✅

LEVEL 3: Advanced Overlap (Phase 2)
├── recursive-chunking ✅
└── variable-overlap-chunking 🆕

LEVEL 4: Structure-Aware (Phase 2)
├── section-based-chunking ✅
├── markdown-header-chunking ✅
├── layout-aware-chunking 🆕
└── context-augmented-chunking 🆕

LEVEL 5: Semantic (Phase 2-3)
├── semantic-chunking ✅
├── maxmin-semantic-chunking 🆕
└── statistical-break-detection 🆕

LEVEL 6: Hybrid (Phase 3)
├── semantic-guided-recursive-chunking 🆕
├── topic-based-chunking 🆕
└── hierarchical-chunking ✅

LEVEL 7: Cutting-Edge (Phase 3-4)
├── agentic-chunking ✅
├── code-aware-chunking ✅
├── table-aware-chunking ✅
├── ontology-aware-chunking 🆕
├── legal-clause-chunking 🆕
├── financial-statement-chunking 🆕
└── parent-document-chunking ✅

LEVEL 8: Retrieval-Oriented (Phase 4-5)
├── retrieval-context-separation 🆕
├── multiscale-chunking 🆕
└── chunking-strategy-evaluation 🆕
```

---

## 📁 File Placement

| New Challenge                        | Target File                                        |
| ------------------------------------ | -------------------------------------------------- |
| `page-level-chunking`                | `chunkingMasterclass.ts`                           |
| `document-level-chunking`            | `chunkingMasterclass.ts`                           |
| `layout-aware-chunking`              | `advancedChunking.ts`                              |
| `maxmin-semantic-chunking`           | `advancedChunking.ts`                              |
| `statistical-break-detection`        | `advancedChunking.ts`                              |
| `semantic-guided-recursive-chunking` | `advancedChunking.ts`                              |
| `topic-based-chunking`               | `advancedChunking.ts`                              |
| `ontology-aware-chunking`            | `advancedChunking.ts`                              |
| `variable-overlap-chunking`          | `chunkingMasterclass.ts`                           |
| `context-augmented-chunking`         | `chunkingMasterclass.ts`                           |
| `legal-clause-chunking`              | `advancedChunking.ts` (or new `domainChunking.ts`) |
| `financial-statement-chunking`       | `advancedChunking.ts` (or new `domainChunking.ts`) |
| `retrieval-context-separation`       | `postRetrieval.ts`                                 |
| `multiscale-chunking`                | `advancedRetrieval.ts`                             |
| `chunking-strategy-evaluation`       | `evaluationOps.ts`                                 |

---

## ✅ Next Steps

1. **Phase 1**: Add Level 1 basics (`page-level`, `document-level`) - Low effort, high value
2. **Phase 2**: Add semantic extensions (`maxmin`, `statistical-break`) - Medium effort
3. **Phase 3**: Add hybrid strategies (`semantic-guided-recursive`, `topic-based`) - Higher effort
4. **Phase 4**: Add domain-specific (`legal-clause`, `financial-statement`) - Enterprise value
5. **Phase 5**: Add evaluation challenge (`chunking-strategy-evaluation`) - Meta-learning

---

## 📝 Notes

- Some existing challenges may need **enhancements** rather than new challenges (e.g., `contextual-chunk-headers` already partially covers context-augmented)
- Consider creating a **"Domain Chunking"** category for legal/financial/medical specializations
- The **`chunking-router`** challenge could be expanded to include these new strategies in its routing logic
