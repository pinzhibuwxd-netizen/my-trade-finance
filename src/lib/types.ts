export type TransactionType = "invest" | "profit";

export interface Account {
  id: string;
  name: string;
  link: string;
  username: string;
  password: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface AccountSummary {
  account_id: string;
  name: string;
  link: string;
  username: string;
  password: string;
  notes: string | null;
  total_invested: number;
  total_profit: number;
  net_profit: number;
  tx_count: number;
  last_tx_at: string | null;
}

export interface DashboardStats {
  totalInvested: number;
  totalProfit: number;
  netProfit: number;
  accountCount: number;
  txCount: number;
  bestAccountId: string | null;
  bestAccountName: string | null;
  bestAccountProfit: number;
}

/** Account with its live computed summary + recent transactions. */
export interface AccountDetail extends Account {
  total_invested: number;
  total_profit: number;
  net_profit: number;
  tx_count: number;
  last_tx_at: string | null;
}

export function formatIDR(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return (
    sign +
    "Rp " +
    abs.toLocaleString("id-ID", { maximumFractionDigits: 0 })
  );
}

export function formatIDRShort(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)}M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(2)}jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(1)}rb`;
  return `${sign}Rp ${abs}`;
}
