"use client";

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
import { Loader2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "./use-fetch";
import { toast } from "sonner";
import type { AccountSummary } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  account?: AccountSummary | null;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  onSaved,
  account,
}: Props) {
  const isEdit = !!account;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* key remounts the form whenever the target changes so useState initializers re-run */}
        <AccountForm
          key={account?.account_id ?? "new"}
          initial={account}
          isEdit={isEdit}
          onDone={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function AccountForm({
  initial,
  isEdit,
  onDone,
  onSaved,
}: {
  initial?: AccountSummary | null;
  isEdit: boolean;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    link: initial?.link ?? "",
    username: initial?.username ?? "",
    password: initial?.password ?? "",
    notes: initial?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (
      !form.name.trim() ||
      !form.link.trim() ||
      !form.username.trim() ||
      !form.password.trim()
    ) {
      toast.error("Lengkapi nama, link, ID, dan password");
      return;
    }
    setSubmitting(true);
    const url = isEdit ? `/api/accounts/${initial!.account_id}` : "/api/accounts";
    const method = isEdit ? "PATCH" : "POST";
    const res = await apiRequest(method, url, {
      name: form.name.trim(),
      link: form.link.trim(),
      username: form.username.trim(),
      password: form.password,
      notes: form.notes.trim() || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan akun");
      return;
    }
    toast.success(isEdit ? "Akun diperbarui" : "Akun ditambahkan");
    onDone();
    onSaved();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-800">
          {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEdit ? "Edit Akun" : "Tambah Akun Investasi"}
        </DialogTitle>
        <DialogDescription>
          Catat kredensial website investasi kamu. Semua tersimpan aman di database Supabase.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="acc-name">Nama Akun / Website</Label>
          <Input
            id="acc-name"
            placeholder="mis. Binomo, Quotex, Olymp Trade"
            value={form.name}
            onChange={set("name")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-link">Link Website</Label>
          <Input
            id="acc-link"
            placeholder="https://contoh-investasi.com"
            inputMode="url"
            value={form.link}
            onChange={set("link")}
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="acc-user">ID / Username</Label>
            <Input
              id="acc-user"
              placeholder="email atau username"
              value={form.username}
              onChange={set("username")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-pass">Password</Label>
            <Input
              id="acc-pass"
              type="text"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-notes">Catatan (opsional)</Label>
          <Textarea
            id="acc-notes"
            placeholder="mis. total saldo awal, strategi, dsb."
            rows={2}
            value={form.notes}
            onChange={set("notes")}
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
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Tambah Akun"}
        </Button>
      </DialogFooter>
    </>
  );
}
