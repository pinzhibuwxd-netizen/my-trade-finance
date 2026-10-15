"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Clock, Flame, CalendarDays, TrendingUp } from "lucide-react";
import {
  formatIDR,
  formatIDRShort,
  DAY_NAMES,
  type AccountSummary,
  type Patterns,
  type TimelineTx,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const GREEN = "oklch(0.78 0.18 155)";
const GREEN_DEEP = "oklch(0.65 0.2 150)";
const RED = "oklch(0.68 0.22 22)";
const GRID = "oklch(0.78 0.18 155 / 0.18)";

const areaConfig = { cum: { label: "Kumulatif", color: GREEN } } satisfies ChartConfig;

function ChartShell({
  title,
  icon: Icon,
  right,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-emerald-300" />
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
            {title}
          </h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Empty({ text, h = 160 }: { text: string; h?: number }) {
  return (
    <div
      className="flex w-full items-center justify-center text-xs text-zinc-500"
      style={{ height: h }}
    >
      {text}
    </div>
  );
}

/* ===== Area: cumulative net (journey recap) ===== */
export function AreaChartTimeline({
  transactions,
  loading,
}: {
  transactions: TimelineTx[];
  loading: boolean;
}) {
  const data = useMemo(() => {
    return transactions.reduce<{ date: string; cum: number }[]>((acc, t) => {
      const prev = acc.length ? acc[acc.length - 1].cum : 0;
      const next = prev + (t.type === "profit" ? t.amount : -t.amount);
      acc.push({
        date: new Date(t.trade_at || t.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        cum: Math.round(next),
      });
      return acc;
    }, []);
  }, [transactions]);

  return (
    <ChartShell
      title="Perjalanan Profit"
      icon={TrendingUp}
      right={
        <span className="num-mono text-xs text-zinc-400">
          {transactions.length} titik
        </span>
      }
    >
      {loading ? (
        <Skeleton className="h-[180px] w-full bg-white/10" />
      ) : data.length === 0 ? (
        <Empty text="Belum ada transaksi" />
      ) : (
        <ChartContainer config={areaConfig} className="h-[180px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.45} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tick={{ fontSize: 9, fill: "oklch(0.7 0.02 150)" }}
            />
            <YAxis
              tickFormatter={(v) => formatIDRShort(Number(v))}
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 9, fill: "oklch(0.7 0.02 150)" }}
            />
            <ReferenceLine y={0} stroke="oklch(0.5 0.02 150)" />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(v) => formatIDR(Number(v))} />
              }
            />
            <Area
              dataKey="cum"
              type="monotone"
              stroke={GREEN_DEEP}
              strokeWidth={2.5}
              fill="url(#cumFill)"
              dot={false}
              activeDot={{ r: 4, fill: GREEN_DEEP }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </ChartShell>
  );
}

/* ===== Combined: Ringkasan Akun (replaces Donut + Bar) =====
   Per-account horizontal stacked bar: invested (rose) + profit (emerald),
   with net badge. Shows distribution AND per-account net in ONE compact card. */
export function AccountOverview({
  accounts,
  loading,
}: {
  accounts: AccountSummary[];
  loading: boolean;
}) {
  const rows = useMemo(
    () =>
      accounts.map((a) => ({
        id: a.account_id,
        name: a.name,
        invested: Number(a.total_invested || 0),
        profit: Number(a.total_profit || 0),
        net: Number(a.net_profit || 0),
      })),
    [accounts]
  );
  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
  const totalNet = totalProfit - totalInvested;
  const maxBar = Math.max(1, ...rows.map((r) => r.invested + r.profit));

  return (
    <ChartShell
      title="Ringkasan Akun"
      icon={CalendarDays}
      right={
        rows.length > 0 ? (
          <span
            className={cn(
              "num-mono text-xs font-medium",
              totalNet >= 0 ? "text-emerald-300" : "text-rose-300"
            )}
          >
            {totalNet >= 0 ? "+" : ""}
            {formatIDRShort(totalNet)}
          </span>
        ) : null
      }
    >
      {loading ? (
        <Skeleton className="h-[180px] w-full bg-white/10" />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada akun" />
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const positive = r.net >= 0;
            const investW = (r.invested / maxBar) * 100;
            const profitW = (r.profit / maxBar) * 100;
            return (
              <div key={r.id} className="flex items-center gap-2.5">
                <span className="w-20 shrink-0 truncate text-xs text-zinc-300">
                  {r.name}
                </span>
                <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-white/5">
                  {r.invested > 0 && (
                    <div
                      className="bg-rose-400/40"
                      style={{ width: `${investW}%` }}
                      title={`Modal ${formatIDR(r.invested)}`}
                    />
                  )}
                  {r.profit > 0 && (
                    <div
                      className="bg-emerald-400/70"
                      style={{ width: `${profitW}%` }}
                      title={`Profit ${formatIDR(r.profit)}`}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "num-mono w-16 shrink-0 text-right text-xs font-medium",
                    positive ? "text-emerald-300" : "text-rose-300"
                  )}
                >
                  {positive ? "+" : ""}
                  {formatIDRShort(r.net)}
                </span>
              </div>
            );
          })}

          {/* totals */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px]">
            <span className="text-zinc-500">
              {formatIDRShort(totalInvested)} modal · {formatIDRShort(totalProfit)}{" "}
              profit
            </span>
            <span className="flex items-center gap-3 text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-[2px] bg-rose-400/40" />
                modal
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-[2px] bg-emerald-400/70" />
                profit
              </span>
            </span>
          </div>
        </div>
      )}
    </ChartShell>
  );
}

