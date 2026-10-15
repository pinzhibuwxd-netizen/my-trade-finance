"use client";

import { useCallback, useState } from "react";
import { Plus, RefreshCw, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/components/mtf/summary-cards";
import {
  AreaChartTimeline,
  AccountOverview,
  PatternDayHour,
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
import { cn } from "@/lib/utils";

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

  const isProfit = stats ? stats.netProfit >= 0 : true;
  const winRate = stats?.winRate ?? 0;

  return (
    <div className="relative min-h-screen bg-tech-grid">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="glow grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-emerald-500/10">
              <img
                src="/icons/icon-192.png"
                alt="My Trade Finance"
                className="h-8 w-8 object-contain"
              />
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
        {/* ===== Hero (card turns green on Profit / red on Loss) ===== */}
        <section
          className={cn(
            "glass relative mb-5 overflow-hidden rounded-2xl border",
            !stats || stats.txCount === 0
              ? "border-emerald-400/20"
              : isProfit
              ? "border-emerald-400/50"
              : "border-rose-400/50"
          )}
          style={{
            boxShadow:
              stats && stats.txCount > 0
                ? isProfit
                  ? "0 0 40px -6px oklch(0.78 0.18 155 / 0.45)"
                  : "0 0 40px -6px oklch(0.68 0.22 22 / 0.45)"
                : undefined,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                stats && stats.txCount > 0
                  ? isProfit
                    ? "radial-gradient(120% 120% at 100% 0%, oklch(0.78 0.18 155 / 0.22) 0%, transparent 55%), radial-gradient(120% 120% at 0% 100%, oklch(0.65 0.2 150 / 0.16) 0%, transparent 55%)"
                    : "radial-gradient(120% 120% at 100% 0%, oklch(0.68 0.22 22 / 0.22) 0%, transparent 55%), radial-gradient(120% 120% at 0% 100%, oklch(0.58 0.22 25 / 0.16) 0%, transparent 55%)"
                  : "radial-gradient(120% 120% at 0% 0%, oklch(0.85 0.13 168 / 0.12) 0%, transparent 50%), radial-gradient(120% 120% at 100% 0%, oklch(0.78 0.18 155 / 0.14) 0%, transparent 55%)",
            }}
          />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest",
                    !stats || stats.txCount === 0
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : isProfit
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                      : "border-rose-400/40 bg-rose-400/15 text-rose-200"
                  )}
                >
                  <TrendingUp className="h-3 w-3" /> Profit Bersih
                </span>
                <h2 className="num-mono mt-2 text-3xl font-bold leading-tight text-glow sm:text-4xl">
                  <span className={isProfit ? "text-emerald-300" : "text-rose-300"}>
                    {stats
                      ? `${stats.netProfit >= 0 ? "+" : ""}${new Intl.NumberFormat(
                          "id-ID",
                          {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }
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

              {/* Profit / Loss status badge */}
              {stats && stats.txCount > 0 && (
                <div
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl border px-4 py-2.5 backdrop-blur-md",
                    isProfit
                      ? "border-emerald-400/50 bg-emerald-400/15"
                      : "border-rose-400/50 bg-rose-400/15"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-glow",
                      isProfit ? "text-emerald-300" : "text-rose-300"
                    )}
                  >
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {isProfit ? "Profit" : "Loss"}
                  </span>
                  <span className="num-mono text-[11px] text-zinc-400">
                    {Math.round(winRate)}% win
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== Summary cards ===== */}
        <section className="mb-5">
          <SummaryCards stats={stats ?? null} loading={loading} />
        </section>

        {/* ===== Perjalanan profit (journey) ===== */}
        <section className="mb-5">
          <AreaChartTimeline
            transactions={transactions}
            loading={timelineQ.loading}
          />
        </section>

        {/* ===== Combined Ringkasan Akun (replaces donut + bar) ===== */}
        <section className="mb-6">
          <AccountOverview accounts={accounts} loading={accountsQ.loading} />
        </section>

        {/* ===== POLA WAKTU ===== */}
        <section className="mb-7">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
              Pola Waktu
            </h2>
          </div>
          <div className="space-y-4">
            <PatternPrimeBadges patterns={patterns} />
            <PatternDayHour patterns={patterns} loading={patternsQ.loading} />
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
            <span className="font-semibold text-emerald-400">TradeFinance</span>
          </p>
          <p>
            Developed by{" "}
            <span className="font-semibold text-zinc-300">Syamsul Huda</span>
          </p>
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
