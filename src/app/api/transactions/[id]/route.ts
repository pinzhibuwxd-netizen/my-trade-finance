import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

// PATCH /api/transactions/[id]
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  if (body.type !== undefined) {
    if (body.type !== "invest" && body.type !== "profit") {
      return NextResponse.json({ error: "type invalid" }, { status: 400 });
    }
    update.type = body.type;
  }
  if (body.amount !== undefined) {
    const amt = Number(body.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: "amount invalid" }, { status: 400 });
    }
    update.amount = amt;
  }
  if (body.note !== undefined)
    update.note = body.note ? String(body.note).trim() : null;
  if (body.trade_at !== undefined) {
    const d = new Date(body.trade_at);
    if (Number.isFinite(d.getTime())) update.trade_at = d.toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ transaction: data });
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
