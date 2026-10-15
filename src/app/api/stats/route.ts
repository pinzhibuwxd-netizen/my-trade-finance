import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/stats -> dashboard-level aggregates
export async function GET() {
  const [{ data, error }, { count: profitCount }] = await Promise.all([
    supabaseAdmin.from("v_account_summary").select("*"),
    supabaseAdmin
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("type", "profit"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const totalInvested = rows.reduce(
    (s, r) => s + Number(r.total_invested || 0),
    0
  );
  const totalProfit = rows.reduce(
    (s, r) => s + Number(r.total_profit || 0),
    0
  );
  const netProfit = totalProfit - totalInvested;
  const txCount = rows.reduce((s, r) => s + Number(r.tx_count || 0), 0);
  const profitCountNum = profitCount ?? 0;
  const investCount = Math.max(0, txCount - profitCountNum);
  const winRate = txCount > 0 ? (profitCountNum / txCount) * 100 : 0;

  const best =
    rows.length === 0
      ? null
      : rows.reduce(
          (acc, r) =>
            Number(r.net_profit || 0) > Number(acc?.net_profit || 0) ? r : acc,
          rows[0]
        );

  return NextResponse.json({
    totalInvested,
    totalProfit,
    netProfit,
    accountCount: rows.length,
    txCount,
    profitCount: profitCountNum,
    investCount,
    winRate,
    bestAccountId: best?.account_id ?? null,
    bestAccountName: best?.name ?? null,
    bestAccountProfit: Number(best?.net_profit ?? 0),
  });
}
