"use client";

import { useCallback, useState } from "react";
import { Plus, LineChart, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/mtf/summary-cards";
import {
  AreaChartTimeline,
  BarChartAccounts,
  DonutInvestment,
  type TimelineTx,
} from "@/components/mtf/charts";
import { AccountCard } from "@/components/mtf/account-card";
import { AddAccountDialog } from "@/components/mtf/add-account-dialog";
import { AddTransactionDialog } from "@/components/mtf/add-transaction-dialog";
import { AccountDetailSheet } from "@/components/mtf/account-detail-sheet";
import { EmptyState } from "@/components/mtf/empty-state";
import { useFetch } from "@/components/mtf/use-fetch";
import type { AccountSummary, DashboardStats, Transaction } from "@/lib/types";
import { toast } from "sonner";

export default function Home() {
  const [addOpen, setAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountSummary | null>(null);
  const [detailAccount, setDetailAccount] = useState<AccountSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [txOpen, setTxOpen] = useState(false);
  const [txTarget, setTxTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [detailRefresh, setDetailRefresh] = useState(0);

  // data
  const statsQ = useFetch<DashboardStats>("/api/stats");
  const accountsQ = useFetch<{ accounts: AccountSummary[] }>("/api/accounts");
  const timelineQ = useFetch<{ transactions: TimelineTx[] }>("/api/timeline");

  const reloadAll = useCallback(() => {
    statsQ.refetch();
    accountsQ.refetch();
    timelineQ.refetch();
  }, [statsQ, accountsQ, timelineQ]);

  const openAdd = () => {
    setEditingAccount(null);
    setAddOpen(true);
  };
  const openEditAccount = (a: AccountSummary) => {
    setEditingAccount(a);
    setAddOpen(true);
  };
  const openDetail = (a: AccountSummary) => {
    setDetailAccount(a);
    setDetailOpen(true);
  };
  const openAddTx = (accountId: string, accountName: string) => {
    setEditingTx(null);
    setTxTarget({ id: accountId, name: accountName });
    setTxOpen(true);
  };
  const openEditTx = (t: Transaction) => {
    setEditingTx(t);
    setTxTarget(detailAccount ? { id: detailAccount.account_id, name: detailAccount.name } : null);
    setTxOpen(true);
  };

  const stats = statsQ.data;
  const accounts = accountsQ.data?.accounts ?? [];
  const transactions = timelineQ.data?.transactions ?? [];
  const loading = statsQ.loading || accountsQ.loading;

  return (
    <div className="flex min-h-screen flex-col bg-tech-grid">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <LineChart className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                My Trade Finance
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Pengelola investasi multi-akun
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={reloadAll}
              title="Muat ulang"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={openAdd}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Tambah Akun</span><span className="sm:hidden">Akun</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
        {/* ===== Hero ===== */}
        <section className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
          <div className="anime-sheen absolute inset-0" />
          <div className="relative flex items-center gap-4 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                <Sparkles className="h-3 w-3" /> Dashboard Analitik
              </span>
              <h2 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
                Profit bersih kamu{" "}
                <span className={stats && stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                  {stats ? `${stats.netProfit >= 0 ? "+" : ""}${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.netProfit)}` : "..."}
                </span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {accounts.length > 0
                  ? `Tersebar di ${accounts.length} akun dengan ${stats?.txCount ?? 0} transaksi tercatat.`
                  : "Tambahkan akun pertamamu untuk mulai mencatat transaksi & profit."}
              </p>
            </div>
            {/* mascot */}
            <img
              src="/hero-mascot.png"
              alt="Mascot analisis keuangan"
              className="hidden h-28 w-28 shrink-0 rounded-xl object-cover sm:block md:h-36 md:w-36"
            />
          </div>
        </section>

        {/* ===== Summary cards ===== */}
        <section className="mb-5">
          <SummaryCards stats={stats ?? null} loading={loading} />
        </section>

        {/* ===== Charts ===== */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AreaChartTimeline transactions={transactions} loading={timelineQ.loading} />
          </div>
          <DonutInvestment accounts={accounts} loading={accountsQ.loading} />
        </section>
        <section className="mb-7">
          <BarChartAccounts accounts={accounts} loading={accountsQ.loading} />
        </section>

        {/* ===== Accounts ===== */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Akun Investasi
            </h2>
            <span className="text-xs text-muted-foreground">{accounts.length} akun</span>
          </div>

          {accountsQ.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState onAdd={openAdd} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((a) => (
                <AccountCard key={a.account_id} account={a} onOpenDetail={() => openDetail(a)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ===== Footer (sticky bottom) ===== */}
      <footer className="mt-auto border-t border-emerald-100 bg-white/80 backdrop-blur pb-safe">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            <span className="font-semibold text-emerald-700">My Trade Finance</span> · PWA · Powered by Supabase
          </p>
          <p className="num-mono">{new Date().getFullYear()} · v1.0</p>
        </div>
      </footer>

      {/* ===== Dialogs ===== */}
      <AddAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={reloadAll}
        account={editingAccount}
      />
      <AddTransactionDialog
        open={txOpen}
        onOpenChange={(v) => {
          setTxOpen(v);
          if (!v) setEditingTx(null);
        }}
        onSaved={() => {
          reloadAll();
          setDetailRefresh((n) => n + 1);
        }}
        accountId={txTarget?.id ?? null}
        accountName={txTarget?.name ?? null}
        transaction={editingTx}
      />
      <AccountDetailSheet
        account={detailAccount}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddTransaction={openAddTx}
        onEditTransaction={openEditTx}
        onEditAccount={(a) => {
          setDetailOpen(false);
          openEditAccount(a);
        }}
        onMutated={() => {
          reloadAll();
          setDetailRefresh((n) => n + 1);
        }}
        refreshNonce={detailRefresh}
      />
    </div>
  );
}
