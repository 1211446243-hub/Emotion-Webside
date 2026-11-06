"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { artworkService } from "@/lib/storage/artwork-service";
import { authService } from "@/lib/auth/auth-service";

/** Reload on same-tab writes, other tabs, and account changes. */
export function useArtworkQuery<T>(load: () => Promise<T>) {
  const revision = useSyncExternalStore(artworkService.subscribe, artworkService.getSnapshot, () => null);
  const session = useSyncExternalStore(authService.subscribe, authService.getSessionSnapshot, () => null);
  const [result, setResult] = useState<{ data?: T; error?: string; loaded: boolean; source?: typeof load; session?: string | null }>({ loaded: false });
  const [retry, setRetry] = useState(0);
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    const refresh = () => setSeen((value) => value + 1);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(load).then((data) => { if (active) setResult({ data, loaded: true, source: load, session }); })
      .catch((error: unknown) => { if (active) setResult({ error: error instanceof Error ? error.message : "暂时无法读取作品。", loaded: true, source: load, session }); });
    return () => { active = false; };
  }, [load, revision, session, retry, seen]);
  const current = result.source === load && result.session === session;
  return { data: current ? result.data : undefined, error: current ? result.error : undefined, loaded: current && result.loaded, retry: () => setRetry((value) => value + 1) };
}
