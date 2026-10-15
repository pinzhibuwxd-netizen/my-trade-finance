import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DAY_NAMES_FULL } from "@/lib/types";

export const dynamic = "force-dynamic";

// Extract day-of-week (0=Sun..6=Sat) and hour (0..23) in Asia/Jakarta tz
// regardless of the server's local timezone.
const JKT_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Jakarta",
  weekday: "short", // Sun, Mon, ...
  hour: "numeric",
  hour12: false,
});
const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};
function jakartaDayHour(iso: string): { dow: number; hour: number } {
  const d = new Date(iso);
  const parts = JKT_FMT.formatToParts(d);
  const w = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hStr = parts.find((p) => p.type === "hour")?.value ?? "0";
  let h = Number(hStr);
  if (h === 24) h = 0; // Intl can return 24 for midnight with hour12:false
  return { dow: WEEKDAY_MAP[w] ?? 0, hour: h };
}

// GET /api/patterns -> time-pattern analytics derived from trade_at
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("type, amount, trade_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((t: any) => ({
    type: t.type as "invest" | "profit",
    amount: Number(t.amount),
    ...jakartaDayHour(t.trade_at),
  }));

  const dayAgg = new Map<
    number,
    { invested: number; profit: number; count: number; profitCount: number }
  >();
  const hourAgg = new Map<
    number,
    { invested: number; profit: number; count: number; profitCount: number }
  >();
  const cellAgg = new Map<string, { net: number; count: number }>();

  for (const r of rows) {
    const dow = r.dow;
    const hour = r.hour;
    const signed = r.type === "profit" ? r.amount : -r.amount;

    const d = dayAgg.get(dow) ?? { invested: 0, profit: 0, count: 0, profitCount: 0 };
    if (r.type === "invest") d.invested += r.amount;
    else d.profit += r.amount;
    d.count += 1;
    if (r.type === "profit") d.profitCount += 1;
    dayAgg.set(dow, d);

    const h = hourAgg.get(hour) ?? { invested: 0, profit: 0, count: 0, profitCount: 0 };
    if (r.type === "invest") h.invested += r.amount;
    else h.profit += r.amount;
    h.count += 1;
    if (r.type === "profit") h.profitCount += 1;
    hourAgg.set(hour, h);

    const key = `${dow}:${hour}`;
    const c = cellAgg.get(key) ?? { net: 0, count: 0 };
    c.net += signed;
    c.count += 1;
    cellAgg.set(key, c);
  }

  const byDay = Array.from({ length: 7 }, (_, i) => {
    const d = dayAgg.get(i) ?? {
      invested: 0,
      profit: 0,
      count: 0,
      profitCount: 0,
    };
    return {
      day_index: i,
      day_name: DAY_NAMES_FULL[i],
      total_invested: d.invested,
      total_profit: d.profit,
      net: d.profit - d.invested,
      count: d.count,
      profit_count: d.profitCount,
    };
  });

  const byHour = Array.from({ length: 24 }, (_, i) => {
    const h = hourAgg.get(i) ?? {
      invested: 0,
      profit: 0,
      count: 0,
      profitCount: 0,
    };
    return {
      hour: i,
      total_invested: h.invested,
      total_profit: h.profit,
      net: h.profit - h.invested,
      count: h.count,
      profit_count: h.profitCount,
    };
  });

  const heatmap = Array.from(cellAgg.entries()).map(([k, v]) => {
    const [d, h] = k.split(":").map(Number);
    return { day_index: d, hour: h, net: v.net, count: v.count };
  });

  let prime: {
    day_index: number;
    day_name: string;
    hour: number;
    net: number;
    count: number;
  } | null = null;
  for (const [k, v] of cellAgg.entries()) {
    if (v.count < 1) continue;
    if (!prime || v.net > prime.net) {
      const [d, h] = k.split(":").map(Number);
      prime = {
        day_index: d,
        day_name: DAY_NAMES_FULL[d],
        hour: h,
        net: v.net,
        count: v.count,
      };
    }
  }
  if (prime && prime.net <= 0) prime = null;

  let primeDay: { day_index: number; day_name: string; net: number } | null = null;
  for (const d of byDay) {
    if (d.count < 1) continue;
    if (!primeDay || d.net > primeDay.net) {
      primeDay = {
        day_index: d.day_index,
        day_name: d.day_name,
        net: d.net,
      };
    }
  }
  if (primeDay && primeDay.net <= 0) primeDay = null;

  let primeHour: { hour: number; net: number } | null = null;
  for (const h of byHour) {
    if (h.count < 1) continue;
    if (!primeHour || h.net > primeHour.net) {
      primeHour = { hour: h.hour, net: h.net };
    }
  }
  if (primeHour && primeHour.net <= 0) primeHour = null;

  return NextResponse.json({
    byDay,
    byHour,
    heatmap,
    prime,
    primeDay,
    primeHour,
  });
}
