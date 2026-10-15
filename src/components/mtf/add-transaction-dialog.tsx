"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
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
      <DialogContent className="max-w-md">
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
        <DialogTitle className="text-emerald-800">
          {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
        </DialogTitle>
        <DialogDescription>
          {accountName ? `Akun: ${accountName}` : "Pilih jenis & nominal transaksi."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TypeButton
            active={type === "invest"}
            onClick={() => setType("invest")}
            tone="red"
            icon={<ArrowDownToLine className="h-5 w-5" />}
            label="Modal Keluar"
            desc="Investasi / modal masuk akun"
          />
          <TypeButton
            active={type === "profit"}
            onClick={() => setType("profit")}
            tone="green"
            icon={<ArrowUpFromLine className="h-5 w-5" />}
            label="Profit Masuk"
            desc="Hasil / withdraw profit"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tx-amount">Nominal (Rp)</Label>
          <Input
            id="tx-amount"
            inputMode="numeric"
            placeholder="mis. 40000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          />
          {amount && Number(amount) > 0 && (
            <p className="num-mono text-xs text-muted-foreground">
              = Rp {Number(amount).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tx-note">Catatan (opsional)</Label>
          <Textarea
            id="tx-note"
            placeholder="mis. deposit pertama, withdraw profit minggu ke-2"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={submitting}>
          Batal
        </Button>
        <Button
          onClick={submit}
          disabled={submitting}
          className={cn(
            "text-white",
            type === "profit"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-rose-600 hover:bg-rose-700"
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
  desc,
}: {
  active: boolean;
  onClick: () => void;
  tone: "green" | "red";
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
        active
          ? tone === "green"
            ? "border-emerald-500 bg-emerald-50"
            : "border-rose-500 bg-rose-50"
          : "border-border bg-background hover:border-emerald-300"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          tone === "green"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-600"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-[11px] text-muted-foreground">{desc}</span>
    </button>
  );
}
