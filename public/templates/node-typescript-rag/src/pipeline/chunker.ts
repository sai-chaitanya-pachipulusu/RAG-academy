/**
 * Document chunking with stable IDs and metadata.
 */

import { createHash } from "crypto";
import type { Chunk } from "../types.js";

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Generate a stable, reproducible chunk ID.
 */
function generateChunkId(content: string, source: string, index: number): string {
  const sourceHash = createHash("md5").update(source).digest("hex").slice(0, 8);
  const contentHash = createHash("md5").update(content).digest("hex").slice(0, 8);
  return `${sourceHash}_${contentHash}_${index.toString().padStart(4, "0")}`;
}

/**
 * Chunk a document using recursive character splitting.
 */
export function chunkDocument(
  content: string,
  source: string,
  options: ChunkOptions = {}
): Chunk[] {
  const { chunkSize = 512, overlap = 50, metadata = {} } = options;

  if (!content.trim()) {
    return [];
  }

  const chunks = recursiveSplit(content, chunkSize, overlap);

  return chunks.map((text, index) => ({
    id: generateChunkId(text, source, index),
    text,
    source,
    index,
    metadata,
  }));
}

/**
 * Recursively split text using appropriate separators.
 */
function recursiveSplit(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const separators = ["\n\n", "\n", ". ", ", ", " ", ""];

  if (text.length <= chunkSize) {
    return text.trim() ? [text.trim()] : [];
  }

  for (const sep of separators) {
    if (sep === "" || text.includes(sep)) {
      const splits = sep ? text.split(sep) : Array.from(text);
      const chunks: string[] = [];
      let currentChunk = "";

      for (const split of splits) {
        const testChunk = currentChunk + (currentChunk ? sep : "") + split;

        if (testChunk.length <= chunkSize) {
          currentChunk = testChunk;
        } else {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }

          if (split.length > chunkSize) {
            // Recurse with next separator
            const sepIndex = separators.indexOf(sep);
            const subChunks = recursiveSplit(split, chunkSize, overlap);
            chunks.push(...subChunks);
            currentChunk = "";
          } else {
            currentChunk = split;
          }
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // Add overlap
      if (overlap > 0 && chunks.length > 1) {
        return addOverlap(chunks, overlap);
      }

      return chunks;
    }
  }

  // Fallback: character-level splitting
  const result: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    result.push(text.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * Add overlap from previous chunk to each chunk.
 */
function addOverlap(chunks: string[], overlap: number): string[] {
  const result = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const prevSuffix = prev.length >= overlap ? prev.slice(-overlap) : prev;
    result.push(prevSuffix + " " + chunks[i]);
  }

  return result;
}

/**
 * Chunk markdown with header awareness.
 */
export function chunkMarkdown(
  content: string,
  source: string,
  options: ChunkOptions = {}
): Chunk[] {
  const headerPattern = /^(#{1,6})\s+(.+)$/gm;
  const sections: Array<{ header: string; content: string }> = [];

  let currentHeader = "";
  let currentContent: string[] = [];
  let lastIndex = 0;

  let match;
  while ((match = headerPattern.exec(content)) !== null) {
    // Save previous section
    const beforeHeader = content.slice(lastIndex, match.index).trim();
    if (beforeHeader || currentContent.length > 0) {
      currentContent.push(beforeHeader);
      if (currentContent.join("\n").trim()) {
        sections.push({
          header: currentHeader,
          content: currentContent.join("\n").trim(),
        });
      }
    }

    currentHeader = match[0];
    currentContent = [];
    lastIndex = match.index + match[0].length;
  }

  // Handle remaining content
  const remaining = content.slice(lastIndex).trim();
  if (remaining) {
    currentContent.push(remaining);
  }
  if (currentContent.join("\n").trim()) {
    sections.push({
      header: currentHeader,
      content: currentContent.join("\n").trim(),
    });
  }

  // Chunk each section
  const allChunks: Chunk[] = [];
  for (const section of sections) {
    const sectionText = section.header
      ? `${section.header}\n\n${section.content}`
      : section.content;

    const chunks = chunkDocument(sectionText, source, {
      ...options,
      metadata: {
        ...options.metadata,
        sectionHeader: section.header,
      },
    });

    allChunks.push(...chunks);
  }

  return allChunks;
}
