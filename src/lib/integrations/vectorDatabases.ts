/**
 * External Vector Database Integrations
 * 
 * Provides connectors and utilities for real vector databases:
 * Pinecone, Weaviate, Qdrant, Chroma, and more.
 * Includes connection testing, index management, and query capabilities.
 */

// ============================================
// Types
// ============================================

export type VectorDbProvider = 
  | "pinecone"
  | "weaviate"
  | "qdrant"
  | "chroma"
  | "milvus"
  | "pgvector"
  | "redis";

export interface VectorDbConnection {
  id: string;
  userId: string;
  provider: VectorDbProvider;
  name: string;
  
  // Connection details (encrypted at rest)
  endpoint: string;
  apiKey?: string;
  environment?: string;
  
  // Status
  isActive: boolean;
  lastTestedAt?: string;
  lastError?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface VectorDbIndex {
  name: string;
  dimension: number;
  metric: "cosine" | "euclidean" | "dotproduct";
  vectorCount?: number;
  status?: string;
}

export interface VectorDbTestResult {
  success: boolean;
  latencyMs: number;
  indexes?: VectorDbIndex[];
  error?: string;
  version?: string;
}

export interface VectorDbQueryResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorDbUpsertRequest {
  indexName: string;
  vectors: {
    id: string;
    values: number[];
    metadata?: Record<string, unknown>;
  }[];
}

export interface VectorDbQueryRequest {
  indexName: string;
  vector: number[];
  topK: number;
  filter?: Record<string, unknown>;
  includeMetadata?: boolean;
  includeVectors?: boolean;
}

// ============================================
// Provider Configurations
// ============================================

export const VECTOR_DB_CONFIGS: Record<VectorDbProvider, {
  name: string;
  description: string;
  docsUrl: string;
  requiresApiKey: boolean;
  requiresEndpoint: boolean;
  supportsEnvironment: boolean;
  freeTier: boolean;
  features: string[];
}> = {
  pinecone: {
    name: "Pinecone",
    description: "Managed vector database with metadata filtering and hybrid search",
    docsUrl: "https://docs.pinecone.io",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: true,
    freeTier: true,
    features: ["Metadata filtering", "Hybrid search", "Namespaces", "Pod-based scaling"],
  },
  weaviate: {
    name: "Weaviate",
    description: "Open-source vector database with GraphQL interface and modular AI integrations",
    docsUrl: "https://weaviate.io/developers",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["GraphQL queries", "Modular AI", "Multi-tenancy", "Vector+BM25 hybrid"],
  },
  qdrant: {
    name: "Qdrant",
    description: "Open-source vector database with filtering and payload support",
    docsUrl: "https://qdrant.tech/documentation",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["Payload filtering", "HNSW indexing", "Quantization", "Distributed mode"],
  },
  chroma: {
    name: "Chroma",
    description: "AI-native open-source embedding database",
    docsUrl: "https://docs.trychroma.com",
    requiresApiKey: false,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["Embeddings focus", "Document storage", "Query by text", "Local/Cloud"],
  },
  milvus: {
    name: "Milvus/Zilliz",
    description: "Cloud-native vector database for enterprise scale",
    docsUrl: "https://milvus.io/docs",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["GPU index building", "Multi-replica", "RBAC", "Time travel"],
  },
  pgvector: {
    name: "pgvector",
    description: "PostgreSQL extension for vector similarity search",
    docsUrl: "https://github.com/pgvector/pgvector",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["PostgreSQL native", "ACID compliance", "Joins with relational", "HNSW/IVFFlat"],
  },
  redis: {
    name: "Redis Vector Library",
    description: "Vector similarity search in Redis",
    docsUrl: "https://redis.io/docs/interact/search-and-query/query/vector-search",
    requiresApiKey: true,
    requiresEndpoint: true,
    supportsEnvironment: false,
    freeTier: true,
    features: ["In-memory speed", "Hybrid queries", "Real-time updates", "Existing Redis"],
  },
};

// ============================================
// Connection Testing
// ============================================

/**
 * Test connection to Pinecone
 */
async function testPineconeConnection(
  apiKey: string,
  environment: string
): Promise<VectorDbTestResult> {
  const startTime = Date.now();
  
  try {
    // Pinecone uses different controller URLs based on environment
    const controllerUrl = environment === "gcp-starter"
      ? "https://controller.us-west1-gcp-free.pinecone.io"
      : `https://controller.${environment}.pinecone.io`;

    const response = await fetch(`${controllerUrl}/databases`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        latencyMs,
        error: `Pinecone API error: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      latencyMs,
      indexes: data.databases?.map((db: Record<string, unknown>) => ({
        name: db.name as string,
        dimension: db.dimension as number,
        metric: (db.metric as string)?.toLowerCase() as VectorDbIndex["metric"],
        vectorCount: db.vector_count as number,
        status: db.status as string,
      })),
    };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Test connection to Weaviate
 */
async function testWeaviateConnection(
  endpoint: string,
  apiKey?: string
): Promise<VectorDbTestResult> {
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${endpoint}/v1/meta`, {
      method: "GET",
      headers,
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        error: `Weaviate error: ${response.status}`,
      };
    }

    const data = await response.json();
    
    // Get schema to list classes (indexes)
    const schemaResponse = await fetch(`${endpoint}/v1/schema`, { headers });
    const schema = schemaResponse.ok ? await schemaResponse.json() : { classes: [] };

    return {
      success: true,
      latencyMs,
      version: data.version,
      indexes: schema.classes?.map((cls: Record<string, unknown>) => ({
        name: cls.class as string,
        dimension: (cls.vectorIndexConfig as Record<string, unknown>)?.ef as number || 768,
        metric: "cosine", // Weaviate default
      })),
    };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Test connection to Qdrant
 */
async function testQdrantConnection(
  endpoint: string,
  apiKey?: string
): Promise<VectorDbTestResult> {
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["api-key"] = apiKey;
    }

    const response = await fetch(`${endpoint}/collections`, {
      method: "GET",
      headers,
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        error: `Qdrant error: ${response.status}`,
      };
    }

    const data = await response.json();
    
    // Get details for each collection
    const indexes: VectorDbIndex[] = [];
    for (const collection of data.result?.collections || []) {
      try {
        const detailResponse = await fetch(`${endpoint}/collections/${collection.name}`, { headers });
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          indexes.push({
            name: collection.name,
            dimension: detail.result?.config?.params?.vectors?.size || 0,
            metric: detail.result?.config?.params?.vectors?.distance?.toLowerCase() as VectorDbIndex["metric"] || "cosine",
            vectorCount: detail.result?.points_count,
          });
        }
      } catch {
        // Skip collections that can't be detailed
      }
    }

    return {
      success: true,
      latencyMs,
      indexes,
      version: data.version,
    };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Test connection to Chroma
 */
async function testChromaConnection(endpoint: string): Promise<VectorDbTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${endpoint}/api/v1/collections`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        error: `Chroma error: ${response.status}`,
      };
    }

    const collections = await response.json();

    return {
      success: true,
      latencyMs,
      indexes: collections.map((c: Record<string, unknown>) => ({
        name: c.name as string,
        dimension: 0, // Chroma doesn't expose this directly
        metric: "cosine" as const,
      })),
    };
  } catch (error) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Test connection to any vector database
 */
export async function testVectorDbConnection(
  provider: VectorDbProvider,
  endpoint: string,
  apiKey?: string,
  environment?: string
): Promise<VectorDbTestResult> {
  switch (provider) {
    case "pinecone":
      if (!apiKey || !environment) {
        return {
          success: false,
          latencyMs: 0,
          error: "Pinecone requires API key and environment",
        };
      }
      return testPineconeConnection(apiKey, environment);
    
    case "weaviate":
      return testWeaviateConnection(endpoint, apiKey);
    
    case "qdrant":
      return testQdrantConnection(endpoint, apiKey);
    
    case "chroma":
      return testChromaConnection(endpoint);
    
    case "milvus":
    case "pgvector":
    case "redis":
      // These would need specific implementations
      return {
        success: false,
        latencyMs: 0,
        error: `${provider} testing not yet implemented`,
      };
    
    default:
      return {
        success: false,
        latencyMs: 0,
        error: "Unknown provider",
      };
  }
}

// ============================================
// Query Operations (Server-side only)
// ============================================

/**
 * Query Pinecone index
 * Note: This should be called from server-side API routes only
 */
export async function queryPinecone(
  apiKey: string,
  indexName: string,
  request: VectorDbQueryRequest
): Promise<VectorDbQueryResult[]> {
  const response = await fetch(`https://${indexName}.svc.${request.indexName}.pinecone.io/query`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vector: request.vector,
      topK: request.topK,
      filter: request.filter,
      includeMetadata: request.includeMetadata,
      includeValues: request.includeVectors,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pinecone query failed: ${response.status}`);
  }

  const data = await response.json();
  
  return data.matches?.map((match: Record<string, unknown>) => ({
    id: match.id as string,
    score: match.score as number,
    vector: match.values as number[] | undefined,
    metadata: match.metadata as Record<string, unknown> | undefined,
  })) || [];
}

// ============================================
// Connection Management (Client-side)
// ============================================

const CONNECTIONS_STORAGE_KEY = "rag_academy_vector_db_connections";

export interface StoredConnection {
  id: string;
  provider: VectorDbProvider;
  name: string;
  endpoint: string;
  environment?: string;
  hasApiKey: boolean;
  isActive: boolean;
  lastTestedAt?: string;
}

/**
 * Save connection (client-side, API key handled server-side)
 */
export function saveConnection(connection: StoredConnection): void {
  if (typeof window === "undefined") return;
  
  const connections = loadConnections();
  const existingIndex = connections.findIndex((c) => c.id === connection.id);
  
  if (existingIndex >= 0) {
    connections[existingIndex] = connection;
  } else {
    connections.push(connection);
  }
  
  localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
}

/**
 * Load connections (client-side)
 */
export function loadConnections(): StoredConnection[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete connection
 */
export function deleteConnection(connectionId: string): void {
  if (typeof window === "undefined") return;
  
  const connections = loadConnections().filter((c) => c.id !== connectionId);
  localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get provider display name
 */
export function getProviderName(provider: VectorDbProvider): string {
  return VECTOR_DB_CONFIGS[provider].name;
}

/**
 * Get provider features
 */
export function getProviderFeatures(provider: VectorDbProvider): string[] {
  return VECTOR_DB_CONFIGS[provider].features;
}

/**
 * Check if provider has free tier
 */
export function hasFreeTier(provider: VectorDbProvider): boolean {
  return VECTOR_DB_CONFIGS[provider].freeTier;
}

/**
 * Get provider documentation URL
 */
export function getProviderDocsUrl(provider: VectorDbProvider): string {
  return VECTOR_DB_CONFIGS[provider].docsUrl;
}

/**
 * Format metric for display
 */
export function formatMetric(metric: VectorDbIndex["metric"]): string {
  switch (metric) {
    case "cosine":
      return "Cosine Similarity";
    case "euclidean":
      return "Euclidean Distance";
    case "dotproduct":
      return "Dot Product";
    default:
      return metric;
  }
}

/**
 * Validate connection parameters
 */
export function validateConnectionParams(
  provider: VectorDbProvider,
  endpoint: string,
  apiKey?: string,
  environment?: string
): { valid: boolean; error?: string } {
  const config = VECTOR_DB_CONFIGS[provider];
  
  if (config.requiresEndpoint && !endpoint) {
    return { valid: false, error: "Endpoint URL is required" };
  }
  
  if (config.requiresApiKey && !apiKey) {
    return { valid: false, error: "API key is required" };
  }
  
  if (config.supportsEnvironment && !environment) {
    return { valid: false, error: "Environment is required" };
  }
  
  // Validate URL format
  if (endpoint) {
    try {
      new URL(endpoint);
    } catch {
      return { valid: false, error: "Invalid endpoint URL format" };
    }
  }
  
  return { valid: true };
}
