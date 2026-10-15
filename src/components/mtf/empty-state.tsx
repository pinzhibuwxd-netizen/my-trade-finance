"use client";

import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
      <div className="relative mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-400/10 text-emerald-300 glow">
        <Wallet className="h-9 w-9" />
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-emerald-950 shadow">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">
        Mulai catat akun investasi
      </h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-400">
        Tambahkan akun pertamamu untuk mulai mencatat transaksi & profit.
      </p>
      <Button
        onClick={onAdd}
        className="mt-5 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Tambah Akun
      </Button>
    </div>
  );
}
