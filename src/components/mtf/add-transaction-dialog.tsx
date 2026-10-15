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
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
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
  // format YYYY-MM-DDTHH:MM for datetime-local input
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
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
        <TransactionForm
          key={transaction?.id ?? "new"}
          initial={transaction}
          isEdit={isEdit}
          accountId={accountId}
          accountName={accountName}
          onDone={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  initial,
  isEdit,
  accountId,
  accountName,
  onDone,
  onSaved,
}: {
  initial?: Transaction | null;
  isEdit: boolean;
  accountId: string | null;
  accountName?: string | null;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "invest");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [tradeAt, setTradeAt] = useState(
    toLocalInput(
      initial?.trade_at ? new Date(initial.trade_at) : new Date()
    )
  );
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!accountId) {
      toast.error("Akun tidak terpilih");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Masukkan nominal valid > 0");
      return;
    }
    setSubmitting(true);
    const url = isEdit
      ? `/api/transactions/${initial!.id}`
      : `/api/accounts/${accountId}/transactions`;
    const method = isEdit ? "PATCH" : "POST";
    const res = await apiRequest(method, url, {
      type,
      amount: amt,
      note: note.trim() || undefined,
      trade_at: new Date(tradeAt).toISOString(),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan transaksi");
      return;
    }
    toast.success(isEdit ? "Transaksi diperbarui" : "Transaksi ditambahkan");
    onDone();
    onSaved();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-emerald-300">
          {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {accountName && (
          <p className="text-xs text-zinc-400">{accountName}</p>
        )}
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
            <Label htmlFor="tx-amount" className="text-zinc-400">
              Nominal
            </Label>
            <Input
              id="tx-amount"
              inputMode="numeric"
              placeholder="40000"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx-time" className="flex items-center gap-1 text-zinc-400">
              <Clock className="h-3 w-3" /> Waktu
            </Label>
            <Input
              id="tx-time"
              type="datetime-local"
              value={tradeAt}
              onChange={(e) => setTradeAt(e.target.value)}
              className="border-white/10 bg-white/5 [color-scheme:dark]"
            />
          </div>
        </div>
        {amount && Number(amount) > 0 && (
          <p className="num-mono text-xs text-emerald-300/80">
            Rp {Number(amount).toLocaleString("id-ID")}
          </p>
        )}

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
            className="border-white/10 bg-white/5"
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
          {isEdit ? "Simpan" : "Tambah"}
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
