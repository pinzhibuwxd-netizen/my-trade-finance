"use client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatIDR, formatIDRShort } from "@/lib/types";

interface Stat {
  totalInvested: number;
  totalProfit: number;
  netProfit: number;
  accountCount: number;
  txCount: number;
  bestAccountName: string | null;
  bestAccountProfit: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone: "green" | "red" | "neutral";
  loading?: boolean;
}) {
  const toneCls =
    tone === "green"
      ? "text-emerald-700 bg-emerald-50"
      : tone === "red"
      ? "text-rose-700 bg-rose-50"
      : "text-slate-700 bg-slate-100";
  return (
    <Card className="relative overflow-hidden p-4 sm:p-5 border-emerald-100">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : (
            <p
              className={cn(
                "num-mono mt-1.5 text-xl sm:text-2xl font-bold tracking-tight",
                tone === "green" && "text-emerald-700",
                tone === "red" && "text-rose-600",
                tone === "neutral" && "text-foreground"
              )}
            >
              {value}
            </p>
          )}
          {sub && !loading && (
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
              {sub}
            </p>
          )}
        </div>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            toneCls
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function SummaryCards({
  stats,
  loading,
}: {
  stats: Stat | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Total Investasi"
        value={stats ? formatIDR(stats.totalInvested) : "—"}
        sub={stats ? `${stats.accountCount} akun terdaftar` : undefined}
        tone="neutral"
        loading={loading}
      />
      <StatCard
        icon={TrendingUp}
        label="Total Profit"
        value={stats ? formatIDR(stats.totalProfit) : "—"}
        sub={stats ? `${stats.txCount} transaksi` : undefined}
        tone="green"
        loading={loading}
      />
      <StatCard
        icon={Coins}
        label="Profit Bersih"
        value={stats ? formatIDR(stats.netProfit) : "—"}
        sub={
          stats
            ? stats.netProfit >= 0
              ? "Surplus"
              : "Defisit"
            : undefined
        }
        tone={stats && stats.netProfit >= 0 ? "green" : "red"}
        loading={loading}
      />
      <StatCard
        icon={Trophy}
        label="Akun Terbaik"
        value={stats?.bestAccountName ? formatIDRShort(stats.bestAccountProfit) : "—"}
        sub={stats?.bestAccountName ?? "Belum ada data"}
        tone="green"
        loading={loading}
      />
    </div>
  );
}

export { TrendingDown };
