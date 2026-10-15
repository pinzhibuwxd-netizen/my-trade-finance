"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR, formatIDRShort, type AccountSummary } from "@/lib/types";

interface TimelineTx {
  id: string;
  account_id: string;
  account_name: string;
  type: "invest" | "profit";
  amount: number;
  note: string | null;
  created_at: string;
}

const GREEN = "oklch(0.62 0.17 152)";
const GREEN_LIGHT = "oklch(0.78 0.1 165)";
const GREEN_DEEP = "oklch(0.55 0.2 145)";
const RED = "oklch(0.58 0.22 25)";

/* ---- Bar chart: net profit per account ---- */
const barConfig = {
  net: { label: "Profit Bersih", color: GREEN },
} satisfies ChartConfig;

export function BarChartAccounts({
  accounts,
  loading,
}: {
  accounts: AccountSummary[];
  loading: boolean;
}) {
  const data = useMemo(
    () =>
      accounts.map((a) => ({
        name: a.name.length > 12 ? a.name.slice(0, 11) + "…" : a.name,
        net: Number(a.net_profit || 0),
      })),
    [accounts]
  );

  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-emerald-800">
          Profit Bersih per Akun
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <EmptyChart text="Belum ada akun." />
        ) : (
          <ChartContainer config={barConfig} className="h-[200px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.35} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(v) => formatIDRShort(Number(v))}
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 10 }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <ChartTooltip
                cursor={{ fill: "oklch(0.62 0.17 152 / 0.08)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatIDR(Number(value))}
                  />
                }
              />
              <Bar dataKey="net" radius={[6, 6, 6, 6]} maxBarSize={46}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.net >= 0 ? GREEN : RED} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ---- Area chart: cumulative net profit over time ---- */
const areaConfig = {
  cum: { label: "Profit Kumulatif", color: GREEN },
} satisfies ChartConfig;

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
        date: new Date(t.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        cum: Math.round(next),
      });
      return acc;
    }, []);
  }, [transactions]);

  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-emerald-800">
          Pertumbuhan Profit Kumulatif
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <EmptyChart text="Belum ada transaksi." />
        ) : (
          <ChartContainer config={areaConfig} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.35} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickFormatter={(v) => formatIDRShort(Number(v))}
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 10 }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatIDR(Number(value))}
                  />
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
      </CardContent>
    </Card>
  );
}

/* ---- Donut: investment distribution per account ---- */
const pieConfig = {
  invested: { label: "Investasi", color: GREEN },
} satisfies ChartConfig;

const PIE_COLORS = [
  "oklch(0.62 0.17 152)",
  "oklch(0.7 0.13 160)",
  "oklch(0.78 0.1 165)",
  "oklch(0.55 0.2 145)",
  "oklch(0.66 0.15 158)",
  "oklch(0.72 0.12 162)",
  "oklch(0.6 0.18 150)",
  "oklch(0.68 0.14 156)",
];

export function DonutInvestment({
  accounts,
  loading,
}: {
  accounts: AccountSummary[];
  loading: boolean;
}) {
  const data = useMemo(
    () =>
      accounts
        .filter((a) => Number(a.total_invested || 0) > 0)
        .map((a) => ({
          name: a.name,
          value: Number(a.total_invested || 0),
        })),
    [accounts]
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-emerald-800">
          Distribusi Modal Investasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <EmptyChart text="Belum ada investasi." />
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ChartContainer config={pieConfig} className="h-[180px] w-[180px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatIDR(Number(value))}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex-1 w-full max-h-[180px] overflow-y-auto scroll-soft pr-1 space-y-1.5">
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-foreground">{d.name}</span>
                  </span>
                  <span className="num-mono font-medium text-muted-foreground shrink-0">
                    {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export type { TimelineTx };