/* ===== PATTERNS: prime badges ===== */
function PrimeBadge({
  label,
  value,
  net,
  icon: Icon,
}: {
  label: string;
  value: string;
  net: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glass glow relative overflow-hidden rounded-2xl p-4">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-emerald-300" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-400">
          {label}
        </span>
      </div>
      <p className="num-mono mt-2 text-lg font-bold text-emerald-300 text-glow">
        {value}
      </p>
      <p className="num-mono mt-0.5 text-xs text-zinc-400">
        {net >= 0 ? "+" : ""}
        {formatIDR(net)}
      </p>
    </div>
  );
}

export function PatternPrimeBadges({ patterns }: { patterns: Patterns | null }) {
  const prime = patterns?.prime;
  const primeDay = patterns?.primeDay;
  const primeHour = patterns?.primeHour;

  const fmtHour = (h: number | null) =>
    h === null ? "—" : `${String(h).padStart(2, "0")}:00`;

  return (
    <div className="grid grid-cols-3 gap-3">
      <PrimeBadge
        label="Jam Emas"
        value={fmtHour(primeHour?.hour ?? null)}
        net={primeHour?.net ?? 0}
        icon={Clock}
      />
      <PrimeBadge
        label="Hari Emas"
        value={primeDay?.day_name ?? "—"}
        net={primeDay?.net ?? 0}
        icon={CalendarDays}
      />
      <PrimeBadge
        label="Kombinasi"
        value={
          prime ? `${DAY_NAMES[prime.day_index]} ${fmtHour(prime.hour)}` : "—"
        }
        net={prime?.net ?? 0}
        icon={Flame}
      />
    </div>
  );
}

const dayConfig = { net: { label: "Bersih", color: GREEN } } satisfies ChartConfig;
const hourConfig = { net: { label: "Bersih", color: GREEN } } satisfies ChartConfig;

