"use client";

import {
  Wallet,
  TrendingUp,
  Coins,
  Trophy,
  type LucideIcon,
} from "lucide-react";
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

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "green" | "red" | "muted";
  loading?: boolean;
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-xl",
            tone === "green" && "bg-emerald-400/15 text-emerald-300",
            tone === "red" && "bg-rose-400/15 text-rose-300",
            tone === "muted" && "bg-white/10 text-zinc-300"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-6 w-24 bg-white/10" />
      ) : (
        <p
          className={cn(
            "num-mono mt-3 text-lg font-bold tracking-tight",
            tone === "green" && "text-emerald-300 text-glow",
            tone === "red" && "text-rose-300",
            tone === "muted" && "text-foreground"
          )}
        >
          {value}
        </p>
      )}
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-zinc-400">
        {label}
      </p>
    </div>
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
      <StatTile
        icon={Wallet}
        label="Modal"
        value={stats ? formatIDRShort(stats.totalInvested) : "—"}
        tone="muted"
        loading={loading}
      />
      <StatTile
        icon={TrendingUp}
        label="Profit"
        value={stats ? formatIDRShort(stats.totalProfit) : "—"}
        tone="green"
        loading={loading}
      />
      <StatTile
        icon={Coins}
        label="Bersih"
        value={stats ? formatIDRShort(stats.netProfit) : "—"}
        tone={stats && stats.netProfit >= 0 ? "green" : "red"}
        loading={loading}
      />
      <StatTile
        icon={Trophy}
        label="Terbaik"
        value={
          stats?.bestAccountName ? formatIDRShort(stats.bestAccountProfit) : "—"
        }
        tone="green"
        loading={loading}
      />
    </div>
  );
}

export function formatFull(n: number) {
  return formatIDR(n);
}
