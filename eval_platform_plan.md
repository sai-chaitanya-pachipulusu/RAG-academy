# Plan: Evolution to "LeetCode for RAG"

To transform RAG Academy into a competitive, high-mastery platform similar to LeetCode or HackerRank, we need to move beyond simple "pass/fail" checks and into **quantitative performance metrics**, **richer feedback loops**, and **competitive elements**.

## 1. The "RAG Rank" System (Scoring & Benchmarking)

Instead of just `assert passed`, every challenge should return a **Score** based on RAG metrics.

- **Accuracy Score:** For retrieval tasks, calculate `Recall@K`, `MRR`, or `nDCG` against a hidden golden dataset.
  - _Example:_ "Your BM25 implementation achieved 0.85 Recall. The optimal solution is 0.92. Try tuning `k1`."
- **Efficiency Score:** Measure latency or token usage.
  - _Example:_ "Your Reranker is accurate (0.95 nDCG) but slow (500ms). Can you optimize the pre-filter?"
- **Cost Score:** For agentic tasks, measure "Tokens Used" to solve the problem. Lower is better.

## 2. "Unit Test" -> "Dataset Eval" Transition

Currently, tests are simple unit tests (`assert f(x) == y`).
**Upgrade:**

- Introduce **mini-datasets** (e.g., `corpus.json`, `queries.json`, `qrels.json`) into the challenge environment.
- The user's code must process 100+ items, not just 1.
- This teaches **Batch Processing** and **Vectorization** implicitly.

## 3. Interactive "Playground" Tutorials

Static MDX is okay, but "LeetCode" has interactive explanations.

- **Visual Debuggers:** When a user runs a chunking algorithm, _visually show_ the chunks and overlaps in the UI.
- **Step-by-Step Execution:** For something like "RRF Fusion", allow the user to see the two input lists and the fused list side-by-side.

## 4. Proposed Feature: "The Arena" (Daily Challenges)

- **Daily RAG Problem:** "Today's Dataset: Tech Support Logs. Task: Retrieve the solution for 'Error 503' with < 100ms latency."
- **Leaderboard:** Based on the composite score (Accuracy \* Speed).

## 5. Curriculum Enhancements (Tutorials)

The "Learn" content needs to be more than text.

- **Interactive Diagrams:** Click to see how data flows.
- **"Fix the Bug" Drills:** Give a broken RAG pipeline (e.g., bad chunking leading to context loss) and ask the user to debug it.

## Implementation Roadmap (Next Steps)

### Phase 1: Enhanced Test Runners (Immediate)

- [x] Update `types.ts` to support `score` return values, not just boolean pass/fail.
- [x] Update `ChallengeIDE` to display scores, metrics, and "Benchmark" badges.
- [x] Update `pyodide` executor and worker to handle scoring.
- [x] Convert `bm25-from-scratch` to use "Benchmark Mode" (Latency scoring).
- [x] Create a standardized `Dataset` class for challenges to use.
- [x] Integrate `Dataset` into `Challenge` and `Pyodide` runtime.

### Phase 2: Visual Feedback (UI)

- [x] Update the Challenge UI component to render "Visual Diffs" or "Tables" (Basic generic render implemented).
- [x] Create specialized visualizer components (e.g., TableView, TreeView) - Created `RetrievalVisualizer`.

### Phase 3: The "Arena"

- [x] Create a specialized "Benchmark" challenge type (`benchmark: true` + `dataset`).
- [x] Create a "Daily Challenge" discovery (Dashboard integration).
- [x] Implement global Leaderboard (Backend/UI).

---

**Status:** The "Arena" is live on the Dashboard. Users can play the daily "TF-IDF Log Search" challenge. Next: Leaderboard infrastructure.

## Phase 4: "Build from Scratch" Multi-Part Tracks

**Goal:** Challenges that link together, where you build a real system component-by-component.

### Track 1: Build a Vector DB

| #   | Challenge            | What You Build                       |
| --- | -------------------- | ------------------------------------ |
| 1   | `dense-vector-class` | The `DenseVector` core object        |
| 2   | `naive-flat-index`   | Exact k-NN `FlatIndex` (brute force) |
| 3   | `ivf-flat-index`     | Approximate `IVFIndex` (clustering)  |
| 4   | `hnsw-index`         | Graph-based HNSW for log(n) search   |

