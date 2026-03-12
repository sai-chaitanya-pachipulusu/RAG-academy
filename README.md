## RAG Academy

Interactive, code-first learning for Retrieval‑Augmented Generation (RAG).

### What’s implemented so far (MVP scaffolding)

- **Marketing landing page**: `/`
- **Dashboard shell (header + sidebar)**: `/dashboard`, `/learn`, `/challenges`, `/papers`, `/compare`
- **MDX lessons (file-based)**:
  - Content lives in `content/lessons/<phase>/<slug>.mdx`
  - Example: `/learn/phase-0/why-rag-exists`
- **In-browser Python challenge runner**:
  - Monaco editor + output panel
  - Pyodide executes Python in a Web Worker
  - First challenge: `/challenges/dot-product`
- **Payment processing**: Integrated with Polar.sh for subscription management

### Local development

Install deps:

```bash
npm install
```

Create `.env.local` (copy from `.env.example`) and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POLAR_ACCESS_TOKEN` (from Polar dashboard)
- `POLAR_WEBHOOK_SECRET` (from Polar dashboard)
- `POLAR_PRODUCT_PRO_MONTHLY` (Product ID from Polar)
- `POLAR_PRODUCT_PRO_ANNUAL` (Product ID from Polar)
- `POLAR_PRODUCT_TEAM_MONTHLY` (Product ID from Polar)
- `POLAR_PRODUCT_TEAM_ANNUAL` (Product ID from Polar)
- `POLAR_PRODUCT_LIFETIME` (Product ID from Polar)
- `NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG` (your Polar organization slug)

Run dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

### Where to edit

- **Challenge catalog**: `src/lib/challenges/catalog.ts`
- **Challenge UI**: `src/components/challenge/ChallengeIDE.tsx`
- **Monaco wrapper**: `src/components/challenge/CodeEditor.tsx`
- **Pyodide worker**: `public/workers/pyodide-worker.js`
- **Pyodide client wrapper**: `src/lib/pyodide/executor.ts`
- **Lessons loader**: `src/lib/lessons/fs.ts`
- **MDX renderer**: `src/components/learn/MDXRenderer.tsx`
- **Dashboard layout**: `src/app/(dashboard)/layout.tsx`

### Next up

- MDX lessons (Contentlayer)
- Supabase auth + persistence (progress, XP, streaks)
- More challenges (Phase 0: cosine similarity, chunking, retrieval)

### Supabase setup (required for auth + sync)

1. **Run schema**: open Supabase → SQL Editor → run `supabase/schema.sql`
2. **Enable GitHub OAuth**: Supabase → Auth → Providers → GitHub
3. **Add redirect URLs** (Supabase → Auth → URL Configuration):
   - `http://localhost:3000/auth/callback`
   - Your Vercel URL + `/auth/callback`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
