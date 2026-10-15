"use client";

import { useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Link2,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDRShort, type AccountSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AccountCard({
  account,
  onOpenDetail,
}: {
  account: AccountSummary;
  onOpenDetail: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState<"id" | "pass" | null>(null);

  const net = Number(account.net_profit || 0);
  const positive = net >= 0;
  const masked = (v: string) => (reveal ? v : "••••••••");

  const copy = async (field: "id" | "pass", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      toast.success(field === "id" ? "ID disalin" : "Password disalin");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  let host = account.link;
  try {
    host = new URL(account.link).hostname.replace(/^www\./, "");
  } catch {
    /* keep raw */
  }

  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-4 transition-all hover:border-emerald-400/40 hover:shadow-[0_0_28px_-6px_oklch(0.78_0.18_155_/_0.4)]">
      {/* glow accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-zinc-50">
            {account.name}
          </h3>
          <a
            href={account.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-emerald-300/80 hover:text-emerald-300"
          >
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{host}</span>
          </a>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            positive
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/30 bg-rose-400/10 text-rose-300"
          )}
        >
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {positive ? "+" : ""}
          {formatIDRShort(net)}
        </span>
      </div>

      {/* credentials */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-10 shrink-0 text-[10px] uppercase tracking-widest text-zinc-500">
            ID
          </span>
          <span className="num-mono min-w-0 flex-1 truncate text-zinc-200">
            {account.username}
          </span>
          <button
            onClick={() => copy("id", account.username)}
            className="text-zinc-500 hover:text-emerald-300"
            title="Salin ID"
          >
            {copied === "id" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-10 shrink-0 text-[10px] uppercase tracking-widest text-zinc-500">
            Pass
          </span>
          <span className="num-mono min-w-0 flex-1 truncate text-zinc-200">
            {masked(account.password)}
          </span>
          <button
            onClick={() => copy("pass", account.password)}
            className="text-zinc-500 hover:text-emerald-300"
            title="Salin Password"
          >
            {copied === "pass" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => setReveal((v) => !v)}
            className="text-zinc-500 hover:text-emerald-300"
            title={reveal ? "Sembunyikan" : "Tampilkan"}
          >
            {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* mini summary */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Modal" value={formatIDRShort(Number(account.total_invested || 0))} />
        <Mini label="Profit" value={formatIDRShort(Number(account.total_profit || 0))} />
        <Mini
          label="Bersih"
          value={formatIDRShort(net)}
          tone={positive ? "green" : "red"}
        />
      </div>

      {/* actions */}
      <div className="mt-3 flex items-center gap-2">
        <a href={account.link} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button
            size="sm"
            className="w-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Buka
          </Button>
        </a>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenDetail}
          className="border-emerald-400/30 bg-white/5 text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
        >
          Detail
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "green" | "red";
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={cn(
          "num-mono text-xs font-semibold",
          tone === "green" && "text-emerald-300",
          tone === "red" && "text-rose-300",
          tone === "muted" && "text-zinc-200"
        )}
      >
        {value}
      </p>
    </div>
  );
}
