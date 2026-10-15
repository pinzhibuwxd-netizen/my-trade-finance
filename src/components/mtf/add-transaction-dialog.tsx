"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
} from "lucide-react";
import { apiRequest } from "./use-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  accountId: string | null;
  accountName?: string | null;
  transaction?: Transaction | null;
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSaved,
  accountId,
  accountName,
  transaction,
}: Props) {
  const isEdit = !!transaction;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-2xl border-emerald-400/20">
        {isEdit ? (
          <EditForm
            key={transaction!.id}
            initial={transaction!}
            accountName={accountName}
            onDone={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : (
          <NewForm
            key="new"
            accountId={accountId}
            accountName={accountName}
            onDone={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============== NEW: two independent fields (Modal + Profit) ============== */
function NewForm({
  accountId,
  accountName,
  onDone,
  onSaved,
}: {
  accountId: string | null;
  accountName?: string | null;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [invest, setInvest] = useState("");
  const [profit, setProfit] = useState("");
  const [note, setNote] = useState("");
  const [tradeAt, setTradeAt] = useState(toLocalInput(new Date()));
  const [submitting, setSubmitting] = useState(false);

  const investNum = Number(invest);
  const profitNum = Number(profit);
  const hasInvest = invest !== "" && Number.isFinite(investNum) && investNum > 0;
  const hasProfit = profit !== "" && Number.isFinite(profitNum) && profitNum > 0;
  // net profit = profit - invest (profit bersih)
  const netPreview = (hasProfit ? profitNum : 0) - (hasInvest ? investNum : 0);

  const submit = async () => {
    if (!accountId) {
      toast.error("Akun tidak terpilih");
      return;
    }
    if (!hasInvest && !hasProfit) {
      toast.error("Isi minimal Modal atau Profit");
      return;
    }
    setSubmitting(true);
    const tradeIso = new Date(tradeAt).toISOString();
    const noteVal = note.trim() || undefined;
    let created = 0;
    let lastErr: string | null = null;

    if (hasInvest) {
      const res = await apiRequest("POST", `/api/accounts/${accountId}/transactions`, {
        type: "invest",
        amount: investNum,
        note: noteVal,
        trade_at: tradeIso,
      });
      if (res.ok) created += 1;
      else lastErr = res.error;
    }
    if (hasProfit) {
      const res = await apiRequest("POST", `/api/accounts/${accountId}/transactions`, {
        type: "profit",
        amount: profitNum,
        note: noteVal,
        trade_at: tradeIso,
      });
      if (res.ok) created += 1;
      else lastErr = res.error;
    }
    setSubmitting(false);
    if (created === 0) {
      toast.error(lastErr || "Gagal menyimpan transaksi");
      return;
    }
    toast.success(`${created} transaksi ditambahkan`);
    onDone();
    onSaved();
  };

  const fieldCls = "border-white/10 bg-white/5";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-emerald-300">Tambah Transaksi</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {accountName && <p className="text-xs text-zinc-400">{accountName}</p>}

        {/* Two independent amount fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tx-invest" className="flex items-center gap-1 text-zinc-400">
              <ArrowDownToLine className="h-3 w-3 text-rose-300" /> Modal
            </Label>
            <Input
              id="tx-invest"
              inputMode="numeric"
              placeholder="40000"
              value={invest}
              onChange={(e) => setInvest(e.target.value.replace(/[^0-9]/g, ""))}
              className={cn(fieldCls, "text-rose-200")}
            />
            {hasInvest && (
              <p className="num-mono text-[10px] text-rose-300/70">
                Rp {investNum.toLocaleString("id-ID")}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx-profit" className="flex items-center gap-1 text-zinc-400">
              <ArrowUpFromLine className="h-3 w-3 text-emerald-300" /> Profit
            </Label>
            <Input
              id="tx-profit"
              inputMode="numeric"
              placeholder="130000"
              value={profit}
              onChange={(e) => setProfit(e.target.value.replace(/[^0-9]/g, ""))}
              className={cn(fieldCls, "text-emerald-200")}
            />
            {hasProfit && (
              <p className="num-mono text-[10px] text-emerald-300/70">
                Rp {profitNum.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        {/* net preview */}
        {(hasInvest || hasProfit) && (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-[11px] uppercase tracking-widest text-zinc-500">
              Profit Bersih
            </span>
            <span
              className={cn(
                "num-mono text-sm font-semibold",
                netPreview >= 0 ? "text-emerald-300" : "text-rose-300"
              )}
            >
              {netPreview >= 0 ? "+" : "-"}
              Rp {Math.abs(netPreview).toLocaleString("id-ID")}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="tx-time" className="flex items-center gap-1 text-zinc-400">
            <Clock className="h-3 w-3" /> Waktu
          </Label>
          <Input
            id="tx-time"
            type="datetime-local"
            value={tradeAt}
            onChange={(e) => setTradeAt(e.target.value)}
            className={cn(fieldCls, "[color-scheme:dark]")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tx-note" className="text-zinc-400">
            Catatan
          </Label>
          <Textarea
            id="tx-note"
            placeholder="opsional"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onDone}
          disabled={submitting}
          className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5"
        >
          Batal
        </Button>
        <Button
          onClick={submit}
          disabled={submitting || (!hasInvest && !hasProfit)}
          className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
        >
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Tambah
        </Button>
      </DialogFooter>
    </>
  );
}

/* ============== EDIT: single field + type toggle ============== */
function EditForm({
  initial,
  accountName,
  onDone,
  onSaved,
}: {
  initial: Transaction;
  accountName?: string | null;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial.type);
  const [amount, setAmount] = useState(String(initial.amount));
  const [note, setNote] = useState(initial.note ?? "");
  const [tradeAt, setTradeAt] = useState(
    toLocalInput(new Date(initial.trade_at))
  );
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Masukkan nominal valid > 0");
      return;
    }
    setSubmitting(true);
    const res = await apiRequest("PATCH", `/api/transactions/${initial.id}`, {
      type,
      amount: amt,
      note: note.trim() || undefined,
      trade_at: new Date(tradeAt).toISOString(),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error || "Gagal memperbarui transaksi");
      return;
    }
    toast.success("Transaksi diperbarui");
    onDone();
    onSaved();
  };

  const fieldCls = "border-white/10 bg-white/5";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-emerald-300">Edit Transaksi</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {accountName && <p className="text-xs text-zinc-400">{accountName}</p>}

        <div className="grid grid-cols-2 gap-3">
          <TypeButton
            active={type === "invest"}
            onClick={() => setType("invest")}
            tone="red"
            icon={<ArrowDownToLine className="h-5 w-5" />}
            label="Modal"
          />
          <TypeButton
            active={type === "profit"}
            onClick={() => setType("profit")}
            tone="green"
            icon={<ArrowUpFromLine className="h-5 w-5" />}
            label="Profit"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ed-amount" className="text-zinc-400">
              Nominal
            </Label>
            <Input
              id="ed-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className={fieldCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ed-time" className="flex items-center gap-1 text-zinc-400">
              <Clock className="h-3 w-3" /> Waktu
            </Label>
            <Input
              id="ed-time"
              type="datetime-local"
              value={tradeAt}
              onChange={(e) => setTradeAt(e.target.value)}
              className={cn(fieldCls, "[color-scheme:dark]")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ed-note" className="text-zinc-400">
            Catatan
          </Label>
          <Textarea
            id="ed-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onDone}
          disabled={submitting}
          className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5"
        >
          Batal
        </Button>
        <Button
          onClick={submit}
          disabled={submitting}
          className={cn(
            "text-white",
            type === "profit"
              ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              : "bg-rose-500 hover:bg-rose-600"
          )}
        >
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </DialogFooter>
    </>
  );
}

function TypeButton({
  active,
  onClick,
  tone,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  tone: "green" | "red";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all",
        active
          ? tone === "green"
            ? "border-emerald-400/60 bg-emerald-400/10"
            : "border-rose-400/60 bg-rose-400/10"
          : "border-white/10 bg-white/5 hover:border-emerald-400/30"
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg",
          tone === "green"
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-rose-400/15 text-rose-300"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium text-zinc-100">{label}</span>
    </button>
  );
}
