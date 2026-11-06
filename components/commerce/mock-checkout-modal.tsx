"use client";

import { useEffect, useRef, useState } from "react";
import { commerceConfig } from "@/config/commerce";
import { paymentService } from "@/lib/payment/payment-service";
import type { CreationBalance, Purchase } from "@/types/commerce";

interface CompletedPurchase { purchase: Purchase; balance: CreationBalance }

export function MockCheckoutModal({ userId, onClose, onCompleted }: { userId: string; onClose: () => void; onCompleted: (result: CompletedPurchase) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const completed = useRef<CompletedPurchase | null>(null);
  const paymentId = useRef<string | null>(null);
  const submitting = useRef(false);
  const [phase, setPhase] = useState<"ready" | "pending" | "success">("ready");
  const [error, setError] = useState("");
  const product = commerceConfig.products.starterPack;

  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    return () => { element?.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);

  useEffect(() => {
    if (phase !== "success" || !completed.current) return;
    const timer = window.setTimeout(() => { if (completed.current) onCompleted(completed.current); }, 900);
    return () => window.clearTimeout(timer);
  }, [phase, onCompleted]);

  const submit = async () => {
    if (phase !== "ready" || submitting.current) return;
    submitting.current = true;
    setPhase("pending"); setError("");
    try {
      // Retry the same order if payment verification or credit persistence failed.
      if (!paymentId.current) {
        const checkout = await paymentService.createCheckout(product.id, userId);
        paymentId.current = checkout.paymentId;
      }
      completed.current = await paymentService.completeCheckout(paymentId.current);
      setPhase("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "模拟购买没有完成，请再试一次。");
      setPhase("ready");
    } finally {
      submitting.current = false;
    }
  };

  return <dialog ref={dialog} className="commerce-dialog checkout-dialog" aria-labelledby="checkout-title" aria-describedby="checkout-description" onCancel={(event) => { event.preventDefault(); if (phase === "ready") onClose(); }}>
    {phase === "success" ? <div className="checkout-success" role="status"><p className="eyebrow">READY TO CONTINUE</p><h2 id="checkout-title">可以继续创作了。</h2><p id="checkout-description">{product.creationCount} 次完整创作已加入。</p><span aria-hidden="true">—</span></div> : <>
      <p className="eyebrow">MOCK CHECKOUT</p><h2 id="checkout-title">{product.name}</h2>
      <p id="checkout-description">这是开发环境中的模拟购买。<br />不会产生真实费用。</p>
      <div className="checkout-summary"><span>{product.creationCount} 次完整创作</span><strong>¥{product.priceCny}</strong></div>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <div className="commerce-dialog-actions"><button ref={cancel} type="button" className="secondary-action" disabled={phase === "pending"} onClick={onClose}>取消</button><button type="button" className="primary-action" disabled={phase === "pending"} onClick={() => void submit()}>{phase === "pending" ? "正在完成……" : "模拟购买成功"}</button></div>
    </>}
  </dialog>;
}