### Track 2: Build a RAG Pipeline

| #   | Challenge                | What You Build                            |
| --- | ------------------------ | ----------------------------------------- |
| 1   | `rag-pipeline-chunker`   | Document `Chunker` with overlap           |
| 2   | `rag-pipeline-embedder`  | Mock `Embedder` class                     |
| 3   | `rag-pipeline-retriever` | Full `Retriever` wiring everything        |
| 4   | `rag-pipeline-generator` | Full `RAGPipeline` with prompt formatting |

### Track 3: Build a Reranker

| #   | Challenge                 | What You Build                      |
| --- | ------------------------- | ----------------------------------- |
| 1   | `reranker-score-function` | `MockCrossEncoder` scoring function |
| 2   | `reranker-cascade`        | Two-stage `CascadeReranker` system  |

### Track 4: Build an Evaluator

| #   | Challenge               | What You Build                              |
| --- | ----------------------- | ------------------------------------------- |
| 1   | `evaluator-recall-at-k` | Recall@K metric from scratch                |
| 2   | `evaluator-mrr`         | MRR (Mean Reciprocal Rank)                  |
| 3   | `evaluator-ndcg`        | nDCG (Normalized DCG) with graded relevance |

**Status:** All 4 tracks implemented (16 challenges total). Dashboard updated with all "Build from Scratch" tracks.

## Phase 5: Dynamic Platform Features (LeetCode Differentiators)

**Goal:** Make the platform feel alive and engaging.

### Implemented Features

| Feature                 | Location             | Description                                                             |
| ----------------------- | -------------------- | ----------------------------------------------------------------------- |
| **Execution Stats**     | `ExecutionStats.tsx` | Tracks success rate, avg time, attempts per challenge with visual graph |
| **Achievements**        | `Achievements.tsx`   | 8 achievements (First Blood, Vector Master, Speed Demon, etc.)          |
| **Streak Tracking**     | `Streak.tsx`         | Daily streak with weekly activity heatmap                               |
| **Complexity Metadata** | Challenge types      | Time/Space complexity + production latency                              |
| **Real-World Context**  | Challenge types      | Company tags, use cases, production notes                               |
| **Related Challenges**  | ChallengeIDE         | "Continue Learning" navigation between challenges                       |
| **Slide-up Toasts**     | globals.css          | Animated achievement unlock notifications                               |

### Rich Challenge Metadata Schema

```typescript
complexity: {
  time: "O(n log n)",
  space: "O(n)",
  latency: "~10ms per 1000 docs"
}
realWorld: {
  description: "This is how Pinecone...",
  companies: ["OpenAI", "Anthropic"],
  useCases: ["Semantic search"]
}
prerequisites: ["dot-product"]
relatedChallenges: ["ivf-flat-index"]
```

**Status:** Phase 5 complete. Dashboard now shows streaks + achievements.

## Phase 6: External Learning Resources

**Goal:** Aggregate the best learning content from across the web into one place.

### Implemented

| Feature                | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Resources Database** | 20+ curated resources from 3Blue1Brown, OpenAI, LangChain, Meta AI, Anthropic, etc. |
| **LearnMore Section**  | Context-aware resource suggestions on each challenge                                |
| **Resources Page**     | `/resources` - searchable/filterable resource library                               |
| **Learning Paths**     | Suggested beginner and advanced learning sequences                                  |
| **Type Filters**       | Videos, Articles, Papers, GitHub, Courses, Documentation                            |

### Resource Sources

| Source          | Type          | Topics                  |
| --------------- | ------------- | ----------------------- |
| 3Blue1Brown     | Video         | Vectors, Linear Algebra |
| OpenAI          | Documentation | Embeddings, API         |
| LangChain       | Course        | RAG, Python             |
| LlamaIndex      | Documentation | RAG, Indexing           |
| Anthropic       | Documentation | Claude, RAG             |
| Meta AI (FAISS) | GitHub        | Vector Search           |
| Pinecone        | Course        | Vector DB               |
| Cohere          | Documentation | Reranking               |
| arXiv           | Papers        | Research                |
| RAGAS           | GitHub        | Evaluation              |

**Status:** Phase 6 complete. Resources page live at `/resources`.

