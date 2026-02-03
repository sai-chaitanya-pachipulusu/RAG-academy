/**
 * PDF Layout Detection Utilities
 * Detects and extracts layout information from PDF documents
 */

// ============================================
// Types
// ============================================

export interface PDFLayoutElement {
  type: 'text' | 'image' | 'table' | 'heading' | 'list' | 'code' | 'formula';
  bbox: BoundingBox;
  content?: string;
  font?: FontInfo;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface FontInfo {
  name: string;
  size: number;
  isBold: boolean;
  isItalic: boolean;
  color?: string;
}

export interface PDFPageLayout {
  pageNumber: number;
  width: number;
  height: number;
  elements: PDFLayoutElement[];
  columns: ColumnLayout[];
  hasHeader: boolean;
  hasFooter: boolean;
}

export interface ColumnLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  elements: PDFLayoutElement[];
}

export interface PDFDocumentLayout {
  filename: string;
  pageCount: number;
  pages: PDFPageLayout[];
  detectedTables: TableRegion[];
  detectedImages: ImageRegion[];
  textBlocks: TextBlock[];
  readingOrder: number[][]; // Page -> element indices in reading order
}

export interface TableRegion {
  page: number;
  bbox: BoundingBox;
  rows: number;
  columns: number;
  confidence: number;
}

export interface ImageRegion {
  page: number;
  bbox: BoundingBox;
  type: 'diagram' | 'photo' | 'chart' | 'unknown';
  caption?: string;
  confidence: number;
}

export interface TextBlock {
  page: number;
  bbox: BoundingBox;
  text: string;
  isParagraph: boolean;
  isHeading: boolean;
  headingLevel?: number;
}

export interface LayoutDetectionOptions {
  detectTables: boolean;
  detectImages: boolean;
  detectColumns: boolean;
  preserveReadingOrder: boolean;
  minConfidence: number;
  ocrEnabled: boolean;
}

export const defaultDetectionOptions: LayoutDetectionOptions = {
  detectTables: true,
  detectImages: true,
  detectColumns: true,
  preserveReadingOrder: true,
  minConfidence: 0.7,
  ocrEnabled: false,
};

// ============================================
// Layout Detection Functions
// ============================================

/**
 * Detect if a PDF has a multi-column layout
 */
export function detectColumnLayout(
  elements: PDFLayoutElement[],
  pageWidth: number
): ColumnLayout[] {
  // Group elements by x-position
  const xGroups = new Map<number, PDFLayoutElement[]>();
  
  for (const element of elements) {
    const x = Math.round(element.bbox.x / 50) * 50; // Round to nearest 50
    if (!xGroups.has(x)) {
      xGroups.set(x, []);
    }
    xGroups.get(x)!.push(element);
  }

  // Find clusters that could be columns
  const columns: ColumnLayout[] = [];
  const sortedX = Array.from(xGroups.keys()).sort((a, b) => a - b);
  
  let currentColumn: PDFLayoutElement[] = [];
  let currentX = 0;
  
  for (const x of sortedX) {
    const elements = xGroups.get(x)!;
    
    if (currentColumn.length === 0 || x - currentX < pageWidth * 0.3) {
      currentColumn.push(...elements);
      currentX = x;
    } else {
      // Start new column
      if (currentColumn.length > 0) {
        const bbox = calculateBoundingBox(currentColumn);
        columns.push({
          ...bbox,
          elements: currentColumn,
        });
      }
      currentColumn = [...elements];
      currentX = x;
    }
  }
  
  // Add last column
  if (currentColumn.length > 0) {
    const bbox = calculateBoundingBox(currentColumn);
    columns.push({
      ...bbox,
      elements: currentColumn,
    });
  }

  return columns;
}

/**
 * Detect table regions in PDF
 */
export function detectTables(
  elements: PDFLayoutElement[],
  options: LayoutDetectionOptions
): TableRegion[] {
  if (!options.detectTables) return [];

  const tables: TableRegion[] = [];
  const textElements = elements.filter((e) => e.type === 'text');
  
  // Group elements by y-position (rows)
  const yGroups = new Map<number, PDFLayoutElement[]>();
  for (const element of textElements) {
    const y = Math.round(element.bbox.y / 10) * 10;
    if (!yGroups.has(y)) {
      yGroups.set(y, []);
    }
    yGroups.get(y)!.push(element);
  }

  // Look for aligned elements that could form a table
  const sortedY = Array.from(yGroups.keys()).sort((a, b) => a - b);
  let currentTable: PDFLayoutElement[] = [];
  let lastY = 0;
  
  for (const y of sortedY) {
    const rowElements = yGroups.get(y)!;
    
    // Check if this row has aligned x-positions (potential table row)
    const xPositions = rowElements.map((e) => e.bbox.x).sort((a, b) => a - b);
    const hasRegularSpacing = checkRegularSpacing(xPositions);
    
    if (hasRegularSpacing && (currentTable.length === 0 || y - lastY < 50)) {
      currentTable.push(...rowElements);
      lastY = y;
    } else if (currentTable.length > 0) {
      // End of table
      const tableRegion = createTableRegion(currentTable, options);
      if (tableRegion) tables.push(tableRegion);
      currentTable = hasRegularSpacing ? [...rowElements] : [];
      lastY = y;
    }
  }
  
  // Add last table
  if (currentTable.length > 0) {
    const tableRegion = createTableRegion(currentTable, options);
    if (tableRegion) tables.push(tableRegion);
  }

  return tables.filter((t) => t.confidence >= options.minConfidence);
}

