/**
 * PDF Analysis API Route
 * Analyzes PDF documents for layout and content extraction
 */

import { NextRequest, NextResponse } from "next/server";
import { detectPDFLayout, LayoutDetectionOptions } from "@/lib/pdf/layout-detector";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const optionsJson = formData.get("options") as string;
    
    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Parse options
    const options: Partial<LayoutDetectionOptions> = optionsJson
      ? JSON.parse(optionsJson)
      : {};

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();

    // Analyze PDF layout
    const layout = await detectPDFLayout(arrayBuffer, options);

    return NextResponse.json({
      success: true,
      layout: {
        ...layout,
        filename: file.name,
      },
    });
  } catch (error) {
    console.error("PDF analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze PDF" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "strategies") {
    // Return available chunking strategies
    const { chunkingStrategies } = await import("@/lib/pdf/layout-detector");
    
    return NextResponse.json({
      strategies: chunkingStrategies.map((s) => ({
        name: s.name,
        description: s.description,
      })),
    });
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}
