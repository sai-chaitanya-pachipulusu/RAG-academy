// Stub route for Polar webhook - prevents build errors
// This is a placeholder since the project uses Paddle for payments

import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Polar integration not configured. Use Paddle webhooks instead." },
    { status: 501 }
  );
}
