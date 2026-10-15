"use client";

import { useCallback, useState } from "react";
import { Plus, RefreshCw, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/mtf/summary-cards";
import {
  AreaChartTimeline,
  BarChartAccounts,
  DonutInvestment,
  PatternByDay,
  PatternByHour,
  PatternHeatmap,
  PatternPrimeBadges,
  type TimelineTx,
} from "@/components/mtf/charts";
import { AccountCard } from "@/components/mtf/account-card";
import { AddAccountDialog } from "@/components/mtf/add-account-dialog";
import { AddTransactionDialog } from "@/components/mtf/add-transaction-dialog";
import { AccountDetailSheet } from "@/components/mtf/account-detail-sheet";
import { EmptyState } from "@/components/mtf/empty-state";
import { useFetch } from "@/components/mtf/use-fetch";
import type {
  AccountSummary,
  DashboardStats,
  Patterns,
  Transaction,
} from "@/lib/types";

export default function Home() {
  const [addOpen, setAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountSummary | null>(null);
  const [detailAccount, setDetailAccount] = useState<AccountSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [txOpen, setTxOpen] = useState(false);
  const [txTarget, setTxTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [detailRefresh, setDetailRefresh] = useState(0);

  const statsQ = useFetch<DashboardStats>("/api/stats");
  const accountsQ = useFetch<{ accounts: AccountSummary[] }>("/api/accounts");
  const timelineQ = useFetch<{ transactions: TimelineTx[] }>("/api/timeline");
  const patternsQ = useFetch<Patterns>("/api/patterns");

  const reloadAll = useCallback(() => {
    statsQ.refetch();
    accountsQ.refetch();
    timelineQ.refetch();
    patternsQ.refetch();
  }, [statsQ, accountsQ, timelineQ, patternsQ]);

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
    setTxTarget(
      detailAccount
        ? { id: detailAccount.account_id, name: detailAccount.name }
        : null
    );
    setTxOpen(true);
  };

  const stats = statsQ.data;
  const accounts = accountsQ.data?.accounts ?? [];
  const transactions = timelineQ.data?.transactions ?? [];
  const patterns = patternsQ.data ?? null;
  const loading = statsQ.loading || accountsQ.loading;

  return (
    <div className="relative min-h-screen bg-tech-grid">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="glow grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-emerald-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-zinc-50 sm:text-lg">
                Trade<span className="text-emerald-400">Finance</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={reloadAll}
              title="Muat ulang"
              className="border-white/10 bg-transparent text-emerald-300 hover:bg-emerald-400/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={openAdd}
              className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Akun</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
        {/* ===== Hero ===== */}
        <section className="glass anime-sheen relative mb-5 overflow-hidden rounded-2xl glow">
          <div className="relative flex items-center gap-4 p-5 sm:p-6">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-emerald-300">
                <Sparkles className="h-3 w-3" /> Profit Bersih
              </span>
              <h2 className="num-mono mt-2 text-3xl font-bold leading-tight text-glow sm:text-4xl">
                <span className={stats && stats.netProfit >= 0 ? "text-emerald-300" : "text-rose-300"}>
                  {stats
                    ? `${stats.netProfit >= 0 ? "+" : ""}${new Intl.NumberFormat(
                        "id-ID",
                        { style: "currency", currency: "IDR", maximumFractionDigits: 0 }
                      ).format(stats.netProfit)}`
                    : "···"}
                </span>
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {accounts.length > 0
                  ? `${accounts.length} akun · ${stats?.txCount ?? 0} transaksi`
                  : "Tambahkan akun pertamamu"}
              </p>
            </div>
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

        {/* ===== POLA WAKTU (new) ===== */}
        <section className="mb-7">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              Pola Waktu
            </h2>
          </div>
          <div className="space-y-4">
            <PatternPrimeBadges patterns={patterns} />
            <div className="grid gap-4 sm:grid-cols-2">
              <PatternByDay patterns={patterns} loading={patternsQ.loading} />
              <PatternByHour patterns={patterns} loading={patternsQ.loading} />
            </div>
            <PatternHeatmap patterns={patterns} loading={patternsQ.loading} />
          </div>
        </section>

        {/* ===== Accounts ===== */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              Akun
            </h2>
            <span className="num-mono text-xs text-zinc-500">{accounts.length}</span>
          </div>

          {accountsQ.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState onAdd={openAdd} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((a) => (
                <AccountCard
                  key={a.account_id}
                  account={a}
                  onOpenDetail={() => openDetail(a)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ===== Footer (sticky bottom) ===== */}
      <footer className="mt-auto border-t border-white/10 bg-background/70 backdrop-blur-xl pb-safe">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 text-xs text-zinc-500 sm:px-6">
          <p>
            <span className="font-semibold text-emerald-400">TradeFinance</span> · PWA · Supabase
          </p>
          <p className="num-mono">{new Date().getFullYear()} · v2.0</p>
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
