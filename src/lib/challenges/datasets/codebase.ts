import { Dataset } from "./types";

/**
 * Codebase Documentation Dataset
 * 
 * Use case: Code search, documentation Q&A, developer assistance
 * Real-world inspiration: GitHub Copilot, Sourcegraph, Cursor
 */
export const CODEBASE_DATASET: Dataset = {
  id: "codebase-docs",
  name: "Codebase Documentation",
  description: "Code documentation, API references, and developer guides for code-aware RAG.",
  docs: [
    {
      id: "doc_auth_setup",
      content: `# Authentication Setup

The authentication module uses JWT tokens with refresh token rotation.

## Quick Start
\`\`\`typescript
import { AuthProvider } from '@/lib/auth';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
\`\`\`

## Environment Variables
- \`AUTH_SECRET\`: 32-byte secret for JWT signing
- \`AUTH_URL\`: Base URL for auth endpoints
- \`REFRESH_TOKEN_EXPIRY\`: Default 7 days`,
      metadata: { type: "guide", module: "auth", language: "typescript" },
    },
    {
      id: "doc_auth_hooks",
      content: `# Authentication Hooks

## useAuth()
Returns the current authentication state and methods.

\`\`\`typescript
const { user, login, logout, isLoading } = useAuth();

// user: User | null
// login: (email: string, password: string) => Promise<void>
// logout: () => Promise<void>
// isLoading: boolean
\`\`\`

## useRequireAuth()
Redirects to login if not authenticated.

\`\`\`typescript
function ProtectedPage() {
  const { user } = useRequireAuth(); // Redirects if null
  return <Dashboard user={user} />;
}
\`\`\``,
      metadata: { type: "api", module: "auth", language: "typescript" },
    },
    {
      id: "doc_database_setup",
      content: `# Database Configuration

We use Prisma ORM with PostgreSQL.

## Setup
\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

## Connection String
\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
\`\`\`

## Common Issues
- "P1001: Can't reach database" - Check if PostgreSQL is running
- "P2002: Unique constraint failed" - Duplicate entry violation`,
      metadata: { type: "guide", module: "database", language: "prisma" },
    },
    {
      id: "doc_api_errors",
      content: `# API Error Handling

All API routes use standardized error responses.

## Error Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "field": "email", "issue": "Invalid format" }
  }
}
\`\`\`

## Error Codes
- \`VALIDATION_ERROR\` (400): Invalid request body
- \`UNAUTHORIZED\` (401): Missing or invalid token
- \`FORBIDDEN\` (403): Insufficient permissions
- \`NOT_FOUND\` (404): Resource doesn't exist
- \`RATE_LIMITED\` (429): Too many requests`,
      metadata: { type: "api", module: "core", language: "typescript" },
    },
    {
      id: "doc_caching",
      content: `# Caching Strategy

We use Redis for caching with a hierarchical key structure.

## Cache Keys
- \`user:{id}\`: User profile data (TTL: 1 hour)
- \`session:{token}\`: Session data (TTL: 24 hours)
- \`rate:{ip}:{endpoint}\`: Rate limit counters (TTL: 1 minute)

## Usage
\`\`\`typescript
import { cache } from '@/lib/cache';

// Set with TTL
await cache.set('user:123', userData, 3600);

// Get with fallback
const user = await cache.get('user:123') ?? await fetchUser(123);
\`\`\``,
      metadata: { type: "guide", module: "cache", language: "typescript" },
    },
    {
      id: "doc_testing",
      content: `# Testing Guide

## Unit Tests
\`\`\`bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
\`\`\`

## Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

Requires Docker for test database:
\`\`\`bash
docker-compose -f docker-compose.test.yml up -d
\`\`\`

## Mocking
Use \`vi.mock()\` for module mocks and \`vi.spyOn()\` for method spies.`,
      metadata: { type: "guide", module: "testing", language: "typescript" },
    },
    {
      id: "doc_deployment",
      content: `# Deployment

## Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy triggers automatically on push to main

## Docker
\`\`\`bash
docker build -t myapp .
docker run -p 3000:3000 --env-file .env.production myapp
\`\`\`

## Health Check
Endpoint: \`GET /api/health\`
Returns: \`{ "status": "ok", "version": "1.2.3" }\``,
      metadata: { type: "guide", module: "devops", language: "docker" },
    },
    {
      id: "doc_rate_limiting",
      content: `# Rate Limiting

API endpoints are rate limited per IP address.

## Limits
- \`/api/auth/*\`: 10 requests/minute
- \`/api/public/*\`: 100 requests/minute
- \`/api/user/*\`: 60 requests/minute

## Response Headers
\`\`\`
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
\`\`\`

## Bypass for Testing
Set header \`X-Test-Bypass: {TEST_SECRET}\` in development.`,
      metadata: { type: "api", module: "security", language: "typescript" },
    },
  ],
  queries: [
    {
      id: "q_setup_auth",
      text: "how to set up authentication in my app",
      relevantDocs: ["doc_auth_setup"],
    },
    {
      id: "q_login_hook",
      text: "how to check if user is logged in using hooks",
      relevantDocs: ["doc_auth_hooks"],
    },
    {
      id: "q_db_connection",
      text: "database connection error P1001 can't reach database",
      relevantDocs: ["doc_database_setup"],
    },
    {
      id: "q_api_error_format",
      text: "what format do API errors use",
      relevantDocs: ["doc_api_errors"],
    },
    {
      id: "q_redis_cache",
      text: "how to cache user data with redis",
      relevantDocs: ["doc_caching"],
    },
    {
      id: "q_run_tests",
      text: "how to run tests with coverage",
      relevantDocs: ["doc_testing"],
    },
    {
      id: "q_deploy_docker",
      text: "how to deploy the app with docker",
      relevantDocs: ["doc_deployment"],
    },
    {
      id: "q_rate_limit_bypass",
      text: "how to bypass rate limiting in tests",
      relevantDocs: ["doc_rate_limiting"],
    },
  ],
};
