import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/timeline -> all transactions joined with account name, ascending by date
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("id, account_id, type, amount, note, created_at, accounts!inner(name)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((t: any) => ({
    id: t.id,
    account_id: t.account_id,
    account_name: t.accounts?.name ?? "—",
    type: t.type,
    amount: Number(t.amount),
    note: t.note,
    created_at: t.created_at,
  }));

  return NextResponse.json({ transactions: rows });
}
