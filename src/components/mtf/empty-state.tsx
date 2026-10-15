"use client";

import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-14 text-center">
      <div className="relative mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <Wallet className="h-9 w-9" />
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Mulai catat akun investasi kamu
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Tambahkan akun website investasi pertamamu. Setiap akun bisa mencatat
        transaksi modal & profit agar profit bersihnya otomatis terhitung.
      </p>
      <Button
        onClick={onAdd}
        className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Tambah Akun Pertama
      </Button>
    </div>
  );
}
