import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

// GET /api/accounts/[id] -> account detail with computed summary
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const [{ data: account, error: e1 }, { data: summary }] = await Promise.all([
    supabaseAdmin.from("accounts").select("*").eq("id", id).single(),
    supabaseAdmin
      .from("v_account_summary")
      .select("*")
      .eq("account_id", id)
      .single(),
  ]);

  if (e1) {
    return NextResponse.json({ error: e1.message }, { status: 404 });
  }

  return NextResponse.json({
    account: {
      ...account,
      total_invested: summary?.total_invested ?? 0,
      total_profit: summary?.total_profit ?? 0,
      net_profit: summary?.net_profit ?? 0,
      tx_count: summary?.tx_count ?? 0,
      last_tx_at: summary?.last_tx_at ?? null,
    },
  });
}

// PATCH /api/accounts/[id]
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.link !== undefined) {
    let l = String(body.link).trim();
    if (l && !/^https?:\/\//i.test(l)) l = "https://" + l;
    update.link = l;
  }
  if (body.username !== undefined) update.username = String(body.username).trim();
  if (body.password !== undefined) update.password = String(body.password);
  if (body.notes !== undefined)
    update.notes = body.notes ? String(body.notes).trim() : null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada field untuk diupdate" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("accounts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ account: data });
}

// DELETE /api/accounts/[id] (cascades to transactions)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("accounts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
