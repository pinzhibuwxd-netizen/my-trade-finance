"use client";

import { useCallback, useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Simple fetch hook with manual refetch. */
export function useFetch<T>(url: string | null) {
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    loading: !!url,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ data: null, error: null, loading: false });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json();
        if (!active) return;
        if (!r.ok) {
          setState({ data: null, error: json.error || "Request gagal", loading: false });
        } else {
          setState({ data: json as T, error: null, loading: false });
        }
      })
      .catch((e) => {
        if (!active) return;
        setState({ data: null, error: String(e), loading: false });
      });
    return () => {
      active = false;
    };
  }, [url, reloadKey]);

  return { ...state, refetch };
}

/** Generic POST/PATCH/DELETE helper that returns { ok, data, error }. */
export async function apiRequest<T = any>(
  method: "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error || "Request gagal", status: res.status };
    }
    return { ok: true, data: json as T, status: res.status };
  } catch (e: any) {
    return { ok: false, error: String(e), status: 0 };
  }
}
