"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-state";

const subscribe = () => () => undefined;
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const router = useRouter(); const path = usePathname();
  useEffect(() => { if (ready && !user) router.replace(`/login?returnTo=${encodeURIComponent(path)}`); }, [ready, user, router, path]);
  if (!ready || !user) return <p className="page-loading" role="status">正在打开你的时刻……</p>;
  return children;
}
