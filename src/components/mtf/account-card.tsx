"use client";

import { useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Link2,
  User,
  KeyRound,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="group relative overflow-hidden border-emerald-100 p-4 sm:p-5 transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/60">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600" />

      <div className="flex items-start justify-between gap-3 pl-1.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {account.name}
          </h3>
          <a
            href={account.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-emerald-700 hover:underline"
          >
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{host}</span>
          </a>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1 border",
            positive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-600"
          )}
        >
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {positive ? "+" : ""}
          {formatIDRShort(net)}
        </Badge>
      </div>

      {/* credentials */}
      <div className="mt-3 space-y-1.5 pl-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex w-16 items-center gap-1 text-muted-foreground">
            <User className="h-3 w-3" /> ID
          </span>
          <span className="num-mono flex-1 truncate text-foreground">
            {account.username}
          </span>
          <button
            onClick={() => copy("id", account.username)}
            className="text-muted-foreground hover:text-emerald-700"
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
          <span className="flex w-16 items-center gap-1 text-muted-foreground">
            <KeyRound className="h-3 w-3" /> Pass
          </span>
          <span className="num-mono flex-1 truncate text-foreground">
            {masked(account.password)}
          </span>
          <button
            onClick={() => copy("pass", account.password)}
            className="text-muted-foreground hover:text-emerald-700"
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
            className="text-muted-foreground hover:text-emerald-700"
            title={reveal ? "Sembunyikan" : "Tampilkan"}
          >
            {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* financial summary */}
      <div className="mt-3 grid grid-cols-3 gap-2 pl-1.5">
        <Mini label="Modal" value={formatIDRShort(Number(account.total_invested || 0))} />
        <Mini label="Profit" value={formatIDRShort(Number(account.total_profit || 0))} />
        <Mini
          label="Bersih"
          value={formatIDRShort(net)}
          tone={positive ? "green" : "red"}
        />
      </div>

      {/* actions */}
      <div className="mt-3 flex items-center gap-2 pl-1.5">
        <a href={account.link} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button
            size="sm"
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Buka Website
          </Button>
        </a>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenDetail}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          Detail
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function Mini({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red";
}) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "num-mono text-xs font-semibold",
          tone === "green" && "text-emerald-700",
          tone === "red" && "text-rose-600",
          tone === "neutral" && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}
