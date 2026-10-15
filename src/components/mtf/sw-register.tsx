"use client";

import { useEffect } from "react";

/** Registers the PWA service worker on the client. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // only in prod to avoid caching dev assets

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* swallow — non-critical */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
