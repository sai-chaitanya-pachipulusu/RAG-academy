import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { userCount: 33, note: "using fallback count" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { userCount: count ?? 33 },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { userCount: 33, note: "using fallback count" },
      { status: 200 }
    );
  }
}