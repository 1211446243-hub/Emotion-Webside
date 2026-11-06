"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-state";
import { paymentService } from "@/lib/payment/payment-service";
import { commerceConfig } from "@/config/commerce";
import type { Purchase } from "@/types/commerce";

const labels = { pending: "待完成", paid: "已完成", failed: "未完成", refunded: "已退回" };
export function PurchaseHistory() {
  const { user } = useAuth();
  const [state, setState] = useState<{ userId: string; purchases: Purchase[]; error: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = () => paymentService.getPurchases(user.id).then((purchases) => { if (alive) setState({ userId: user.id, purchases, error: "" }); })
      .catch((error) => { if (alive) setState({ userId: user.id, purchases: [], error: error instanceof Error ? error.message : "暂时无法读取购买记录。" }); });
    void load();
    const update = () => { void load(); };
    window.addEventListener("storage", update); window.addEventListener("focus", update);
    return () => { alive = false; window.removeEventListener("storage", update); window.removeEventListener("focus", update); };
  }, [user, attempt]);
  const current = user && state?.userId === user.id ? state : null;
  return <section className="profile-page"><p className="eyebrow">YOUR CREATIONS CONTINUE</p><h1>购买记录</h1><p>这里记录你为创作留下的次数。当前均为模拟购买。</p>
    {!current ? <p role="status">正在读取……</p> : current.error ? <><p role="alert">{current.error}</p><button onClick={() => setAttempt((value) => value + 1)}>重试</button></> : current.purchases.length === 0 ? <p>还没有购买记录。</p> : <ul className="purchase-history">{current.purchases.map((purchase) => <li key={purchase.id}><strong>{Object.values(commerceConfig.products).find((product) => product.id === purchase.productId)?.name ?? "作品包"}</strong><span>¥{purchase.amountCny} · {purchase.creationCount} 次创作</span><time dateTime={purchase.createdAt}>{new Date(purchase.createdAt).toLocaleString("zh-CN")}</time><span>{labels[purchase.status]}</span></li>)}</ul>}
    <Link className="quiet-link" href="/me">返回我的空间</Link></section>;
}