## Phase 7: Advanced Features

**Goal:** Professional-grade learning experience.

### Implemented

| Feature                | Location                   | Description                               |
| ---------------------- | -------------------------- | ----------------------------------------- |
| **Interview Timer**    | `InterviewTimer.tsx`       | Timed challenge mode for interview prep   |
| **Progress Analytics** | `/analytics`               | Visual stats, weekly activity, milestones |
| **Keyboard Shortcuts** | `useKeyboardShortcuts.tsx` | Ctrl+Enter to run, Ctrl+Shift+S to submit |

### Interview Mode

- Difficulty-based timers: Easy (5 min), Medium (10 min), Hard (15 min)
- Visual countdown with color-coded urgency
- Pause/Resume functionality
- Time's up notification

### Analytics Dashboard Features

- Total Completed / XP / Completion Rate / Avg Attempts
- Weekly activity heatmap
- 30-day progress trajectory
- Next milestone trackers

### Keyboard Shortcuts

| Shortcut           | Action          |
| ------------------ | --------------- |
| `Ctrl + Enter`     | Run code        |
| `Ctrl + Shift + S` | Submit solution |
| `Ctrl + Shift + R` | Reset code      |
| `Ctrl + H`         | Toggle hints    |

**Status:** Phase 7 complete. Analytics page live at `/analytics`.

## Phase 8: AI-Powered Features & Interview Prep

**Goal:** Enterprise-grade learning experience with AI assistance.

### AI Code Review (`AICodeReview.tsx`)

Pattern-based code analysis that provides:

- **Score** (0-100) based on code quality
- **Strengths** (type hints, docstrings, error handling)
- **Improvements** (magic numbers, bare excepts, Pythonic patterns)
- **Detailed Feedback** with category and severity

Checks include:

- Type hints usage
- Docstring presence
- Error handling patterns
- Pythonic idioms (list comprehension, zip, enumerate)
- Magic number detection
- Code length/structure
- Challenge-specific validations

### Interview Prep Mode (`/interview`)

Full interview simulation:

- **Session Configuration**: Difficulty (Easy/Medium/Hard/Mixed) + Challenge count (1/3/5/7)
- **Quick Starts**: Warm Up (3 easy), Standard (5 medium), Senior (3 hard)
- **Timed Challenges**: 5/10/15 min per challenge based on difficulty
- **Visual Timer**: Color-coded urgency, pause/resume
- **Interview Tips**: Best practices before starting

### Navigation Updated

| Nav Item       | Path         |
| -------------- | ------------ |
| Interview Prep | `/interview` |
| Analytics      | `/analytics` |
| Resources      | `/resources` |

**Status:** Phase 8 complete. Full AI Code Review + Interview Prep Mode implemented.

## Phase 9: Competitor-Inspired Improvements

**Goal:** Adopt best features from TensorTonic and PaperCode.

### Inspired by TensorTonic

| Feature               | Component              | Description                                                          |
| --------------------- | ---------------------- | -------------------------------------------------------------------- |
| **Theory Tab**        | `TheoryTab.tsx`        | Concept explanations with formulas, visual intuition, interview tips |
| **Challenge Filters** | `ChallengeFilters.tsx` | Search, difficulty filter, track filter, status filter               |
| **Activity Heatmap**  | `ActivityHeatmap.tsx`  | GitHub-style 365-day contribution graph                              |
| **Solution Export**   | `GitHubSync.tsx`       | Download as Markdown or copy to clipboard                            |

### Inspired by PaperCode

| Feature            | Component           | Description                                   |
| ------------------ | ------------------- | --------------------------------------------- |
| **Visual Roadmap** | `VisualRoadmap.tsx` | Interactive skill tree with track progression |
| **Roadmap Page**   | `/roadmap`          | Dedicated page showing learning journey       |

### Theory Content Added

| Challenge               | Theory Includes                                    |
| ----------------------- | -------------------------------------------------- |
| `dot-product`           | Formulas, geometric interpretation, interview tips |
| `cosine-similarity`     | Normalization, edge cases, OpenAI context          |
| `naive-flat-index`      | Time complexity, when to use, FAISS connection     |
| `ivf-flat-index`        | Partitioning, nprobe, production patterns          |
| `evaluator-recall-at-k` | Formula, RAG importance, recall vs precision       |

