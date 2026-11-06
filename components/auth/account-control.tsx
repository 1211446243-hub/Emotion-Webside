"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth-state";
import { authService } from "@/lib/auth/auth-service";

export function AccountControl({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  if (!user) return <Link className="account-link" href="/login?returnTo=%2F%23create" onClick={onNavigate}>登录</Link>;
  return <div className="account-control"><Link href="/me" className="account-name" title="我的空间" onClick={onNavigate}>{user.name}</Link><button type="button" onClick={async () => {
    try { await authService.logout(); setError(""); }
    catch { setError("暂时无法退出，请重试。"); }
  }}>退出</button>{error && <span role="alert">{error}</span>}</div>;
}
