# RAG Academy

Interactive, code-first learning platform for Retrieval-Augmented Generation (RAG). Master RAG from vector math fundamentals to production-grade systems through hands-on challenges.

## Features

- **260+ Interactive Challenges** — Write Python code in-browser, get instant feedback
- **13 Curriculum Phases** — From foundations to evaluation ops
- **In-Browser Code Execution** — Monaco editor + Pyodide Web Worker
- **Progressive Difficulty** — Easy → Medium → Hard challenges with XP rewards
- **Real-World Context** — Each challenge includes production use cases and company examples
- **Payment Integration** — Polar.sh for subscription management
- **Supabase Auth** — GitHub OAuth with role-based access control

## Curriculum

| Phase | Topic | Challenges |
|-------|-------|------------|
| Phase 0 | Foundations | Vector math, tokenization |
| Phase 1 | Pre-retrieval | Chunking, indexing, deduplication |
| Phase 2 | Retrieval | BM25, hybrid search, dense retrieval |
| Phase 3 | Query Transforms | Query expansion, rewriting, HyDE |
| Phase 4 | Advanced Retrieval | Parent doc, recursive retrieval, indices |
| Phase 5 | Post-retrieval | Reranking, context optimization |
| Phase 6 | Grounding & Safety | PII, ACL, prompt injection |
| Phase 7 | Agentic RAG | Tool use, ReAct, self-correction |
| Phase 8 | Graph & Knowledge | Knowledge graphs, multi-hop |
| Phase 9 | Multimodal | Tables, images, video, audio |
| Phase 10 | Fine-tuning | Domain adaptation, embedding tuning |
| Phase 11 | Production Ops | Scaling, caching, rate limiting |
| Phase 12 | Evaluation Ops | Metrics, observability, benchmarks |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` (copy from `.env.example`):

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Polar.sh (Payments)
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_PRODUCT_PRO_MONTHLY=your_product_id
POLAR_PRODUCT_PRO_ANNUAL=your_product_id
POLAR_PRODUCT_TEAM_MONTHLY=your_product_id
POLAR_PRODUCT_TEAM_ANNUAL=your_product_id
POLAR_PRODUCT_LIFETIME=your_product_id
NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG=your_org_slug
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Validate

```bash
npm run build
```

This runs validation scripts for challenges, content, and Next.js environment before building.

## Project Structure

```
├── content/
│   ├── challenges/          # MDX challenge content (260+ files)
│   ├── lessons/             # MDX lesson content by phase
│   └── playbooks/           # Reference guides and cheat sheets
├── src/
│   ├── app/                 # Next.js App Router routes
│   │   ├── (dashboard)/     # Authenticated dashboard routes
│   │   └── api/             # API routes (checkout, webhooks, cron)
│   ├── components/          # React components
│   ├── lib/
│   │   ├── challenges/      # Challenge definitions and runner
│   │   ├── payments/        # Polar.sh integration
│   │   ├── pyodide/         # In-browser Python execution
│   │   └── search/          # Search index and functionality
│   └── middleware.ts        # Auth and routing middleware
├── supabase/
│   └── migrations/          # Database schema migrations
└── scripts/                 # Build and validation scripts
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Polar.sh (Merchant of Record)
- **Code Editor**: Monaco Editor
- **Python Runtime**: Pyodide (WebAssembly)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Supabase Setup

1. **Run migrations**: `supabase/migrations/` in order (001 → 015)
2. **Enable GitHub OAuth**: Supabase → Auth → Providers → GitHub
3. **Add redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production URL + `/auth/callback`

## Contributing

Contributions are welcome! Please read the codebase structure above to understand where to make changes.

## License

MIT