/**
 * Detect image regions in PDF
 */
export function detectImages(
  elements: PDFLayoutElement[],
  options: LayoutDetectionOptions
): ImageRegion[] {
  if (!options.detectImages) return [];

  const images: ImageRegion[] = [];
  
  for (const element of elements) {
    if (element.type === 'image') {
      const imageRegion: ImageRegion = {
        page: element.bbox.page,
        bbox: element.bbox,
        type: classifyImageType(element),
        confidence: element.confidence,
      };
      images.push(imageRegion);
    }
  }

  // Try to find captions for images
  for (const image of images) {
    const caption = findCaption(elements, image.bbox);
    if (caption) {
      image.caption = caption;
    }
  }

  return images;
}

/**
 * Determine reading order of elements
 */
export function determineReadingOrder(
  elements: PDFLayoutElement[],
  columns: ColumnLayout[]
): number[] {
  if (columns.length <= 1) {
    // Simple top-to-bottom order
    return elements
      .map((_, index) => index)
      .sort((a, b) => {
        const elemA = elements[a];
        const elemB = elements[b];
        return elemA.bbox.y - elemB.bbox.y || elemA.bbox.x - elemB.bbox.x;
      });
  }

  // Multi-column reading order
  const ordered: number[] = [];
  const sortedColumns = columns.sort((a, b) => a.x - b.x);
  
  for (const column of sortedColumns) {
    const columnIndices = column.elements
      .map((elem) => elements.indexOf(elem))
      .filter((i) => i !== -1)
      .sort((a, b) => elements[a].bbox.y - elements[b].bbox.y);
    
    ordered.push(...columnIndices);
  }

  return ordered;
}

/**
 * Classify text elements as headings, paragraphs, lists, etc.
 */
export function classifyTextElements(
  elements: PDFLayoutElement[]
): PDFLayoutElement[] {
  const classified: PDFLayoutElement[] = [];
  
  for (const element of elements) {
    if (element.type !== 'text' || !element.font) {
      classified.push(element);
      continue;
    }

    const font = element.font;
    let type: PDFLayoutElement['type'] = 'text';

    // Heading detection
    if (font.size > 14 || font.isBold) {
      type = 'heading';
    }
    // Code detection (monospace fonts)
    else if (font.name.toLowerCase().includes('mono') || 
             font.name.toLowerCase().includes('code')) {
      type = 'code';
    }
    // List detection (starts with bullet or number)
    else if (element.content && /^[\s]*[\u2022\u2023\u25E6\u2043\u2219\-•]|^[\s]*\d+[\.\)]/.test(element.content)) {
      type = 'list';
    }

    classified.push({
      ...element,
      type,
    });
  }

  return classified;
}

// ============================================
// Helper Functions
// ============================================

function calculateBoundingBox(elements: PDFLayoutElement[]) {
  const xs = elements.map((e) => e.bbox.x);
  const ys = elements.map((e) => e.bbox.y);
  const rights = elements.map((e) => e.bbox.x + e.bbox.width);
  const bottoms = elements.map((e) => e.bbox.y + e.bbox.height);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...rights) - Math.min(...xs),
    height: Math.max(...bottoms) - Math.min(...ys),
  };
}

function checkRegularSpacing(positions: number[]): boolean {
  if (positions.length < 3) return false;
  
  const gaps: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    gaps.push(positions[i] - positions[i - 1]);
  }
  
  // Check if gaps are relatively consistent
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  
  return variance < avgGap * 0.5; // Low variance indicates regular spacing
}

function createTableRegion(
  elements: PDFLayoutElement[],
  options: LayoutDetectionOptions
): TableRegion | null {
  if (elements.length < 4) return null; // Minimum 2x2 table

  const bbox = calculateBoundingBox(elements);
  
  // Estimate rows and columns
  const yPositions = [...new Set(elements.map((e) => Math.round(e.bbox.y / 10) * 10))];
  const xPositions = [...new Set(elements.map((e) => Math.round(e.bbox.x / 50) * 50))];
  
  const confidence = Math.min(
    elements.length / 10, // More elements = higher confidence
    1.0
  );

  if (confidence < options.minConfidence) return null;

  return {
    page: elements[0].bbox.page,
    bbox: {
      ...bbox,
      page: elements[0].bbox.page,
    },
    rows: yPositions.length,
    columns: xPositions.length,
    confidence,
  };
}

