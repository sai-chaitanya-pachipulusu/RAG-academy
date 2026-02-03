/**
 * Performance Metrics API
 * Receives and stores performance metrics from the client
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: "Invalid metrics format" },
        { status: 400 }
      );
    }

    // Process metrics
    for (const metric of metrics) {
      // In production, send to your analytics service
      // e.g., Datadog, New Relic, Google Analytics, etc.
      
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to analytics
        console.log('[Performance Metric]', {
          name: metric.name,
          value: metric.value,
          metadata: metric.metadata,
          timestamp: metric.timestamp,
          userAgent: request.headers.get('user-agent'),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json(
      { error: "Failed to process metrics" },
      { status: 500 }
    );
  }
}