### New Navigation

| #   | Page           | Path             |
| --- | -------------- | ---------------- |
| 1   | Dashboard      | `/dashboard`     |
| 2   | **Roadmap**    | `/roadmap` (NEW) |
| 3   | Study Plan     | `/plan`          |
| 4   | Learn          | `/learn`         |
| 5   | Challenges     | `/challenges`    |
| 6   | Interview Prep | `/interview`     |
| 7   | Resources      | `/resources`     |
| 8   | Analytics      | `/analytics`     |

**Status:** Phase 9 complete. All competitor-inspired features implemented.

---

## Summary: What Makes RAG Academy Unique

### Feature Comparison Matrix

| Feature              | TensorTonic | PaperCode   | RAG Academy           |
| -------------------- | ----------- | ----------- | --------------------- |
| RAG-Specific Content | ❌          | ❌          | ✅ 17+ challenges     |
| Vector DB Internals  | ❌          | ❌          | ✅ Build from scratch |
| Theory Tab           | ✅          | ❌          | ✅                    |
| Visual Roadmap       | ❌          | ✅          | ✅                    |
| Activity Heatmap     | ✅          | ❌          | ✅                    |
| AI Code Review       | ❌          | ❌          | ✅                    |
| Interview Prep Mode  | ❌          | ❌          | ✅                    |
| Solution Export      | ✅          | ❌          | ✅                    |
| External Resources   | ❌          | Paper links | ✅ 20+ curated        |
| Production Context   | ❌          | ❌          | ✅ Company tags       |

### The Depth Advantage

```
RAG Academy teaches what neither TensorTonic nor PaperCode covers:

1. Vector DB Internals → FlatIndex, IVF, HNSW
2. Retrieval Evaluation → Recall@K, MRR, nDCG
3. Reranking Systems → Cross-encoder, Cascade
4. Pipeline Engineering → Chunker, Embedder, Retriever, Generator
5. Production Patterns → Company context, complexity analysis
```

### Target Outcome

| Platform        | Prepares For              |
| --------------- | ------------------------- |
| TensorTonic     | Traditional ML interviews |
| PaperCode       | Research positions        |
| **RAG Academy** | **AI/LLM Engineer roles** |

---

## Phase 10: Full Integration

### Micro-Tasks System

**File:** `src/lib/challenges/microTasks.ts`

Breaks complex challenges into 3-4 atomic steps:

- `dense-vector-class` → 4 micro-tasks (Store, Magnitude, Dot, Normalize)
- `naive-flat-index` → 3 micro-tasks (Init, Add, Search)
- `evaluator-recall-at-k` → 3 micro-tasks (Signature, Top-K, Calculate)
- `rag-pipeline-chunker` → 4 micro-tasks (Basic, Overlap, Edge Cases, Metadata)

**UI Component:** `src/components/challenge/MicroTaskView.tsx`

- Progress bar with numbered steps
- Individual code editors per task
- Hints for each step
- Automatic progression

### Integration Points

| Feature                   | Location                    | Status        |
| ------------------------- | --------------------------- | ------------- |
| **Theory Tab**            | ChallengeIDE                | ✅ Integrated |
| **Micro-Task Toggle**     | ChallengeIDE editor toolbar | ✅ Integrated |
| **AI Code Review Button** | ChallengeIDE editor toolbar | ✅ Integrated |
| **ChallengeFilters**      | `/challenges` page          | ✅ Integrated |
| **Visual Roadmap**        | `/roadmap` page             | ✅ Created    |
| **Activity Heatmap**      | `/roadmap` page             | ✅ Integrated |

### ChallengeIDE Now Has

1. **Theory Tab** - Expands to show:

   - Overview
   - Key formulas with LaTeX
   - Visual intuition
   - Why it matters for RAG
   - Common mistakes
   - Interview tips

2. **Micro-Task Mode Toggle** - Switches between:

   - Full challenge (original)
   - Step-by-step mode (4-5 atomic tasks)

3. **AI Code Review Button** - Opens modal with:
   - Code quality score (0-100)
   - Strengths found
   - Improvement suggestions
   - Challenge-specific feedback

**Status:** Phase 10 complete. All competitor-inspired features fully integrated.
