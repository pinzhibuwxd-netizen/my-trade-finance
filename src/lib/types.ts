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
  trade_at: string;
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
  profitCount: number;
  investCount: number;
  winRate: number;
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

export interface DayPattern {
  day_index: number; // 0=Sun..6=Sat
  day_name: string;
  total_invested: number;
  total_profit: number;
  net: number;
  count: number;
  profit_count: number;
}

export interface HourPattern {
  hour: number; // 0..23
  total_invested: number;
  total_profit: number;
  net: number;
  count: number;
  profit_count: number;
}

export interface DayHourCell {
  day_index: number;
  hour: number;
  net: number;
  count: number;
}

export interface Patterns {
  byDay: DayPattern[];
  byHour: HourPattern[];
  heatmap: DayHourCell[];
  prime: {
    day_index: number | null;
    day_name: string | null;
    hour: number | null;
    net: number;
    count: number;
  } | null;
  primeDay: {
    day_index: number | null;
    day_name: string | null;
    net: number;
  } | null;
  primeHour: {
    hour: number | null;
    net: number;
  } | null;
}

export const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const DAY_NAMES_FULL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export interface TimelineTx {
  id: string;
  account_id: string;
  account_name: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  trade_at: string;
  created_at: string;
}
