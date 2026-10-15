"use client";

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
      <DialogContent className="glass-strong rounded-2xl border-emerald-400/20">
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

  const fieldCls = "border-white/10 bg-white/5";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-300">
          {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEdit ? "Edit Akun" : "Tambah Akun"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="acc-name" className="text-zinc-400">Nama</Label>
          <Input
            id="acc-name"
            placeholder="mis. Quotex"
            value={form.name}
            onChange={set("name")}
            className={fieldCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-link" className="text-zinc-400">Link</Label>
          <Input
            id="acc-link"
            placeholder="https://..."
            inputMode="url"
            value={form.link}
            onChange={set("link")}
            className={fieldCls}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="acc-user" className="text-zinc-400">ID</Label>
            <Input
              id="acc-user"
              placeholder="username"
              value={form.username}
              onChange={set("username")}
              className={fieldCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-pass" className="text-zinc-400">Password</Label>
            <Input
              id="acc-pass"
              type="text"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              className={fieldCls}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-notes" className="text-zinc-400">Catatan</Label>
          <Textarea
            id="acc-notes"
            placeholder="opsional"
            rows={2}
            value={form.notes}
            onChange={set("notes")}
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
          className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
        >
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan" : "Tambah"}
        </Button>
      </DialogFooter>
    </>
  );
}
