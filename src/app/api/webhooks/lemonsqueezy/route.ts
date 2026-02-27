// Stub route for LemonSqueezy webhook - prevents build errors
// This is a placeholder since the project uses Polar for payments

import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: "LemonSqueezy integration not configured. Use Polar webhooks instead." },
    { status: 501 }
  );
}