/* ===== Combined: Pola Hari & Jam (replaces separate day + hour charts) ===== */
export function PatternDayHour({
  patterns,
  loading,
}: {
  patterns: Patterns | null;
  loading: boolean;
}) {
  const dayData = useMemo(
    () =>
      (patterns?.byDay ?? []).map((d) => ({
        name: DAY_NAMES[d.day_index],
        net: d.net,
        count: d.count,
      })),
    [patterns]
  );
  const hourData = useMemo(
    () =>
      (patterns?.byHour ?? []).map((h) => ({
        hour: h.hour,
        label: h.hour % 2 === 0 ? `${String(h.hour).padStart(2, "0")}` : "",
        net: h.net,
        count: h.count,
      })),
    [patterns]
  );

  const noDay = dayData.every((d) => d.count === 0);
  const noHour = hourData.every((d) => d.count === 0);

  return (
    <ChartShell title="Pola Hari & Jam" icon={Clock}>
      {loading ? (
        <Skeleton className="h-[180px] w-full bg-white/10" />
      ) : noDay && noHour ? (
        <Empty text="Belum ada pola" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* day mini chart */}
          <div>
            <p className="mb-1 text-[9px] uppercase tracking-widest text-zinc-500">
              per Hari
            </p>
            <ChartContainer config={dayConfig} className="h-[140px] w-full">
              <BarChart data={dayData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  interval={0}
                  tick={{ fontSize: 9, fill: "oklch(0.7 0.02 150)" }}
                />
                <YAxis
                  tickFormatter={(v) => formatIDRShort(Number(v))}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tick={{ fontSize: 8, fill: "oklch(0.7 0.02 150)" }}
                />
                <ReferenceLine y={0} stroke="oklch(0.5 0.02 150)" />
                <ChartTooltip
                  cursor={{ fill: "oklch(0.78 0.18 155 / 0.1)" }}
                  content={
                    <ChartTooltipContent formatter={(v) => formatIDR(Number(v))} />
                  }
                />
                <Bar dataKey="net" radius={[4, 4, 4, 4]} maxBarSize={28}>
                  {dayData.map((d, i) => (
                    <Cell key={i} fill={d.net >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          {/* hour mini chart */}
          <div>
            <p className="mb-1 text-[9px] uppercase tracking-widest text-zinc-500">
              per Jam
            </p>
            <ChartContainer config={hourConfig} className="h-[140px] w-full">
              <BarChart data={hourData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  interval={0}
                  tick={{ fontSize: 7, fill: "oklch(0.7 0.02 150)" }}
                />
                <YAxis
                  tickFormatter={(v) => formatIDRShort(Number(v))}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  tick={{ fontSize: 8, fill: "oklch(0.7 0.02 150)" }}
                />
                <ReferenceLine y={0} stroke="oklch(0.5 0.02 150)" />
                <ChartTooltip
                  cursor={{ fill: "oklch(0.78 0.18 155 / 0.1)" }}
                  content={
                    <ChartTooltipContent formatter={(v) => formatIDR(Number(v))} />
                  }
                />
                <Bar dataKey="net" radius={[3, 3, 3, 3]} maxBarSize={10}>
                  {hourData.map((d, i) => (
                    <Cell key={i} fill={d.net >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      )}
    </ChartShell>
  );
}

/* ===== Heatmap (kept standalone) ===== */
export function PatternHeatmap({
  patterns,
  loading,
}: {
  patterns: Patterns | null;
  loading: boolean;
}) {
  const BUCKETS = [
    { label: "00-03", start: 0, end: 3 },
    { label: "04-07", start: 4, end: 7 },
    { label: "08-11", start: 8, end: 11 },
    { label: "12-15", start: 12, end: 15 },
    { label: "16-19", start: 16, end: 19 },
    { label: "20-23", start: 20, end: 23 },
  ];
  const cellMap = useMemo(() => {
    const m = new Map<string, { net: number; count: number }>();
    for (const c of patterns?.heatmap ?? []) {
      const bucket = BUCKETS.find((b) => c.hour >= b.start && c.hour <= b.end);
      if (!bucket) continue;
      const key = `${c.day_index}:${bucket.label}`;
      const cur = m.get(key) ?? { net: 0, count: 0 };
      cur.net += c.net;
      cur.count += c.count;
      m.set(key, cur);
    }
    return m;
  }, [patterns]);

  const maxAbs = useMemo(() => {
    let mx = 0;
    for (const v of cellMap.values()) mx = Math.max(mx, Math.abs(v.net));
    return mx || 1;
  }, [cellMap]);

  const hasData = cellMap.size > 0;

  return (
    <ChartShell title="Heatmap Aktivitas" icon={Flame}>
      {loading ? (
        <Skeleton className="h-[180px] w-full bg-white/10" />
      ) : !hasData ? (
        <Empty text="Belum ada pola" />
      ) : (
        <div className="overflow-x-auto scroll-soft">
          <div className="min-w-[320px]">
            <div className="grid grid-cols-[28px_repeat(6,1fr)] gap-1 mb-1">
              <span />
              {BUCKETS.map((b) => (
                <span
                  key={b.label}
                  className="text-center text-[8px] font-medium text-zinc-500"
                >
                  {b.label}
                </span>
              ))}
            </div>
            {DAY_NAMES.map((day, dIdx) => (
              <div
                key={day}
                className="grid grid-cols-[28px_repeat(6,1fr)] gap-1 mb-1"
              >
                <span className="flex items-center text-[9px] font-medium text-zinc-400">
                  {day}
                </span>
                {BUCKETS.map((b) => {
                  const k = `${dIdx}:${b.label}`;
                  const cell = cellMap.get(k);
                  const net = cell?.net ?? 0;
                  const count = cell?.count ?? 0;
                  const intensity = Math.min(1, Math.abs(net) / maxAbs);
                  const positive = net >= 0;
                  const alpha = count === 0 ? 0 : 0.12 + intensity * 0.58;
                  const bg =
                    count === 0
                      ? "oklch(0.3 0.02 155 / 0.3)"
                      : positive
                      ? `oklch(0.78 0.18 155 / ${alpha})`
                      : `oklch(0.68 0.22 22 / ${alpha})`;
                  return (
                    <div
                      key={b.label}
                      title={
                        count > 0
                          ? `${day} ${b.label}: ${net >= 0 ? "+" : ""}${formatIDR(
                              net
                            )} • ${count} tx`
                          : `${day} ${b.label}`
                      }
                      className={cn(
                        "aspect-[2/1] rounded-[3px] border border-white/5 transition-transform hover:scale-105",
                        count > 0 && "ring-1 ring-emerald-400/20"
                      )}
                      style={{ background: bg }}
                    />
                  );
                })}
              </div>
            ))}
            <div className="mt-3 flex items-center justify-end gap-3 text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: "oklch(0.68 0.22 22 / 0.5)" }}
                />
                rugi
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: "oklch(0.78 0.18 155 / 0.5)" }}
                />
                profit
              </span>
            </div>
          </div>
        </div>
      )}
    </ChartShell>
  );
}

export type { TimelineTx };
