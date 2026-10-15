import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/accounts -> list all accounts with their financial summary
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("v_account_summary")
    .select("*")
    .order("last_tx_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ accounts: data ?? [] });
}

// POST /api/accounts -> create a new account
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, link, username, password, notes } = body ?? {};

  if (!name || !link || !username || !password) {
    return NextResponse.json(
      { error: "name, link, username, password wajib diisi" },
      { status: 400 }
    );
  }

  let normalizedLink = String(link).trim();
  if (!/^https?:\/\//i.test(normalizedLink)) {
    normalizedLink = "https://" + normalizedLink;
  }

  const { data, error } = await supabaseAdmin
    .from("accounts")
    .insert({
      name: String(name).trim(),
      link: normalizedLink,
      username: String(username).trim(),
      password: String(password),
      notes: notes ? String(notes).trim() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ account: data }, { status: 201 });
}
