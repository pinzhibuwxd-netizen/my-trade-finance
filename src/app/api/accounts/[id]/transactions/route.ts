import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

// GET /api/accounts/[id]/transactions
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transactions: data ?? [] });
}

// POST /api/accounts/[id]/transactions
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, amount, note } = body ?? {};
  if (type !== "invest" && type !== "profit") {
    return NextResponse.json(
      { error: "type harus 'invest' atau 'profit'" },
      { status: 400 }
    );
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json(
      { error: "amount harus angka > 0" },
      { status: 400 }
    );
  }

  const { error: accErr } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("id", id)
    .single();
  if (accErr) {
    return NextResponse.json({ error: "Account tidak ditemukan" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .insert({
      account_id: id,
      type,
      amount: amt,
      note: note ? String(note).trim() : null,
      trade_at: body.trade_at ? new Date(body.trade_at).toISOString() : new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transaction: data }, { status: 201 });
}
