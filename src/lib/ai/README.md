# AI Code Review System

## Overview

RAG Academy now features an intelligent AI-powered code review system that provides contextual, educational feedback on challenge submissions.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AICodeReview Component                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Pattern-Based  │  │  Hybrid Mode    │  │   AI Only    │ │
│  │  (Local)        │  │  (Preferred)    │  │   (API)      │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │         │
│           └────────────────────┼───────────────────┘         │
│                                │                             │
│                                ▼                             │
│              ┌─────────────────────────────────┐             │
│              │     POST /api/ai/code-review    │             │
│              └─────────────┬───────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│              ┌─────────────────────────────────┐             │
│              │         llmReview.ts            │             │
│              │  ┌──────────┐  ┌─────────────┐ │             │
│              │  │  OpenAI  │  │  Anthropic  │ │             │
│              │  └──────────┘  └─────────────┘ │             │
│              └─────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### Core Types & Configuration
- [`src/lib/ai/types.ts`](src/lib/ai/types.ts) - TypeScript interfaces for the review system
- [`src/lib/ai/prompts.ts`](src/lib/ai/prompts.ts) - LLM prompts engineered for educational feedback
- [`src/lib/ai/llmReview.ts`](src/lib/ai/llmReview.ts) - Core LLM integration service
- [`src/lib/ai/quota.ts`](src/lib/ai/quota.ts) - Daily review quota management
- [`src/lib/ai/client.ts`](src/lib/ai/client.ts) - Client-side utilities

### API Route
- [`src/app/api/ai/code-review/route.ts`](src/app/api/ai/code-review/route.ts) - Next.js API endpoint

### UI Components
- [`src/components/challenge/AICodeReview.tsx`](src/components/challenge/AICodeReview.tsx) - Enhanced review modal with score visualization

### Integration
- [`src/components/challenge/ChallengeIDE.tsx`](src/components/challenge/ChallengeIDE.tsx) - IDE integration with inline review display

## Environment Variables

```env
# Required for AI reviews
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional configuration
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-haiku-20240307
AI_REVIEW_DAILY_LIMIT=10
AI_REVIEW_CACHE_TTL=3600
```

## Features

### 1. Multi-Mode Review System

- **Pattern Mode**: Fast, local analysis without API calls
- **Hybrid Mode**: Tries AI first, falls back to patterns on failure
- **AI Mode**: Full LLM analysis with rich context

### 2. Score Breakdown

Each review includes category scores:
- **Correctness** (0-100): Code functionality and bug detection
- **Efficiency** (0-100): Algorithmic complexity
- **Readability** (0-100): Code clarity and style
- **Best Practices** (0-100): Error handling, type hints, docs

### 3. Issue Categorization

Issues are classified by:
- **Severity**: `critical`, `warning`, `suggestion`
- **Category**: Grouped by domain (Performance, Error Handling, etc.)
- **Line Numbers**: Clickable to navigate to code

### 4. Educational Focus

- Explains WHY something is wrong, not just WHAT
- Provides code examples for fixes
- Includes RAG-specific insights
- Highlights positive aspects (reinforcement learning)

### 5. Cost Control

- **Daily Quotas**: Configurable limit per user (default: 10)
- **Response Caching**: 1-hour TTL to avoid duplicate reviews
- **Rate Limiting**: 10 requests/minute per IP
- **Pattern Fallback**: Free alternative when quota exhausted

## API Usage

### Request Review

```typescript
import { requestCodeReview } from "@/lib/ai/client";

const response = await requestCodeReview({
  code: "def cosine_similarity(a, b): ...",
  challengeSlug: "cosine-similarity",
  challengeTitle: "Cosine Similarity",
  language: "python",
});

if (response.success) {
  console.log(response.feedback.score);        // 0-100
  console.log(response.feedback.issues);       // Array of issues
  console.log(response.feedback.improvements); // Suggestions
}
```

### Check Quota

```typescript
import { getQuotaStatus } from "@/lib/ai/client";

const { quota } = await getQuotaStatus();
// quota.used, quota.limit, quota.remaining, quota.resetsAt
```

## UI Components

### AICodeReview Modal

```tsx
<AICodeReview
  code={code}
  challengeSlug={challenge.slug}
  challengeTitle={challenge.title}
  isVisible={showAIReview}
  onClose={() => setShowAIReview(false)}
  onReviewReceived={(feedback) => console.log(feedback)}
/>
```

### Inline Review Panel

```tsx
<InlineCodeReview
  feedback={reviewFeedback}
  onDismiss={() => setShowInlineReview(false)}
/>
```

### CodeReviewButton

```tsx
<CodeReviewButton onClick={() => setShowAIReview(true)} />
<CodeReviewButton onClick={() => setShowAIReview(true)} compact />
```

## Challenge Context

The system includes challenge-specific knowledge for better reviews:

- `cosine-similarity`: Checks for sqrt usage, vector normalization
- `chunking`: Verifies overlap handling, boundary preservation
- `bm25`: Validates IDF calculation, parameter tuning
- `hnsw`: Reviews layer construction, neighbor selection
- `embedding`: Checks batching efficiency, cache keys
- And more...

## Prompt Engineering

The system uses carefully crafted prompts in [`prompts.ts`](src/lib/ai/prompts.ts):

1. **System Prompt**: Establishes the AI as a RAG expert educator
2. **User Prompt**: Includes code, challenge context, expected format
3. **JSON Schema**: Structured output for consistent parsing

## Caching Strategy

Reviews are cached by a hash of `challengeSlug + code`:

```typescript
// Cache key generation
const key = hash(challengeSlug + code);

// TTL: 1 hour (configurable)
// Max entries: 1000 (LRU eviction)
```

## Security Considerations

1. **API Keys**: Server-side only, never exposed to client
2. **Rate Limiting**: Per-IP and per-user limits
3. **Code Size**: Max 50,000 characters per review
4. **Quota Enforcement**: Server-side validation

## Future Enhancements

Potential improvements:

1. **Redis Integration**: Replace in-memory cache
2. **Database Persistence**: Store review history
3. **Custom Models**: User-provided API keys
4. **Review Comparison**: Track improvement over time
5. **Team Features**: Shared review quotas
6. **Webhook Support**: Trigger reviews on submission

## Troubleshooting

### AI Reviews Not Working

1. Check `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set
2. Verify API key has sufficient credits
3. Check rate limit hasn't been exceeded

### Quota Exhausted

- Quota resets daily at midnight UTC
- Use Pattern Mode for unlimited reviews
- Contact admin to increase quota

### Slow Response Times

- AI reviews typically take 10-30 seconds
- Enable Pattern Mode for instant feedback
- Check network connectivity
