"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Wallet,
  TrendingUp,
  Coins,
  ExternalLink,
} from "lucide-react";
import { useFetch, apiRequest } from "./use-fetch";
import { formatIDR, type AccountSummary, type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  account: AccountSummary | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAddTransaction: (accountId: string, accountName: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onEditAccount: (account: AccountSummary) => void;
  onMutated: () => void;
  refreshNonce: number;
}

export function AccountDetailSheet({
  account,
  open,
  onOpenChange,
  onAddTransaction,
  onEditTransaction,
  onEditAccount,
  onMutated,
  refreshNonce,
}: Props) {
  const accountId = account?.account_id ?? null;
  const { data, loading, refetch } = useFetch<{ transactions: Transaction[] }>(
    open && accountId ? `/api/accounts/${accountId}/transactions` : null
  );

  useEffect(() => {
    if (open && accountId) refetch();
  }, [refreshNonce, open, accountId, refetch]);

  const [deletingTx, setDeletingTx] = useState<string | null>(null);
  const [confirmDeleteAcc, setConfirmDeleteAcc] = useState(false);
  const [busy, setBusy] = useState(false);

  const txs = data?.transactions ?? [];

  const summary = useMemo(() => {
    let invested = 0;
    let profit = 0;
    for (const t of txs) {
      if (t.type === "invest") invested += Number(t.amount);
      else profit += Number(t.amount);
    }
    return { invested, profit, net: profit - invested };
  }, [txs]);

  const deleteTx = async (id: string) => {
    setDeletingTx(id);
    const res = await apiRequest("DELETE", `/api/transactions/${id}`);
    setDeletingTx(null);
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus transaksi");
      return;
    }
    toast.success("Transaksi dihapus");
    refetch();
    onMutated();
  };

  const deleteAccount = async () => {
    if (!account) return;
    setBusy(true);
    const res = await apiRequest("DELETE", `/api/accounts/${account.account_id}`);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus akun");
      return;
    }
    toast.success("Akun & transaksi dihapus");
    setConfirmDeleteAcc(false);
    onOpenChange(false);
    onMutated();
  };

  if (!account) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-strong flex w-full flex-col gap-0 border-l-emerald-400/20 p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="border-b border-white/10 p-5 pb-4">
          <SheetTitle className="flex items-start justify-between gap-2">
            <span className="text-lg font-bold text-emerald-300 text-glow">
              {account.name}
            </span>
            <a href={account.link} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Buka
              </Button>
            </a>
          </SheetTitle>
          <SheetDescription className="truncate text-zinc-400">
            {(() => {
              try {
                return new URL(account.link).hostname;
              } catch {
                return account.link;
              }
            })()}
          </SheetDescription>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">ID</p>
              <p className="num-mono truncate font-medium text-zinc-100">
                {account.username}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Pass</p>
              <p className="num-mono truncate font-medium text-zinc-100">
                {account.password}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-2 border-b border-white/10 p-4">
          <Tile icon={Wallet} label="Modal" value={formatIDR(summary.invested)} tone="muted" />
          <Tile icon={TrendingUp} label="Profit" value={formatIDR(summary.profit)} tone="green" />
          <Tile
            icon={Coins}
            label="Bersih"
            value={formatIDR(summary.net)}
            tone={summary.net >= 0 ? "green" : "red"}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-b border-white/10 p-4 pb-3">
          <Button
            size="sm"
            onClick={() => onAddTransaction(account.account_id, account.name)}
            className="flex-1 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            <Plus className="mr-1 h-4 w-4" /> Transaksi
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditAccount(account)}
            className="border-emerald-400/30 bg-transparent text-emerald-300 hover:bg-emerald-400/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmDeleteAcc(true)}
            className="border-rose-400/30 bg-transparent text-rose-300 hover:bg-rose-400/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto scroll-soft p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Riwayat
            </h4>
            <Badge variant="secondary" className="num-mono bg-white/5 text-zinc-300">
              {txs.length}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/10" />
              ))}
            </div>
          ) : txs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
              <p className="text-xs text-zinc-400">
                Belum ada transaksi. Klik{" "}
                <span className="font-medium text-emerald-300">Transaksi</span> untuk mulai mencatat.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {txs.map((t) => {
                const isProfit = t.type === "profit";
                const when = new Date(t.trade_at || t.created_at);
                return (
                  <li
                    key={t.id}
                    className="glass flex items-center gap-3 rounded-xl p-3"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        isProfit
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-rose-400/15 text-rose-300"
                      )}
                    >
                      {isProfit ? (
                        <ArrowUpFromLine className="h-4 w-4" />
                      ) : (
                        <ArrowDownToLine className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "num-mono text-sm font-semibold",
                          isProfit ? "text-emerald-300" : "text-rose-300"
                        )}
                      >
                        {isProfit ? "+" : "-"}
                        {formatIDR(Number(t.amount))}
                      </p>
                      <p className="truncate text-[11px] text-zinc-500">
                        {t.note || (isProfit ? "Profit" : "Modal")} ·{" "}
                        {when.toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-emerald-300"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTx(t.id)}
                        disabled={deletingTx === t.id}
                        className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-rose-300 disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingTx === t.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>

      <AlertDialog open={confirmDeleteAcc} onOpenChange={setConfirmDeleteAcc}>
        <AlertDialogContent className="glass-strong border-rose-400/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-300">Hapus akun ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Menghapus <b className="text-zinc-200">{account.name}</b> beserta {txs.length} transaksi. Tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy} className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAccount}
              disabled={busy}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "muted" | "green" | "red";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={cn(
          "num-mono mt-1 text-sm font-bold",
          tone === "green" && "text-emerald-300",
          tone === "red" && "text-rose-300",
          tone === "muted" && "text-zinc-100"
        )}
      >
        {value}
      </p>
    </div>
  );
}
