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
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Wallet,
  TrendingUp,
  Coins,
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

  // Re-fetch when an external mutation happened (e.g. add/edit tx dialog saved)
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
    toast.success("Akun & seluruh transaksi dihapus");
    setConfirmDeleteAcc(false);
    onOpenChange(false);
    onMutated();
  };

  if (!account) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="border-b bg-gradient-to-br from-emerald-50 to-white p-5 pb-4">
          <SheetTitle className="flex items-start justify-between gap-2 text-emerald-900">
            <span className="text-lg font-bold">{account.name}</span>
            <a href={account.link} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Buka
              </Button>
            </a>
          </SheetTitle>
          <SheetDescription className="truncate">
            {(() => {
              try {
                return new URL(account.link).hostname;
              } catch {
                return account.link;
              }
            })()}
          </SheetDescription>

          {/* credentials row */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">ID</p>
              <p className="num-mono truncate font-medium text-foreground">{account.username}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Password</p>
              <p className="num-mono truncate font-medium text-foreground">{account.password}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-2 border-b p-4">
          <Tile icon={Wallet} label="Modal" value={formatIDR(summary.invested)} tone="neutral" />
          <Tile icon={TrendingUp} label="Profit" value={formatIDR(summary.profit)} tone="green" />
          <Tile icon={Coins} label="Bersih" value={formatIDR(summary.net)} tone={summary.net >= 0 ? "green" : "red"} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-b p-4 pb-3">
          <Button
            size="sm"
            onClick={() => onAddTransaction(account.account_id, account.name)}
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="mr-1 h-4 w-4" /> Tambah Transaksi
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditAccount(account)}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmDeleteAcc(true)}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto scroll-soft p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Riwayat Transaksi</h4>
            <Badge variant="secondary" className="num-mono">{txs.length}</Badge>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : txs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada transaksi. Klik{" "}
                <span className="font-medium text-emerald-700">Tambah Transaksi</span> untuk mulai mencatat.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {txs.map((t) => {
                const isProfit = t.type === "profit";
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border bg-card p-3"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        isProfit
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-600"
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
                          isProfit ? "text-emerald-700" : "text-rose-600"
                        )}
                      >
                        {isProfit ? "+" : "-"}
                        {formatIDR(Number(t.amount))}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {t.note || (isProfit ? "Profit" : "Modal")} ·{" "}
                        {new Date(t.created_at).toLocaleString("id-ID", {
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
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-emerald-700"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTx(t.id)}
                        disabled={deletingTx === t.id}
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-rose-600 disabled:opacity-50"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus <b>{account.name}</b> beserta seluruh{" "}
              {txs.length} transaksinya. Tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAccount}
              disabled={busy}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Ya, Hapus
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
  tone: "neutral" | "green" | "red";
}) {
  return (
    <div className="rounded-xl border bg-card p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={cn(
          "num-mono mt-1 text-sm font-bold",
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
