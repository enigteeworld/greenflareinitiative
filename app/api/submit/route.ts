import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user_address = String(body.user_address || "").trim();
    const action_type = String(body.action_type || "").trim();
    const description = String(body.description || "").trim();
    const proof_url = String(body.proof_url || "").trim();
    const location_cell = String(body.location_cell || "").trim();

    if (!user_address) return NextResponse.json({ error: "Missing user_address" }, { status: 400 });
    if (!action_type) return NextResponse.json({ error: "Missing action_type" }, { status: 400 });
    if (!proof_url) return NextResponse.json({ error: "Missing proof_url" }, { status: 400 });

    const sb = supabaseServer();

    const { error } = await sb.from("submissions").insert({
      user_address,
      action_type,
      description,
      proof_url,
      location_cell,
      status: "pending",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