function classifyImageType(element: PDFLayoutElement): ImageRegion['type'] {
  const aspectRatio = element.bbox.width / element.bbox.height;
  
  // Charts often have specific aspect ratios
  if (aspectRatio > 1.2 && aspectRatio < 2.5) {
    return 'chart';
  }
  
  // Diagrams can be various shapes
  if (aspectRatio > 0.5 && aspectRatio < 3) {
    return 'diagram';
  }
  
  return 'unknown';
}

function findCaption(
  elements: PDFLayoutElement[],
  imageBbox: BoundingBox
): string | undefined {
  // Look for text elements below the image
  const captionCandidates = elements.filter(
    (e) =>
      e.type === 'text' &&
      e.bbox.y > imageBbox.y + imageBbox.height &&
      e.bbox.y < imageBbox.y + imageBbox.height + 50 &&
      e.bbox.x >= imageBbox.x - 20 &&
      e.bbox.x + e.bbox.width <= imageBbox.x + imageBbox.width + 20
  );

  if (captionCandidates.length === 0) return undefined;

  // Sort by y position and take the closest
  captionCandidates.sort((a, b) => a.bbox.y - b.bbox.y);
  
  const caption = captionCandidates[0].content;
  
  // Check if it looks like a caption (starts with Figure, Table, etc.)
  if (caption && /^(Figure|Table|Fig\.?|Chart|Diagram)\s*\d+/i.test(caption)) {
    return caption;
  }

  return undefined;
}

// ============================================
// Main Layout Detection
// ============================================

export async function detectPDFLayout(
  pdfBuffer: ArrayBuffer,
  options: Partial<LayoutDetectionOptions> = {}
): Promise<PDFDocumentLayout> {
  const opts = { ...defaultDetectionOptions, ...options };
  
  // This is a placeholder - actual implementation would use a PDF parsing library
  // like pdf-parse, pdfjs-dist, or a server-side solution
  
  const layout: PDFDocumentLayout = {
    filename: 'document.pdf',
    pageCount: 0,
    pages: [],
    detectedTables: [],
    detectedImages: [],
    textBlocks: [],
    readingOrder: [],
  };

  return layout;
}

// ============================================
// Chunking Strategies for RAG
// ============================================

export interface ChunkingStrategy {
  name: string;
  description: string;
  chunk: (layout: PDFDocumentLayout) => string[];
}

export const chunkingStrategies: ChunkingStrategy[] = [
  {
    name: 'by_page',
    description: 'Chunk by PDF pages',
    chunk: (layout) => {
      return layout.pages.map((page) => 
        page.elements
          .filter((e) => e.type === 'text' || e.type === 'heading')
          .map((e) => e.content)
          .join('\n')
      );
    },
  },
  {
    name: 'by_section',
    description: 'Chunk by sections (headings and following content)',
    chunk: (layout) => {
      const chunks: string[] = [];
      let currentChunk: string[] = [];
      
      for (const page of layout.pages) {
        for (const element of page.elements) {
          if (element.type === 'heading') {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.join('\n'));
            }
            currentChunk = [element.content || ''];
          } else if (element.type === 'text') {
            currentChunk.push(element.content || '');
          }
        }
      }
      
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
      }
      
      return chunks;
    },
  },
  {
    name: 'by_table',
    description: 'Extract tables as separate chunks',
    chunk: (layout) => {
      const chunks: string[] = [];
      
      // Regular text chunks
      for (const page of layout.pages) {
        const textContent = page.elements
          .filter((e) => e.type === 'text' || e.type === 'heading')
          .map((e) => e.content)
          .join('\n');
        if (textContent) chunks.push(textContent);
      }
      
      // Table chunks
      for (const table of layout.detectedTables) {
        chunks.push(`[TABLE on page ${table.page}: ${table.rows}x${table.columns}]`);
      }
      
      return chunks;
    },
  },
  {
    name: 'semantic',
    description: 'Preserve semantic units (paragraphs, lists, code blocks)',
    chunk: (layout) => {
      const chunks: string[] = [];
      
      for (const page of layout.pages) {
        let currentParagraph: string[] = [];
        
        for (const element of page.elements) {
          if (element.type === 'text' || element.type === 'list' || element.type === 'code') {
            currentParagraph.push(element.content || '');
          } else if (element.type === 'heading') {
            if (currentParagraph.length > 0) {
              chunks.push(currentParagraph.join(' '));
              currentParagraph = [];
            }
            chunks.push(element.content || '');
          }
        }
        
        if (currentParagraph.length > 0) {
          chunks.push(currentParagraph.join(' '));
        }
      }
      
      return chunks;
    },
  },
];
