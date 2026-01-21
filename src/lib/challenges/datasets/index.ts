export type { Dataset, Doc, Query } from "./types";

export { TECH_SUPPORT_DATASET } from "./techSupport";
export { ECOMMERCE_DATASET } from "./ecommerce";
export { LEGAL_DATASET } from "./legal";
export { MEDICAL_DATASET } from "./medical";
export { CODEBASE_DATASET } from "./codebase";
export { RESEARCH_DATASET } from "./research";
export { FINANCIAL_DATASET } from "./financial";

import { Dataset } from "./types";
import { TECH_SUPPORT_DATASET } from "./techSupport";
import { ECOMMERCE_DATASET } from "./ecommerce";
import { LEGAL_DATASET } from "./legal";
import { MEDICAL_DATASET } from "./medical";
import { CODEBASE_DATASET } from "./codebase";
import { RESEARCH_DATASET } from "./research";
import { FINANCIAL_DATASET } from "./financial";

/**
 * All available datasets for challenges.
 * Each dataset represents a different domain for testing RAG systems.
 * 
 * NOTE: These are STATIC educational datasets.
 * For production systems, see /playbooks/dynamic-data-sources
 * for real-time data integration patterns.
 */
export const ALL_DATASETS: Record<string, Dataset> = {
  "tech-support-logs-small": TECH_SUPPORT_DATASET,
  "ecommerce-products": ECOMMERCE_DATASET,
  "legal-contracts": LEGAL_DATASET,
  "medical-knowledge": MEDICAL_DATASET,
  "codebase-docs": CODEBASE_DATASET,
  "research-papers": RESEARCH_DATASET,
  "financial-services": FINANCIAL_DATASET,
};

/**
 * Get a dataset by ID.
 */
export function getDataset(id: string): Dataset | undefined {
  return ALL_DATASETS[id];
}

/**
 * List all available dataset IDs with metadata.
 */
export function listDatasets(): Array<{ id: string; name: string; description: string; docCount: number; queryCount: number }> {
  return Object.values(ALL_DATASETS).map((ds) => ({
    id: ds.id,
    name: ds.name,
    description: ds.description,
    docCount: ds.docs.length,
    queryCount: ds.queries.length,
  }));
}
