"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-state";
import { useCreationBalance } from "@/components/commerce/use-creation-balance";
import { armDebugFailure, setDebugBalance, type debugPresets } from "@/lib/debug/service";
const presets: [keyof typeof debugPresets, string][] = [["free3", "免费 3 次"], ["free1", "免费 1 次"], ["free0", "免费耗尽"], ["paid5", "已购买 5 次"], ["empty", "全部耗尽"]];
export function DebugPanel() {
  const { user } = useAuth(); const balance = useCreationBalance(user?.id ?? null);
  const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  if (process.env.NODE_ENV !== "development") return null;
  if (!user) return <section className="profile-page"><h1>开发调试</h1><Link href="/login">先登录 Mock 账号</Link></section>;
  const run = async (action: () => void | Promise<void>) => { setBusy(true); try { await action(); setNotice("测试状态已设置。"); } catch (error) { setNotice(error instanceof Error ? error.message : "设置失败。"); } finally { setBusy(false); } };
  return <section className="profile-page"><p className="eyebrow">DEVELOPMENT ONLY</p><h1>开发调试</h1><p>免费 {balance.balance?.freeRemaining ?? "—"} 次 · 完整创作 {balance.balance?.paidRemaining ?? "—"} 次</p><p>以下设置调整当前用户额度，保留作品与购买记录。“已购买 5 次”仅模拟余额，不创建订单。</p><div className="action-row">{presets.map(([key, label]) => <button key={key} disabled={busy} onClick={() => void run(() => setDebugBalance(user.id, key))}>{label}</button>)}</div><button disabled={busy} onClick={() => void run(() => armDebugFailure())}>模拟下一次生成失败</button><p>失败开关只影响本标签页下一次生成，触发后自动清除。</p><p role="status">{notice || balance.error}</p><Link className="quiet-link" href="/#create">回到创作</Link><Link className="quiet-link" href="/me/purchases">购买记录</Link></section>;
}
